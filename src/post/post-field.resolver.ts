import { Resolver, ResolveField, Parent } from '@nestjs/graphql';
import { Post } from '../post/entities/post.entity';
import { PrismaService } from 'src/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Tag } from 'src/tag/entities/tag.entity';

@Resolver(of => Post)  // Note que esse resolver é para o tipo Post
@Injectable()
export class PostFieldsResolver {
  constructor(
    private readonly prisma: PrismaService  // Injeção do PrismaService
  ) {}

  @ResolveField(() => [Tag])
  async tags(@Parent() post: Post) {
    const postTags = await this.prisma.postTag.findMany({
      where: { postId: post.id },
      include: { tag: true }
    });
    
    // Extraindo apenas os objetos Tag do relacionamento
    return postTags.map(postTag => postTag.tag);
  }
}