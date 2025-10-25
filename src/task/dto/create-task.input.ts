import { InputType, Int, Field, Float } from '@nestjs/graphql';
import { TaskStatus } from '@prisma/client';

@InputType()
export class CreateTaskInput {
  @Field()
  name: string; // Ex: "Avaliação do Terreno", "Assentamento de Tijolos"

  @Field(() => Int, { description: 'ID da etapa à qual esta tarefa pertence.' })
  stageId: number;

  @Field(() => Float, { description: 'Custo orçado desta tarefa. Usado para ponderar o progresso geral.' })
  budgetedCost: number; // ✨ Campo crucial para a automação do peso

  // O campo 'status' pode ser opcional ou ter um padrão (NOT_STARTED)
  @Field(() => TaskStatus, { 
    nullable: true, 
    defaultValue: TaskStatus.NOT_STARTED, 
    description: 'Status inicial da tarefa. Padrão: NÃO_INICIADO.' 
  })
  status: TaskStatus;
}