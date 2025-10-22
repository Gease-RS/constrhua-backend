import { ObjectType, Field, Int } from '@nestjs/graphql';
import { GraphQLDateTime } from 'graphql-scalars';
import { Category } from 'src/category/entities/category.entity';
import { Comment } from 'src/comment/entities/comment.entity';
import { Image } from 'src/image/entities/image.entity';
import { Tag } from 'src/tag/entities/tag.entity';
import { User } from 'src/users/entities/user.entity';

@ObjectType()
export class Post {
  @Field(() => Int)
  id: number;

  @Field()
  title: string;

  @Field()
  slug: string;

  @Field()
  content: string;

  @Field()
  published: boolean;

  @Field(() => Int)
  authorId: number;

  @Field(() => User, { nullable: true }) 
  author?: User;

  @Field(() => [Category], { nullable: true })
  categories?: Category[];

  @Field(() => [Comment], { nullable: true })
  comments?: Comment[];

  @Field(() => [Image], { nullable: true })
  images?: Image[];

  @Field(() => [Tag], { nullable: true })
  tags?: Tag[];

  @Field(() => GraphQLDateTime)
  createdAt: Date;

  @Field(() => GraphQLDateTime)
  updatedAt: Date;
}
