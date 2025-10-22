import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SlugService } from 'src/shared/slug.service';
import { Prisma } from '@prisma/client';
import { TagMapper } from './tag.mapper';

@Injectable()
export class TagService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly slugService: SlugService
  ) { }

  async createOrUpdateTags(tags: string[]) {
    return Promise.all(
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

  async findAll({
    skip,
    take,
    search,
  }: {
    skip?: number;
    take?: number;
    search?: string;
  } = {}) {
    const where: Prisma.TagWhereInput = search
      ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
        ],
      }
      : {};

    return this.prisma.tag.findMany({
      where,
      skip,
      take,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    const tag = await this.prisma.tag.findUnique({ where: { id } });
    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }
    return tag;
  }

  async findByIds(ids: number[]) {
    return this.prisma.tag.findMany({
      where: { id: { in: ids } },
    });
  }

  async getTagWithPosts(slug: string) {
    const tag = await this.prisma.tag.findUnique({
      where: { slug },
      include: {
        posts: {
          include: {
            post: {
              include: {
                tags: {
                  include: {
                    tag: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!tag) {
      throw new Error('Tag não encontrada');
    }

    return {
      ...tag,
      posts: tag.posts.map(postTag => ({
        ...postTag.post,
        tags: postTag.post.tags.map(tagRel => tagRel.tag)
      }))
    };
  }

  async findBySlug(slug: string) {
    const tag = await this.prisma.tag.findUnique({ where: { slug } });
    if (!tag) {
      throw new NotFoundException(`Tag with slug "${slug}" not found`);
    }
    return tag;
  }

  async remove(id: number) {
    const tag = await this.prisma.tag.findUnique({ where: { id } });
    if (!tag) throw new NotFoundException(`Tag com ID ${id} não encontrada`);
    const postsWithTag = await this.prisma.post.count({
      where: {
        tags: {
          some: {
            tagId: id 
          }
        }
      },
    });
    if (postsWithTag > 0) {
      throw new ConflictException(
        `Não é possível deletar a tag "${tag.name}" pois está vinculada a ${postsWithTag} posts`
      );
    }
    return this.prisma.tag.delete({ where: { id } });
  }
  /**
assignable to type 'TagWithPosts'.
  Type 'TagWithPosts' is not assignable to type '{ posts: ({ post: { categories: { id: number; name: string; }[]; images: { id: number; url: string; alt: string; type: MediaType; postId: number; }[];
   */
  async getPostsByTagSlug(slug: string): Promise<TagWithPosts | null> {
    const tag = await this.prisma.tag.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        posts: {
          select: {
            post: {
              select: {
                id: true,
                title: true,
                slug: true,
                createdAt: true,
              }
            }
          }
        }
      }
    });
  
    if (!tag) {
      return null; 
    }
  
    return TagMapper.toGraphQL(tag);
  }

  /*
  model Post {
  id         Int        @id @default(autoincrement())
  title      String
  slug       String?    @unique
  content    String
  published  Boolean    @default(false)
  author     User       @relation(fields: [authorId], references: [id])
  authorId   Int
  categories Category[] @relation("PostCategories")
  comments   Comment[]
  images     Image[]
  tags       PostTag[]
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt
}

model Tag {
  id    Int     @id @default(autoincrement())
  name  String  @unique
  slug  String  @unique
  posts PostTag[]
}

model PostTag {
  post    Post @relation(fields: [postId], references: [id])
  postId  Int
  tag     Tag  @relation(fields: [tagId], references: [id])
  tagId   Int

  @@id([postId, tagId])
}
  */

  async getPostsByTag(tagId: number) {
    return this.prisma.post.findMany({
      where: {
        tags: {
          some: { tagId } 
        }
      },
      include: {
        categories: true,
        images: true,
        tags: {
          include: { tag: true }
        }
      }
    });
  }

  async getPopularTags(limit = 10) {
    return this.prisma.$queryRaw`
      SELECT t.id, t.name, t.slug, COUNT(pt.post_id) as post_count
      FROM tags t
      LEFT JOIN _PostToTag pt ON t.id = pt.B
      GROUP BY t.id
      ORDER BY post_count DESC
      LIMIT ${limit}
    `;
  }
}

