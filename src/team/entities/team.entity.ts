import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { Professional } from '../../professional/entities/professional.entity';
import { Construction } from '../../construction/entities/construction.entity';
import { GraphQLDateTime } from 'graphql-scalars';

@ObjectType()
export class Team {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field(() => Int)
  constructionId: number;

  @Field(() => Construction, { nullable: true }) 
  construction?: Construction;

  @Field(() => [Professional], { nullable: true })
  professionals?: Professional[]; 

  @Field(() => GraphQLDateTime)
  createdAt: Date;

  @Field(() => GraphQLDateTime)
  updatedAt: Date;
}

