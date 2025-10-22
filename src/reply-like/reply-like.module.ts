// src/reply-like/reply-like.module.ts
import { Module } from '@nestjs/common';
import { ReplyLikeService } from './reply-like.service';
import { ReplyLikeResolver } from './reply-like.resolver';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ReplyLikeResolver, ReplyLikeService],
})
export class ReplyLikeModule {}
