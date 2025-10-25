import { Field, ObjectType, Float, Int, registerEnumType } from '@nestjs/graphql';
import { GraphQLDateTime } from 'graphql-scalars';
import { Stage } from 'src/stage/entities/stage.entity';
import { TaskStatus } from '@prisma/client';

registerEnumType(TaskStatus, {
  name: 'TaskStatus',
});

@ObjectType()
export class Task {
  @Field(() => Int)
  id: number;

  @Field()
  name: string; // Ex: "Avaliação e compra", "Lançamento do Concreto"

  @Field(() => TaskStatus)
  status: TaskStatus; // Status de Conclusão

  @Field(() => Float)
  budgetedCost: number; // ✨ Custo Orçado (Base para o cálculo automático de peso)

  @Field(() => Int) 
  stageId: number;

  @Field(() => Stage, { nullable: true })
  stage?: Stage;

  @Field(() => GraphQLDateTime, { nullable: true })
  startDate?: Date; 

  @Field(() => GraphQLDateTime, { nullable: true })
  endDate?: Date; 

  @Field(() => GraphQLDateTime)
  createdAt: Date;

  @Field(() => GraphQLDateTime)
  updatedAt: Date;
}