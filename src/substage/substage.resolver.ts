import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { SubStage } from './entities/substage.entity';
import { SubStageService } from './substage.service';
import { CreateSubStageInput } from './dto/create-substage.input';
import { UpdateSubStageInput } from './dto/update-substage.input';


@Resolver(() => SubStage)
export class SubStageResolver {
  constructor(private readonly subStageService: SubStageService) {}

  @Query(() => [SubStage], { name: 'subStages' })
  async findAll() {
    return this.subStageService.findAll();
  }

  @Query(() => [SubStage], { name: 'subStagesByStage' })
  async findByStage(@Args('stageId', { type: () => ID }) stageId: number) {
    return this.subStageService.findAllByStageId(stageId);
  }

  @Query(() => SubStage, { name: 'subStage' })
  async findOne(@Args('id', { type: () => ID }) id: number) {
    return this.subStageService.findOne(id);
  }

  @Mutation(() => SubStage)
  async createSubStage(@Args('input') input: CreateSubStageInput) {
    return this.subStageService.create(input);
  }

  @Mutation(() => SubStage)
  async updateSubStage(@Args('input') input: UpdateSubStageInput) {
    return this.subStageService.update(input.id, input);
  }

  @Mutation(() => Boolean)
  async deleteSubStage(@Args('id', { type: () => ID }) id: number) {
    return this.subStageService.remove(id);
  }
}