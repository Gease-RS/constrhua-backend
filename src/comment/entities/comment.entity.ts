import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Post } from 'src/post/entities/post.entity';
import { GraphQLDateTime } from 'graphql-scalars';
import { Reply } from 'src/reply/entities/reply.entity';
import { User } from 'src/users/entities/user.entity';

@ObjectType()
export class Comment {
  @Field(() => Int)
  id: number;

  @Field()
  content: string;

  @Field(() => User)
  user: User;

  @Field(() => Post)
  post: Post;

  @Field(() => [Reply], { defaultValue: [] })
  replies?: Reply[];

  @Field(() => Int)
  likeCount: number;

  @Field(() => GraphQLDateTime)
  createdAt: Date;

  @Field(() => GraphQLDateTime)
  updatedAt: Date;
}
