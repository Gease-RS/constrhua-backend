import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UpdateUserInput } from './dto/update-user.input';
import { AuthGuard } from '../auth/guards/auth.guard';
import { UsersService } from './users.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UserType } from './dto/user.type';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';

@Resolver(() => UserType)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) { }

  @Mutation(() => UserType, { name: 'createUser' })
  async createUser(
    @Args('input') input: CreateUserInput,
  ): Promise<UserType> {
    return this.usersService.createUser(input);
  }

  @Query(() => [UserType])
  //@UseGuards(AuthGuard)
  async users() {
    return this.usersService.findAll();
  }

  @Query(() => UserType)
  @UseGuards(AuthGuard)
  async me(@CurrentUser() user: User) {
    return this.usersService.findById(user.id);
  }

  @Query(() => [UserType], { name: 'listAllUsers', description: 'Lista todos os usuários, incluindo os inativos.' })
  //@UseGuards(AuthGuard)
  async listAllUsers() {
    return this.usersService.listAll();
  }

  @Query(() => [UserType], { name: 'findActiveUsers', description: 'Lista todos os usuários com isActive: true.' })
  async findActiveUsers() {
    return this.usersService.findAll(); // findAll() no service busca ativos
  }

  // NOVA QUERY: Listar APENAS usuários inativos
  @Query(() => [UserType], { name: 'findInactiveUsers', description: 'Lista apenas os usuários com isActive: false.' })
  // Sugestão: Esta Query deve ter um guarda de autorização (ex: RoleGuard para ADMIN)
  async findInactiveUsers() {
    return this.usersService.findInactive();
  }

  @Mutation(() => UserType)
  @UseGuards(AuthGuard)
  async updateProfile(
    @CurrentUser() user: User,
    @Args('data') data: UpdateUserInput,
  ) {
    return this.usersService.update(user.id, data);
  }

  @Mutation(() => String)
  @UseGuards(AuthGuard)
  async deactivateAccount(@CurrentUser() user: User) {
    const res = await this.usersService.deactivate(user.id);
    return res.message;
  }
}
