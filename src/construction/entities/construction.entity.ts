import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Team } from 'src/team/entities/team.entity'; 
import { Stage } from 'src/stage/entities/stage.entity'; 
import { User } from 'src/users/entities/user.entity';
import { GraphQLDateTime } from 'graphql-scalars';

@ObjectType()
export class Construction {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field()
  address: string;

  @Field()
  cep: string;

  @Field()
  city: string;

  @Field()
  district: string;

  @Field(() => Int) 
  userId: number;

  @Field(() => User) 
  user?: User;

  @Field(() => [Team], { nullable: true }) 
  teams?: Team[];

  @Field(() => [Stage], { nullable: true }) 
  stages?: Stage[];

  @Field(() => GraphQLDateTime)
  createdAt: Date;

  @Field(() => GraphQLDateTime)
  updatedAt: Date;
}