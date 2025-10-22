import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReplyInput } from './dto/create-reply.input';
import { UpdateReplyInput } from './dto/update-reply.input';

@Injectable()
export class ReplyService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateReplyInput) {
    const reply = await this.prisma.reply.create({
      data,
      include: {
        user: true,
        comment: true,
        _count: {
          select: { likes: true },
        },
      },
    });
  
    return {
      ...reply,
      likeCount: reply._count.likes,
    };
  }
  

async findAll() {
  const replies = await this.prisma.reply.findMany({
    include: {
      user: true,
      comment: true,
      _count: {
        select: { likes: true },
      },
    },
  });

  return replies.map((reply) => ({
    ...reply,
    likeCount: reply._count.likes,
  }));
}

async findOne(id: number) {
  const reply = await this.prisma.reply.findUnique({
    where: { id },
    include: {
      user: true,
      comment: true,
      _count: {
        select: { likes: true },
      },
    },
  });

  return {
    ...reply,
    likeCount: reply._count.likes,
  };
}


  update(id: number, data: UpdateReplyInput) {
    return this.prisma.reply.update({
      where: { id },
      data,
    });
  }

  remove(id: number) {
    return this.prisma.reply.delete({ where: { id } });
  }
}
