import { Field, ObjectType, Float, Int } from '@nestjs/graphql';
import { GraphQLDateTime } from 'graphql-scalars';
import { Stage } from 'src/stage/entities/stage.entity'; // Verifique o caminho real da sua entidade Stage

@ObjectType()
export class SubStage {
  @Field(() => Int) // ID no GraphQL pode ser String ou Int, mas o tipo TypeScript será number
  id: number; // Agora é 'number' para corresponder ao 'Int' do Prisma

  @Field()
  name: string;

  @Field(() => Float) // Use Float para números decimais
  progress: number; // 'Float' no Prisma mapeia para 'number' no TypeScript

  @Field(() => Number) // O ID da etapa é um número inteiro
  stageId: number;

  @Field(() => Stage, { nullable: true }) // Relacionamento com a entidade Stage
  stage?: Stage;

  @Field(() => GraphQLDateTime)
  createdAt: Date;

  @Field(() => GraphQLDateTime)
  updatedAt: Date;
}