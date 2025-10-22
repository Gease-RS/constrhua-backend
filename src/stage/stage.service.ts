import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStageInput } from './dto/create-stage.input';
import { UpdateStageInput } from './dto/update-stage.input';

@Injectable()
export class StageService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.stage.findMany({
      select: {
        id: true,
        name: true,
        progress: true,
        construction: {
          select: {
            id: true,
            name: true,
          },
        },
        substages: true,
      },
    });
  }
  

  async findOne(id: number) {
    const stage = await this.prisma.stage.findUnique({
      where: { id },
      include: { substages: true },
    });
    if (!stage) {
      throw new NotFoundException(`Stage with ID ${id} not found`);
    }
    return stage;
  }

  async create(createStageInput: CreateStageInput) {
    const { constructionId, ...rest } = createStageInput;
  
    return this.prisma.stage.create({
      data: {
        ...rest,
        construction: {
          connect: { id: constructionId },
        },
      },
      include: {
        construction: true,
        substages: true,
      },
    });
  }
  

  async update(id: number, updateStageInput: UpdateStageInput) {
    await this.findOne(id); 
    return this.prisma.stage.update({
      where: { id },
      data: updateStageInput,
      include: { substages: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.stage.delete({
      where: { id },
    });
    return true;
  }

  async calculateStageProgress(stageId: number): Promise<number> {
    const substages = await this.prisma.subStage.findMany({
      where: { stageId },
    });

    if (substages.length === 0) return 0;

    const totalProgress = substages.reduce(
      (sum, substage) => sum + substage.progress,
      0,
    );
    return totalProgress / substages.length;
  }

  async updateStageProgress(stageId: number) {
    const progress = await this.calculateStageProgress(stageId);
    return this.update(stageId, { id: stageId, progress });
  }

  async findByConstruction(constructionId: number) {
    return this.prisma.stage.findMany({
      where: { constructionId },
      include: { substages: true },
    });
  }
}