import { Injectable, InternalServerErrorException, NotFoundException, Logger, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostInput } from './dto/create-post.input';
import { UpdatePostInput } from './dto/update-post.input';
import { SlugService } from 'src/shared/slug.service';

@Injectable()
export class PostService {
  private readonly logger = new Logger(PostService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly slugService: SlugService
  ) { }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async create(createPostInput: CreatePostInput) {
    // 1. Validação inicial
    if (!createPostInput.authorId || !createPostInput.categories?.length) {
      throw new Error('Autor e categorias são obrigatórios');
    }

    // 2. Processamento seguro de tags
    const tagRecords = [];
    if (createPostInput.tags?.length) {
      for (const tagName of createPostInput.tags) {
        if (tagName?.trim()) {
          const tagSlug = this.slugService.generate(tagName);
          const tag = await this.prisma.tag.upsert({
            where: { slug: tagSlug },
            create: { name: tagName, slug: tagSlug },
            update: {}
          });
          tagRecords.push(tag);
        }
      }
    }

    // 1. Primeiro, defina um tipo auxiliar para as imagens
    type ImageCreateInput = {
      url: string;
      alt?: string;
      type: 'image' | 'video'; // Deve corresponder ao enum do Prisma
    };

    // 2. Modifique a criação do post
    try {
      const post = await this.prisma.post.create({
        data: {
          title: createPostInput.title,
          content: createPostInput.content,
          published: createPostInput.published ?? true,
          slug: this.generateSlug(createPostInput.title),
          author: { connect: { id: createPostInput.authorId } },
          categories: { connect: createPostInput.categories.map(id => ({ id })) },
          images: createPostInput.images?.length ? {
            create: createPostInput.images.map((img): ImageCreateInput => ({
              url: img.url,
              alt: img.alt || `Imagem para ${createPostInput.title}`,
              type: img.type.toLowerCase() as 'image' | 'video' // Type assertion
            }))
          } : undefined
        },
        include: { author: true, categories: true, images: true }
      });

      // 4. Conexão das tags (se houver)
      if (tagRecords.length) {
        await this.prisma.postTag.createMany({
          data: tagRecords.map(tag => ({
            postId: post.id,
            tagId: tag.id
          }))
        });
      }

      return {
        ...post,
        tags: tagRecords // Retorna as tags já processadas
      };

    } catch (error) {
      this.logger.error('Erro ao criar post', error.stack);
      throw new Error('Falha ao criar post');
    }
  }
  //End create

  async findAll() {
    try {
      const posts = await this.prisma.post.findMany({
        include: {
          author: true,
          categories: true,
          images: true,
          tags: { // Isso se refere à relação no seu schema Prisma
            include: {
              tag: true // Inclui os dados completos da tag
            }
          }
        },
      });
  
      // Transforma a estrutura para retornar diretamente as tags
      return posts.map(post => ({
        ...post,
        tags: post.tags.map(postTag => postTag.tag) // Acessa via relação tags->tag
      }));
    } catch (error) {
      // --- IMPORTANTE: NUNCA envie 'error' diretamente para o frontend ---
  
      // 1. Log detalhado do erro no servidor (para depuração)
      console.error("Erro ao buscar posts no banco de dados:", error);
  
      // 2. Lance um erro genérico para o consumidor da API (frontend)
      // Isso evita que informações sensíveis do servidor ou do banco de dados sejam expostas.
      throw new Error("Não foi possível carregar os posts. Por favor, tente novamente mais tarde.");
    }
  }
  async findOne(id: number) {
    return this.prisma.post.findUnique({
      where: { id },
      include: {
        author: true,
        categories: true,
        images: true,
        tags: true,
      },
    });
  }

  async update(id: number, data: UpdatePostInput) {
    const { categories, images, title, tags, ...updateData } = data;

    const slug = title ? this.generateSlug(title) : undefined;

    // 1. Garante que todas as tags existam no banco
    let tagRecords = [];
    if (tags?.length) {
      tagRecords = await Promise.all(
        tags.map(async (tagName) => {
          const tagSlug = this.slugService.generate(tagName);

          const existingTag = await this.prisma.tag.findUnique({ where: { slug: tagSlug } });

          if (existingTag) return existingTag;

          return this.prisma.tag.create({
            data: {
              name: tagName,
              slug: tagSlug,
            },
          });
        })
      );
    }

    // 2. Atualiza o post
    const post = await this.prisma.post.update({
      where: { id },
      data: {
        ...updateData,
        ...(slug && { slug }),
        ...(title && { title }),
        categories: categories?.length
          ? {
            set: categories.map((id) => ({ id })),
          }
          : undefined,
        images: images?.length
          ? {
            deleteMany: {}, // deleta todas as imagens anteriores
            create: images.map((img) => ({
              url: img.url,
              alt: img.alt,
              type: img.type,
            })),
          }
          : undefined,
      },
    });

    // 3. Remove relações antigas de tags
    if (tags?.length) {
      await this.prisma.postTag.deleteMany({
        where: { postId: post.id },
      });

      // 4. Cria novas relações PostTag
      await Promise.all(
        tagRecords.map((tag) =>
          this.prisma.postTag.create({
            data: {
              postId: post.id,
              tagId: tag.id,
            },
          })
        )
      );
    }

    // 5. Retorna o post com as relações
    return this.prisma.post.findUnique({
      where: { id: post.id },
      include: {
        categories: true,
        images: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }


  async remove(id: number) {
    console.log('Tentando deletar post com id:', id);
    try {
      await this.prisma.post.delete({
        where: { id },
      });
      return { message: 'Post deletado com sucesso!' };
    } catch (error) {
      console.error('Erro ao deletar post:', error); // Adicione isso
      if (error.code === 'P2025') {
        throw new NotFoundException(`Post com ID ${id} não encontrado`);
      }
  
      throw new InternalServerErrorException(
        'Erro ao deletar o post. Tente novamente mais tarde.',
      );
    }
  }
  


  async findBySlug(slug: string) {
    return this.prisma.post.findUnique({
      where: { slug },
      include: { author: true, categories: true, images: true },
    });
  }

}

