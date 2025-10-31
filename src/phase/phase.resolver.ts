import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { PhaseService } from './phase.service';
import { Phase } from './entities/phase.entity'; // A nova entidade Phase
import { CreatePhaseInput } from './dto/create-phase.input';
import { UpdatePhaseInput } from './dto/update-phase.input';
import { NotFoundException } from '@nestjs/common';
import { StageService } from 'src/stage/stage.service';

@Resolver(() => Phase)
export class PhaseResolver {
  constructor(
        private readonly phaseService: PhaseService,
        private readonly stageService: StageService 
  ) {}

  // =========================================================================
  // MUTATIONS (Operações de Escrita)
  // =========================================================================

  @Mutation(() => Phase, { description: 'Cria uma nova fase na construção. Pode copiar a estrutura de um modelo base.' })
  createPhase(
    @Args('createPhaseInput') createPhaseInput: CreatePhaseInput
  ): Promise<Phase> {
    // Chama o serviço para criar a Phase, o serviço lidará com a lógica de template (deep copy)
    return this.phaseService.create(createPhaseInput);
  }

  @Mutation(() => Phase, { description: 'Atualiza o nome de uma fase existente.' })
  async updatePhase(
    @Args('id', { type: () => Int }) id: number,
    @Args('updatePhaseInput') updatePhaseInput: UpdatePhaseInput
  ): Promise<Phase> {
    // Você pode adicionar validação ou regras de negócio aqui, se necessário.
    const updatedPhase = await this.phaseService.update(id, updatePhaseInput);
    if (!updatedPhase) {
      throw new NotFoundException(`Fase com ID ${id} não encontrada para atualização.`);
    }
    return updatedPhase;
  }

  @Mutation(() => Boolean, { description: 'Remove uma fase e todas as etapas e tarefas relacionadas.' })
  async removePhase(@Args('id', { type: () => Int }) id: number): Promise<boolean> {
    const result = await this.phaseService.remove(id);
    
    // O service retorna um objeto { success: true } em caso de sucesso
    return result.success; 
  }

  // =========================================================================
  // QUERIES (Operações de Leitura)
  // =========================================================================

  @Query(() => [Phase], { name: 'phases', description: 'Retorna todas as fases de uma construção específica.' })
  findAllByConstruction(
    @Args('constructionId', { type: () => Int, description: 'ID da construção para filtrar as fases.' }) constructionId: number,
  ): Promise<Phase[]> {
    // Chama o serviço para buscar as fases de uma construção específica
    return this.phaseService.findByConstruction(constructionId);
  }

  @Query(() => Phase, { name: 'phase', description: 'Retorna uma fase pelo seu ID, incluindo etapas e tarefas.' })
  findOne(@Args('id', { type: () => Int }) id: number): Promise<Phase> {
    return this.phaseService.findOne(id);
  }
}