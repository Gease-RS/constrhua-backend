import { ObjectType, Field, Int } from '@nestjs/graphql';
import { ReplyLike } from 'src/reply-like/entities/reply-like.entity';
import { GraphQLDateTime } from 'graphql-scalars';
import { User } from 'src/users/entities/user.entity';

@ObjectType()
export class Reply {
  @Field(() => Int)
  id: number;

  @Field()
  content: string;

  @Field(() => Int)
  userId: number;

  @Field(() => Int)
  commentId: number;

  @Field(() => User)
  user: User;

  @Field(() => [ReplyLike], { defaultValue: [] })
  likes?: ReplyLike[];

  @Field(() => Int)
  likeCount: number;

  @Field(() => GraphQLDateTime)
  createdAt: Date;

  @Field(() => GraphQLDateTime)
  updatedAt: Date;
}