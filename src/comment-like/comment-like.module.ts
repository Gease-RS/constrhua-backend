import { Module } from '@nestjs/common';
import { CommentLikeService } from './comment-like.service';
import { CommentLikeResolver } from './comment-like.resolver';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [CommentLikeResolver, CommentLikeService, PrismaService],
})
export class CommentLikeModule {}
