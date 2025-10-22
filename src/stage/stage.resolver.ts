import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { StageService } from './stage.service';
import { Stage } from './entities/stage.entity';
import { CreateStageInput } from './dto/create-stage.input';
import { UpdateStageInput } from './dto/update-stage.input';

@Resolver(() => Stage)
export class StageResolver {
  constructor(private readonly stageService: StageService) {}

  @Query(() => [Stage], { name: 'stages' })
  async findAll() {
    return this.stageService.findAll();
  }

  @Query(() => Stage, { name: 'stage' })
  async findOne(@Args('id', { type: () => ID }) id: number) {
    return this.stageService.findOne(id);
  }

  @Mutation(() => Stage)
async createStage(@Args('createStageInput') input: CreateStageInput) {
  return this.stageService.create(input);
}

  @Mutation(() => Stage)
  async updateStage(@Args('input') input: UpdateStageInput) {
    return this.stageService.update(input.id, input);
  }

  @Mutation(() => Boolean)
  async deleteStage(@Args('id', { type: () => ID }) id: number) {
    return this.stageService.remove(id);
  }

  // Você pode adicionar queries/mutations adicionais conforme necessário
  // Por exemplo, para buscar stages por constructionId:

  @Query(() => [Stage], { name: 'stagesByConstruction' })
  async findByConstruction(@Args('constructionId', { type: () => ID }) constructionId: number) {
    return this.stageService.findByConstruction(constructionId);
  }
}