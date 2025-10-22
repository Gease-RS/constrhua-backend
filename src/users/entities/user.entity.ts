import { ObjectType, Field, Int } from '@nestjs/graphql';
import { GraphQLDateTime } from 'graphql-scalars';
import { Post } from 'src/post/entities/post.entity';
import { Comment } from 'src/comment/entities/comment.entity';
import { RoleUser } from '@prisma/client';

@ObjectType()
export class User {
  @Field(() => Int)
  id: number;

  @Field()
  fullname: string;

  @Field()
  username: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  avatar?: string;

  @Field({ nullable: true })
  bio?: string;

  @Field(() => RoleUser)
  role: RoleUser

  @Field({ defaultValue: true })
  isActive: boolean;

  @Field(() => [Post], { nullable: true })
  posts?: Post[];

  @Field(() => [Comment], { nullable: true })
  comments?: Comment[];

  @Field(() => GraphQLDateTime)
  createdAt: Date;

  @Field(() => GraphQLDateTime)
  updatedAt: Date;
}