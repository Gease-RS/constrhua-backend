import { Resolver, Query, Mutation, Args, Int, ID } from '@nestjs/graphql';
import { ProfessionalService } from './professional.service';
import { Professional } from './entities/professional.entity'; // Importe a entidade Professional
import { CreateProfessionalInput } from './dto/create-professional.input';
import { UpdateProfessionalInput } from './dto/update-professional.input';
import { NotFoundException } from '@nestjs/common';

@Resolver(() => Professional)
export class ProfessionalResolver {
  constructor(private readonly professionalService: ProfessionalService) {}

  @Mutation(() => Professional, { name: 'createProfessional' })
  createProfessional(@Args('createProfessionalInput') createProfessionalInput: CreateProfessionalInput): Promise<Professional> {
    return this.professionalService.create(createProfessionalInput);
  }

  @Query(() => [Professional], { name: 'professionals' })
  findAll(): Promise<Professional[]> {
    return this.professionalService.findAll();
  }

  @Query(() => Professional, { name: 'professional' })
  async findOne(@Args('id', { type: () => Int }) id: number): Promise<Professional> {
    const professional = await this.professionalService.findOne(id);
    if (!professional) {
      throw new NotFoundException(`Professional with ID ${id} not found.`);
    }
    return professional;
  }

  @Mutation(() => Professional, { name: 'updateProfessional' })
  async updateProfessional(
    @Args('updateProfessionalInput') updateProfessionalInput: UpdateProfessionalInput,
  ): Promise<Professional> {
    const updatedProfessional = await this.professionalService.update(updateProfessionalInput.id, updateProfessionalInput);
    if (!updatedProfessional) {
      throw new NotFoundException(`Professional with ID ${updateProfessionalInput.id} not found.`);
    }
    return updatedProfessional;
  }

  @Mutation(() => Professional, { name: 'removeProfessional' })
  async removeProfessional(@Args('id', { type: () => Int }) id: number): Promise<Professional> {
    const removedProfessional = await this.professionalService.remove(id);
    if (!removedProfessional) {
      throw new NotFoundException(`Professional with ID ${id} not found.`);
    }
    return removedProfessional;
  }
}