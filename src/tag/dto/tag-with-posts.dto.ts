import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { Post } from '../../post/entities/post.entity';
import { IsInt, IsString } from 'class-validator';

@ObjectType()
export class TagWithPosts {
  @Field(() => Int)
  @IsInt()
  id: number;

  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  slug: string;

  @Field(() => [Post])
  @IsInt()
  posts: Post[];
}
