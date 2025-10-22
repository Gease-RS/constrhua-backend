import { ObjectType, Field, Int } from '@nestjs/graphql';
import { GraphQLDateTime } from 'graphql-scalars';
import { User } from 'src/users/entities/user.entity';

@ObjectType()
export class CommentLike {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  userId: number;

  @Field(() => Int)
  commentId: number;

  @Field(() => User)
  user: User;

  @Field(() => GraphQLDateTime)
  createdAt: Date;
}