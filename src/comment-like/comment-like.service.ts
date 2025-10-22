import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCommentLikeInput } from './dto/create-comment-like.input';
import { DeleteCommentLikeInput } from './dto/delete-comment-like.input';

@Injectable()
export class CommentLikeService {
  constructor(private readonly prisma: PrismaService) {}

  async like(data: CreateCommentLikeInput) {
    return this.prisma.commentLike.create({
      data: {
        commentId: data.commentId,
        userId: data.userId,
      },
      include: {
        user: true,
      },
    });
  }


  async unlike(data: DeleteCommentLikeInput) {
    return this.prisma.commentLike.delete({
      where: {
        userId_commentId: {
          userId: data.userId,
          commentId: data.commentId,
        },
      },
      include: {
          user: true
      }
    });
  }
}

