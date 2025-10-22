import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { Construction } from './entities/construction.entity';
import { CreateConstructionInput } from './dto/create-construction.input';
import { UpdateConstructionInput } from './dto/update-construction.input';
import { ConstructionService } from './construction.service';

@Resolver(() => Construction)
export class ConstructionResolver {
  constructor(private readonly constructService: ConstructionService) { }

  @Mutation(() => Construction)
  async createConstruction(
    @Args('createConstructionInput') createConstructionInput: CreateConstructionInput,
  ): Promise<Construction> {
    return this.constructService.create(createConstructionInput);
  }

  @Query(() => [Construction], { name: 'constructions' })
  async findAll(): Promise<Construction[]> {
    return this.constructService.findAll();
  }

  @Query(() => Construction, { name: 'construction', nullable: true })
  async findOne(@Args('id', { type: () => ID }) id: number): Promise<Construction | null> {
    return this.constructService.findOne(id);
  }

  @Mutation(() => Construction)
  async updateConstruction(
    @Args('id', { type: () => ID }) id: number,
    @Args('updateConstructionInput') updateConstructionInput: UpdateConstructionInput,
  ): Promise<Construction> {
    return this.constructService.update(id, updateConstructionInput);
  }

  @Mutation(() => Construction)
  async removeConstruction(@Args('id', { type: () => ID }) id: number): Promise<Construction> {
    return this.constructService.remove(id);
  }
}