import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStageInput } from './dto/create-stage.input';
import { UpdateStageInput } from './dto/update-stage.input';
import { Stage, TaskStatus } from '@prisma/client'; 

@Injectable()
export class StageService {
  constructor(private readonly prisma: PrismaService) {}

//----------------------------------------------------------------------
// 1. CRUD BÁSICO
//----------------------------------------------------------------------

  async create(createStageInput: CreateStageInput): Promise<Stage> {
    const { phaseId, ...rest } = createStageInput;
  
    return this.prisma.stage.create({
      data: {
        ...rest,
        progress: 0.0,
        // ✨ isSkipped deve ser removido do DTO e da criação
        // Se isSkipped ainda for obrigatório no seu Prisma Schema, defina um valor padrão aqui.
        phase: { connect: { id: phaseId } },
      },
      include: { tasks: true, phase: true },
    }) as any;
  }

  async findOne(id: number): Promise<Stage> {
    const stage = await this.prisma.stage.findUnique({
      where: { id },
      include: { tasks: true },
    });
    if (!stage) {
      throw new NotFoundException(`Etapa com ID ${id} não encontrada`);
    }
    return stage as any;
  }

  async findAllByPhase(phaseId: number): Promise<Stage[]> {
    return this.prisma.stage.findMany({
      where: { phaseId },
      include: { tasks: true },
    }) as any;
  }

  async update(id: number, updateStageInput: UpdateStageInput): Promise<Stage> {
    await this.findOne(id);
    return this.prisma.stage.update({
      where: { id },
      // ✨ Certifique-se de que updateStageInput não contenha 'isSkipped' se ele foi removido.
      data: updateStageInput,
      include: { tasks: true },
    }) as any;
  }


  async remove(id: number) {
    // A exclusão em cascata deve ser configurada no schema.prisma (Stage -> Task)
    await this.findOne(id); 
    const stage = await this.prisma.stage.delete({
      where: { id },
    });
    // Lembre-se de que o recálculo da Phase PAI deve ser chamado aqui após a exclusão.
    // Ex: await this.phaseService.updatePhaseProgress(stage.phaseId); 
    return true;
  }

//----------------------------------------------------------------------
// 2. LÓGICA DE PROGRESSO (PONDERADA POR CUSTO)
//----------------------------------------------------------------------

  /**
   * Calcula o progresso ponderado de uma Etapa (Stage) com base no custo orçado
   * e no status de conclusão das suas Tarefas (Tasks).
   */
  async calculateStageProgress(stageId: number): Promise<number> {
    const tasks = await this.prisma.task.findMany({
      where: { stageId },
    });

    if (tasks.length === 0) return 0.0; // Se não há tarefas, o progresso é 0.0.
    
    // ✨ Lógica Simplificada: Não precisamos mais verificar por stage.isSkipped

    // Filtra apenas as tarefas concluídas (COMPLETED).
    const completedTasks = tasks.filter(t => t.status === TaskStatus.COMPLETED);
    
    // Todas as tarefas agora são consideradas válidas (não existe mais SKIPPED).
    const totalBudgetedCost = tasks.reduce((sum, t) => sum + t.budgetedCost, 0);
    const completedCost = completedTasks.reduce((sum, t) => sum + t.budgetedCost, 0);
    
    if (totalBudgetedCost === 0) {
      // Se não houver tarefas, ou todas as tarefas válidas têm custo zero,
      // a etapa é considerada como 0% se não tiver tarefas, ou 100% se tiver tarefas de custo zero
      // e elas estiverem concluídas. Vamos manter o 0% se o custo for zero.
      return 0.0;
    }

    // Progresso é o custo concluído dividido pelo custo total.
    return (completedCost / totalBudgetedCost) * 100;
  }

  /**
   * Atualiza o campo 'progress' da Etapa (Stage) no banco de dados
   * e chama o recálculo para a Phase PAI.
   */
  async updateStageProgress(stageId: number): Promise<Stage> {
    const progress = await this.calculateStageProgress(stageId);
    
    return this.prisma.stage.update({
      where: { id: stageId },
      data: { progress: parseFloat(progress.toFixed(2)) },
    }) as any;
  }
}