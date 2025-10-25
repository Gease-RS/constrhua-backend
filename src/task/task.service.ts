import { Injectable, NotFoundException, forwardRef, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StageService } from '../stage/stage.service'; // Injeção do serviço pai
import { CreateTaskInput } from './dto/create-task.input';
import { UpdateTaskInput } from './dto/update-task.input';
import { TaskStatus } from '@prisma/client';

@Injectable()
export class TaskService {
  // Usamos forwardRef para evitar dependência circular, caso StageService também injete TaskService.
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => StageService))
    private readonly stageService: StageService,
  ) {}

//----------------------------------------------------------------------
// 1. CRIAÇÃO DE TAREFA
//----------------------------------------------------------------------

  async create(createTaskInput: CreateTaskInput) {
    const { stageId, ...rest } = createTaskInput;

    const newTask = await this.prisma.task.create({
      data: {
        ...rest,
        status: rest.status || TaskStatus.NOT_STARTED,
        stage: {
          connect: { id: stageId },
        },
      },
    });

    // IMPORTANTE: Após criar, recalculamos o progresso da Stage pai.
    await this.stageService.updateStageProgress(stageId);

    return newTask;
  }

//----------------------------------------------------------------------
// 2. BUSCA DE TAREFAS
//----------------------------------------------------------------------

  async findAllByStage(stageId: number) {
    return this.prisma.task.findMany({
      where: { stageId },
      include: { stage: true },
    });
  }

  async findOne(id: number) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: { stage: true },
    });
    if (!task) {
      throw new NotFoundException(`Tarefa com ID ${id} não encontrada.`);
    }
    return task;
  }

//----------------------------------------------------------------------
// 3. ATUALIZAÇÃO E REMOÇÃO (Gatilhos de Recálculo)
//----------------------------------------------------------------------

  /**
   * Atualiza uma tarefa, sendo o status e o custo os campos mais críticos.
   * Dispara o recálculo do progresso após a atualização.
   */
  async update(id: number, updateTaskInput: UpdateTaskInput) {
    const existingTask = await this.findOne(id);
    const stageId = existingTask.stageId;

    const updatedTask = await this.prisma.task.update({
      where: { id },
      data: updateTaskInput,
    });

    // Se o status ou o custo mudarem, precisamos recalcular o progresso.
    if (updateTaskInput.status !== existingTask.status || 
        updateTaskInput.budgetedCost !== existingTask.budgetedCost) {
      
      await this.stageService.updateStageProgress(stageId);
    }

    return updatedTask;
  }

  async remove(id: number) {
    const existingTask = await this.findOne(id);
    const stageId = existingTask.stageId;

    await this.prisma.task.delete({
      where: { id },
    });

    // Dispara o recálculo do progresso da Stage pai após a remoção.
    await this.stageService.updateStageProgress(stageId);

    return true;
  }
}