import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Post } from 'src/post/entities/post.entity';
import { GraphQLDateTime } from 'graphql-scalars';
import { Reply } from 'src/reply/entities/reply.entity';
import { CommentLike } from 'src/comment-like/entities/comment-like.entity'; // Certifique-se de que existe
import { User } from 'src/users/entities/user.entity';

@ObjectType()
export class CommentType {
  @Field(() => Int)
  id: number;

  @Field()
  content: string;

  @Field(() => Int)
  userId: number;

  @Field(() => Int)
  postId: number;

  @Field(() => User)
  user: User;

  @Field(() => Post)
  post: Post;

  @Field(() => [CommentLike], { defaultValue: [] })
  likes?: CommentLike[];

  @Field(() => [Reply], { defaultValue: [] }) 
  replies?: Reply[];

  @Field(() => Int)
  likeCount: number;

  @Field(() => GraphQLDateTime)
  createdAt: Date;

  @Field(() => GraphQLDateTime)
  updatedAt: Date;
}