import { Field, ObjectType, Float, Int } from '@nestjs/graphql';
import { GraphQLDateTime } from 'graphql-scalars';
import { Phase } from 'src/phase/entities/phase.entity'; 
import { Task } from 'src/task/entities/task.entity'; // Importa a nova entidade Task

@ObjectType()
export class Stage { // Renomeada de 'SubStage' para 'Stage'
  @Field(() => Int)
  id: number;

  @Field()
  name: string; // Ex: "Escolha do Terreno", "Fundação"

  @Field(() => Float)
  progress: number; // Progresso da Stage, calculado a partir das Tasks filhas

  @Field(() => Int) 
  phaseId: number; // Relação com o novo Phase

  @Field(() => Phase, { nullable: true })
  phase?: Phase;

  @Field()
  isSkipped: boolean; // Permite pular esta etapa se o cliente já a completou (ex: já tem o terreno)

  @Field(() => [Task], { nullable: true }) // Relação com o nível mais baixo: Tarefas
  tasks?: Task[];

  @Field(() => GraphQLDateTime)
  createdAt: Date;

  @Field(() => GraphQLDateTime)
  updatedAt: Date;
}