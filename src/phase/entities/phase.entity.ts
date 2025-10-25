import { Field, ObjectType, Float, Int } from '@nestjs/graphql';
import { GraphQLDateTime } from 'graphql-scalars';
import { Construction } from 'src/construction/entities/construction.entity';
import { Stage } from 'src/stage/entities/stage.entity'; // Importa a entidade Stage (que era SubStage)

@ObjectType()
export class Phase { // Renomeada de 'Stage' para 'Phase'
  @Field(() => Int)
  id: number;

  @Field()
  name: string; // Ex: "Planejamento e Projeto", "Infraestrutura"

  @Field(() => Float)
  progress: number; // Progresso da Phase, calculado a partir das Stages filhas

  @Field(() => Int) 
  constructionId: number;

  @Field(() => Construction, { nullable: true })
  construction?: Construction;

  @Field(() => [Stage], { nullable: true }) // A relação agora é com a entidade Stage (antiga SubStage)
  stages?: Stage[];

  @Field(() => GraphQLDateTime)
  createdAt: Date;

  @Field(() => GraphQLDateTime)
  updatedAt: Date;
}