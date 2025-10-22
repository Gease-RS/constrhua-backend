import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Reply } from 'src/reply/entities/reply.entity'; // Importe Reply se ainda não estiver
import { GraphQLDateTime } from 'graphql-scalars';
import { User } from 'src/users/entities/user.entity';

@ObjectType()
export class ReplyLike {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  userId: number;

  @Field(() => Int)
  replyId: number;

  @Field(() => User)
  user: User;

  @Field(() => Reply, { nullable: true })
  reply?: Reply; 

  @Field(() => GraphQLDateTime)
  createdAt: Date;
}