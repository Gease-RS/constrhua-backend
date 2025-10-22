import { Field, ObjectType, Float, Int } from '@nestjs/graphql';
import { GraphQLDateTime } from 'graphql-scalars';
import { Construction } from 'src/construction/entities/construction.entity';
import { SubStage } from 'src/substage/entities/substage.entity'; // Verifique o caminho real da sua entidade SubStage

@ObjectType()
export class Stage {
  @Field(() => Int) // ID no GraphQL pode ser String ou Int, mas o tipo TypeScript será number
  id: number; // Agora é 'number' para corresponder ao 'Int' do Prisma

  @Field()
  name: string;

  @Field(() => Float) // Use Float para números decimais
  progress: number; // 'Float' no Prisma mapeia para 'number' no TypeScript

  @Field(() => Number) // O ID da construção é um número inteiro
  constructionId: number;

  @Field(() => Construction, { nullable: true }) // Relacionamento com a entidade Construction
  construction?: Construction;

  @Field(() => [SubStage], { nullable: true }) // Relacionamento com a entidade SubStage
  substages?: SubStage[]; // Pode ser nulo se não houver subetapas

  @Field(() => GraphQLDateTime)
  createdAt: Date;

  @Field(() => GraphQLDateTime)
  updatedAt: Date;
}


