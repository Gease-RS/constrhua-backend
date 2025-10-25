import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ConstructionService } from './construction.service';
import { Construction } from './entities/construction.entity';
import { CreateConstructionInput } from './dto/create-construction.input';
import { UpdateConstructionInput } from './dto/update-construction.input';
import { NotFoundException } from '@nestjs/common';

@Resolver(() => Construction)
export class ConstructionResolver {
  constructor(private readonly constructionService: ConstructionService) {}

  // =========================================================================
  // MUTATIONS (Operações de Escrita)
  // =========================================================================

  @Mutation(() => Construction, { description: 'Cria uma nova construção e a inicializa com progresso 0.0.' })
  createConstruction(
    @Args('createConstructionInput') createConstructionInput: CreateConstructionInput
  ): Promise<Construction> {
    return this.constructionService.create(createConstructionInput);
  }

  @Mutation(() => Construction, { description: 'Atualiza os dados básicos de uma construção.' })
  async updateConstruction(
    @Args('id', { type: () => Int }) id: number,
    @Args('updateConstructionInput') updateConstructionInput: UpdateConstructionInput
  ): Promise<Construction> {
    return this.constructionService.update(id, updateConstructionInput);
  }

  @Mutation(() => Construction, { description: 'Recalcula o progresso total da construção baseado no estado atual de todas as Tasks.' })
  async recalculateConstructionProgress(
    @Args('constructionId', { type: () => Int }) constructionId: number
  ): Promise<Construction> {
    // Chama o método que realiza a agregação de progresso final.
    return this.constructionService.updateConstructionProgress(constructionId);
  }
  
  @Mutation(() => Construction, { description: 'Remove uma construção e todos os seus dados associados (Phases, Stages, Tasks).' })
  async removeConstruction(@Args('id', { type: () => Int }) id: number): Promise<Construction> {
    // Retorna a construção que foi removida (se configurado no service para retornar a entidade)
    return this.constructionService.remove(id);
  }

  // =========================================================================
  // QUERIES (Operações de Leitura)
  // =========================================================================

  @Query(() => [Construction], { name: 'constructions', description: 'Retorna todas as construções com a hierarquia de progresso completa.' })
  findAll(): Promise<Construction[]> {
    return this.constructionService.findAll();
  }

  @Query(() => Construction, { name: 'construction', description: 'Retorna uma construção pelo seu ID, incluindo Phases, Stages e Tasks.' })
  findOne(@Args('id', { type: () => Int }) id: number): Promise<Construction> {
    return this.constructionService.findOne(id);
  }
}