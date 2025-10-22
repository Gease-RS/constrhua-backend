import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryInput } from './dto/create-category.input';
import { UpdateCategoryInput } from './dto/update-category.input';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) { }

  async create(data: CreateCategoryInput) {
    return this.prisma.category.create({
      data,
      include: { posts: true },
    });
  }

  async findAll() {
    return this.prisma.category.findMany({
      include: { posts: true },
    });
  }

  async findOne(id: number) {
    return this.prisma.category.findUnique({
      where: { id },
      include: { posts: true },
    });
  }

  async update(id: number, data: UpdateCategoryInput) {
    return this.prisma.category.update({
      where: { id },
      data,
      include: { posts: true },
    });
  }

  async remove(id: number) {
    try {
      await this.findOne(id);
      return await this.prisma.category.delete({
        where: { id },
      });
    } catch (error) {
      throw error;
    }
  }
}
