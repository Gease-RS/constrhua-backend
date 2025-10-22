// src/reply-like/reply-like.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReplyLikeInput } from './dto/create-reply-like.input';

@Injectable()
export class ReplyLikeService {
  constructor(private readonly prisma: PrismaService) {}

  async likeReply(data: CreateReplyLikeInput) {
    return this.prisma.replyLike.create({
      data: {
        replyId: data.replyId,
        userId: data.userId,
      },
      include: {
        user: true,
      },
    });
  }


  async unlikeReply(replyId: number, userId: number) {
    return this.prisma.replyLike.delete({
      where: {
        userId_replyId: {
          userId,
          replyId,
        },
      },
    });
  }


  async countLikes(replyId: number) {
    return this.prisma.replyLike.count({ where: { replyId } });
  }
  
}
