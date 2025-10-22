import { PrismaService } from 'src/prisma/prisma.service';
import { UpdatePostInput } from './dto/update-post.input';
import { Injectable } from '@nestjs/common';
import { TagService } from 'src/tag/tag.service'; 
import { SlugService } from 'src/shared/slug.service';

@Injectable()
export class PostUpdateService {
  constructor(
    private prisma: PrismaService,
    private slugService: SlugService,
    private tagService: TagService, 
  ) {}
  
  async postUpdate(id: number, data: UpdatePostInput) {
    const { categories, images, title, tags, ...updateData } = data;

    // 1. Garante que o slug seja gerado apenas quando necessário
    const slug = title ? this.slugService.generate(title) : undefined;

    // 2. Garante que todas as tags existam no banco
    let tagRecords = [];
    if (tags?.length) {
      tagRecords = await this.tagService.createOrUpdateTags(tags);
    }

    // 3. Atualiza o post
    const post = await this.prisma.post.update({
      where: { id },
      data: {
        ...updateData,
        ...(slug && { slug }),
        ...(title && { title }),
        categories: categories?.length
          ? {
              set: categories.map((categoryId) => ({ id: categoryId })),
            }
          : undefined,
        images: images?.length
          ? {
              deleteMany: {}, // deleta todas as imagens antigas
              create: images.map((img) => ({
                url: img.url,
                alt: img.alt,
                type: img.type,
              })),
            }
          : undefined,
      },
    });

    // 4. Remove relações antigas de tags
    if (tags?.length) {
      await this.prisma.postTag.deleteMany({
        where: { postId: post.id },
      });

      // 5. Cria novas relações PostTag
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

    // 6. Retorna o post atualizado com as relações
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
}
