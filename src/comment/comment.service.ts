import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentInput } from './dto/create-comment.input';
import { UpdateCommentInput } from './dto/update-comment.input';
import { CommentType } from './comment.type';

@Injectable()
export class CommentService {
  constructor(private readonly prisma: PrismaService) {}

  async createNewComment(data: CreateCommentInput): Promise<CommentType> {
    const userExists = await this.prisma.user.findUnique({
      where: { id: data.userId },
    });
    
    if (!userExists) {
      throw new Error('Usuário não encontrado');
    }
    
    const newComment = await this.prisma.comment.create({
      data: {
        content: data.content,
        postId: data.postId,
        userId: data.userId,
      },
    });
  
    const createdComment = await this.prisma.comment.findUnique({
      where: { id: newComment.id },
      include: {
        user: true,
        post: true,
        likes: {
          include: {
            user: true,
          },
        },
        replies: {
          include: {
            user: true,
            likes: {
              include: {
                user: true,
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });
    
    if (!createdComment) {
      throw new Error('Failed to retrieve created comment');
    }
    
    return {
      id: createdComment.id,
      content: createdComment.content,
      userId: createdComment.userId,
      postId: createdComment.postId,
      user: createdComment.user,
      post: createdComment.post,
      likes: createdComment.likes,
      replies: createdComment.replies.map((reply) => ({
        id: reply.id,
        content: reply.content,
        userId: reply.userId,
        commentId: reply.commentId,
        user: reply.user,
        likes: reply.likes,
        likeCount: reply.likes.length,
        createdAt: reply.createdAt,
        updatedAt: reply.updatedAt,
      })),
      likeCount: createdComment._count.likes,
      createdAt: createdComment.createdAt,
      updatedAt: createdComment.updatedAt,
    };
  }
  
  async findOne(id: number) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: {
        user: true,
        post: true,
        likes: {
          include: {
            user: true,
          },
        },
        replies: {
          include: {
            user: true,
            likes: {
              include: {
                user: true,
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });
  
    if (!comment) {
      return null;
    }
  
    return {
      id: comment.id,
      content: comment.content,
      userId: comment.userId,
      postId: comment.postId,
      user: comment.user,
      post: comment.post,
      likes: comment.likes,
      likeCount: comment._count.likes,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      replies: comment.replies.map((reply) => ({
        id: reply.id,
        content: reply.content,
        userId: reply.userId,
        commentId: reply.commentId,
        user: reply.user,
        likes: reply.likes,
        likeCount: reply.likes.length,
        createdAt: reply.createdAt,
        updatedAt: reply.updatedAt,
      })),
    };
  }

  async findAll() {
    const comments = await this.prisma.comment.findMany({
      include: {
        user: true,
        post: true,
        likes: {
          include: {
            user: true,
          },
        },
        replies: {
          include: {
            user: true,
            likes: {
              include: {
                user: true,
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    return comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      userId: comment.userId,
      postId: comment.postId,
      user: comment.user,
      post: comment.post,
      likes: comment.likes,
      replies: comment.replies.map(reply => ({
        id: reply.id,
        content: reply.content,
        userId: reply.userId,
        commentId: reply.commentId,
        user: reply.user,
        likes: reply.likes,
        likeCount: reply.likes.length,
        createdAt: reply.createdAt,
        updatedAt: reply.updatedAt,
      })),
      likeCount: comment._count.likes,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    }));
  }

  async findByPost(postId: number, currentUserId?: number) {
    const comments = await this.prisma.comment.findMany({
      where: { postId },
      include: {
        user: true,
        post: true,
        likes: {
          include: {
            user: true,
          },
        },
        replies: {
          include: {
            user: true,
            likes: {
              include: {
                user: true,
              },
            },
          },
        },
        _count: {
          select: { 
            likes: true 
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      userId: comment.userId,
      postId: comment.postId,
      user: comment.user,
      post: comment.post,
      likes: comment.likes,
      replies: comment.replies.map(reply => ({
        id: reply.id,
        content: reply.content,
        userId: reply.userId,
        commentId: reply.commentId,
        user: reply.user,
        likes: reply.likes,
        likeCount: reply.likes.length,
        createdAt: reply.createdAt,
        updatedAt: reply.updatedAt,
      })),
      likeCount: comment._count.likes,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    }));
  }

  async update(id: number, data: UpdateCommentInput) {
    const comment = await this.prisma.comment.update({
      where: { id },
      data,
      include: {
        user: true,
        post: true,
        likes: {
          include: {
            user: true,
          },
        },
        replies: {
          include: {
            user: true,
            likes: {
              include: {
                user: true,
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    return {
      id: comment.id,
      content: comment.content,
      userId: comment.userId,
      postId: comment.postId,
      user: comment.user,
      post: comment.post,
      likes: comment.likes,
      replies: comment.replies.map(reply => ({
        id: reply.id,
        content: reply.content,
        userId: reply.userId,
        commentId: reply.commentId,
        user: reply.user,
        likes: reply.likes,
        likeCount: reply.likes.length,
        createdAt: reply.createdAt,
        updatedAt: reply.updatedAt,
      })),
      likeCount: comment._count.likes,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };
  }

  async remove(id: number) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: {
        user: true,
        post: true,
        likes: {
          include: {
            user: true,
          },
        },
        replies: {
          include: {
            user: true,
            likes: {
              include: {
                user: true,
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    if (!comment) {
      throw new Error('Comentário não encontrado');
    }

    await this.prisma.comment.delete({ where: { id } });

    return {
      id: comment.id,
      content: comment.content,
      userId: comment.userId,
      postId: comment.postId,
      user: comment.user,
      post: comment.post,
      likes: comment.likes,
      replies: comment.replies.map(reply => ({
        id: reply.id,
        content: reply.content,
        userId: reply.userId,
        commentId: reply.commentId,
        user: reply.user,
        likes: reply.likes,
        likeCount: reply.likes.length,
        createdAt: reply.createdAt,
        updatedAt: reply.updatedAt,
      })),
      likeCount: comment._count.likes,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };
  }

  async getAuthorById(userId: number) {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }
}