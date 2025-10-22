import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StageService } from '../stage/stage.service';
import { CreateSubStageInput } from './dto/create-substage.input';
import { UpdateSubStageInput } from './dto/update-substage.input';

@Injectable()
export class SubStageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stageService: StageService,
  ) {}

  async findAll() {
    return this.prisma.subStage.findMany();
  }

  async findOne(id: number) {
    const subStage = await this.prisma.subStage.findUnique({
      where: { id },
    });
    if (!subStage) {
      throw new NotFoundException(`SubStage with ID ${id} not found`);
    }
    return subStage;
  }

  async create(createSubStageInput: CreateSubStageInput) {
    const subStage = await this.prisma.subStage.create({
      data: createSubStageInput,
    });
    
    await this.stageService.updateStageProgress(createSubStageInput.stageId);
    
    return subStage;
  }

  async update(id: number, updateSubStageInput: UpdateSubStageInput) {
    const subStage = await this.findOne(id);
    const updatedSubStage = await this.prisma.subStage.update({
      where: { id },
      data: updateSubStageInput,
    });
    
    await this.stageService.updateStageProgress(subStage.stageId);
    
    return updatedSubStage;
  }

  async remove(id: number) {
    const subStage = await this.findOne(id);
    await this.prisma.subStage.delete({
      where: { id },
    });
    
    await this.stageService.updateStageProgress(subStage.stageId);
    
    return true;
  }

  async findAllByStageId(stageId: number) {
    return this.prisma.subStage.findMany({
      where: { stageId },
    });
  }
}