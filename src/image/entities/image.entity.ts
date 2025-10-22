import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Post } from 'src/post/entities/post.entity';

@ObjectType()
export class Image {
  @Field(() => Int)
  id: number;

  @Field()
  url: string;

  @Field({ nullable: true })
  alt?: string;

  @Field()
  type: 'image' | 'video';

  @Field(() => Int)
  postId: number;

  @Field(() => Post, { nullable: true })
  post?: Post;
}
