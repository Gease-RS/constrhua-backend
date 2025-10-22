import { Module } from '@nestjs/common';
import { ReplyService } from './reply.service';
import { ReplyResolver } from './reply.resolver';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ReplyResolver, ReplyService, PrismaService],
})
export class ReplyModule {}
