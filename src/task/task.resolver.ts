import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { TaskService } from './task.service';
import { Task } from './entities/task.entity';
import { CreateTaskInput } from './dto/create-task.input';
import { UpdateTaskInput } from './dto/update-task.input';
import { TaskStatus } from '@prisma/client'; 

@Resolver(() => Task)
export class TaskResolver {
  constructor(private readonly taskService: TaskService) {}

  // =========================================================================
  // MUTATIONS (Operações de Escrita)
  // =========================================================================

  @Mutation(() => Task)
  createTask(
    @Args('createTaskInput') createTaskInput: CreateTaskInput
  ): Promise<Task> {
    return this.taskService.create(createTaskInput);
  }

  @Mutation(() => Task)
  async completeTask(
    @Args('id', { type: () => Int }) id: number
  ): Promise<Task> {
    const updateInput: UpdateTaskInput = { 
        id, 
        status: TaskStatus.COMPLETED 
    };
    return this.taskService.update(id, updateInput);
  }

  @Mutation(() => Task, { description: 'Atualiza detalhes da tarefa, como nome, custo orçado (budgetedCost) ou status.' })
  async updateTask(
    @Args('id', { type: () => Int }) id: number,
    @Args('updateTaskInput') updateTaskInput: UpdateTaskInput
  ): Promise<Task> {
    // O service já verifica se houve mudança crítica e dispara o recálculo.
    return this.taskService.update(id, updateTaskInput);
  }

  @Mutation(() => Boolean, { description: 'Remove uma tarefa e dispara o recálculo de progresso na Stage pai.' })
  async removeTask(@Args('id', { type: () => Int }) id: number): Promise<boolean> {
    return this.taskService.remove(id);
  }

  // =========================================================================
  // QUERIES (Operações de Leitura)
  // =========================================================================

  @Query(() => Task, { name: 'task', description: 'Retorna uma tarefa pelo seu ID.' })
  findOne(@Args('id', { type: () => Int }) id: number): Promise<Task> {
    return this.taskService.findOne(id);
  }

  @Query(() => [Task], { name: 'tasksByStage', description: 'Retorna todas as tarefas de uma etapa (Stage) específica.' })
  findAllByStage(
    @Args('stageId', { type: () => Int, description: 'ID da Etapa (Stage) para filtrar as tarefas.' }) stageId: number,
  ): Promise<Task[]> {
    return this.taskService.findAllByStage(stageId);
  }
}