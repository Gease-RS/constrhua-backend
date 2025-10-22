import { Resolver, Query, Mutation, Args, Int, ID } from '@nestjs/graphql';
import { TeamService } from './team.service';
import { Team } from './entities/team.entity'; // Importe a entidade Team
import { CreateTeamInput } from './dto/create-team.input';
import { UpdateTeamInput } from './dto/update-team.input';
import { NotFoundException } from '@nestjs/common';

@Resolver(() => Team)
export class TeamResolver {
  constructor(private readonly teamService: TeamService) {}

  @Mutation(() => Team, { name: 'createTeam' })
  createTeam(@Args('createTeamInput') createTeamInput: CreateTeamInput): Promise<Team> {
    return this.teamService.create(createTeamInput);
  }

  @Query(() => [Team], { name: 'teams' })
  findAll(): Promise<Team[]> {
    return this.teamService.findAll();
  }

  @Query(() => Team, { name: 'team' })
  async findOne(@Args('id', { type: () => Int }) id: number): Promise<Team> {
    const team = await this.teamService.findOne(id);
    if (!team) {
      throw new NotFoundException(`Team with ID ${id} not found.`);
    }
    return team;
  }

  @Mutation(() => Team, { name: 'updateTeam' })
  async updateTeam(
    @Args('updateTeamInput') updateTeamInput: UpdateTeamInput,
  ): Promise<Team> {
    const updatedTeam = await this.teamService.update(updateTeamInput.id, updateTeamInput);
    if (!updatedTeam) {
      throw new NotFoundException(`Team with ID ${updateTeamInput.id} not found.`);
    }
    return updatedTeam;
  }

  @Mutation(() => Team, { name: 'removeTeam' })
  async removeTeam(@Args('id', { type: () => Int }) id: number): Promise<Team> {
    const removedTeam = await this.teamService.remove(id);
    if (!removedTeam) {
      throw new NotFoundException(`Team with ID ${id} not found.`);
    }
    return removedTeam;
  }
}