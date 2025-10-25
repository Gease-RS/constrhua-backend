import { Resolver, Query, Mutation, Args, Int, Float } from '@nestjs/graphql';
import { StageService } from './stage.service';
import { Stage } from './entities/stage.entity';
import { CreateStageInput } from './dto/create-stage.input';
import { UpdateStageInput } from './dto/update-stage.input';
import { NotFoundException } from '@nestjs/common';

@Resolver(() => Stage)
export class StageResolver {
  constructor(private readonly stageService: StageService) {}

  // =========================================================================
  // MUTATIONS (Operações de Escrita)
  // =========================================================================

  @Mutation(() => Stage, { description: 'Cria uma nova etapa dentro de uma fase específica.' })
  createStage(
    @Args('createStageInput') createStageInput: CreateStageInput
  ): Promise<Stage> {
    return this.stageService.create(createStageInput);
  }

  @Mutation(() => Stage, { description: 'Atualiza o nome ou se a etapa deve ser pulada.' })
  async updateStage(
    @Args('id', { type: () => Int }) id: number,
    @Args('updateStageInput') updateStageInput: UpdateStageInput
  ): Promise<Stage> {
    return this.stageService.update(id, updateStageInput);
  }

  @Mutation(() => Boolean, { description: 'Remove uma etapa e todas as tarefas (Tasks) filhas. (Exige exclusão em cascata configurada no Prisma).' })
  async removeStage(@Args('id', { type: () => Int }) id: number): Promise<boolean> {
    return this.stageService.remove(id);
  }
  
  // Exemplo de mutation para recalcular o progresso da Stage.
  // Na prática, isso seria disparado após a conclusão/atualização de uma Task.
  @Mutation(() => Stage, { description: 'Recalcula e atualiza o campo de progresso da etapa com base nas Tasks filhas.' })
  async recalculateStageProgress(
    @Args('stageId', { type: () => Int }) stageId: number
  ): Promise<Stage> {
    return this.stageService.updateStageProgress(stageId);
  }

  // =========================================================================
  // QUERIES (Operações de Leitura)
  // =========================================================================

  @Query(() => Stage, { name: 'stage', description: 'Retorna uma etapa pelo seu ID, incluindo as tarefas filhas.' })
  findOne(@Args('id', { type: () => Int }) id: number): Promise<Stage> {
    return this.stageService.findOne(id);
  }
  
  @Query(() => [Stage], { name: 'stagesByPhase', description: 'Retorna todas as etapas de uma fase específica.' })
  findAllByPhase(
    @Args('phaseId', { type: () => Int, description: 'ID da Fase (Phase) para filtrar as etapas.' }) phaseId: number,
  ): Promise<Stage[]> {
    return this.stageService.findAllByPhase(phaseId);
  }
}