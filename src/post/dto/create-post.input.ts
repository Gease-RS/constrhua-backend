import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsArray } from 'class-validator';
import { CreateImageInput } from 'src/image/dto/create-image.input';

@InputType()
export class CreatePostInput {
  @Field()
  @IsNotEmpty()
  title: string;

  @Field()
  @IsNotEmpty()
  content: string;

  @Field({ defaultValue: false })
  @IsOptional()
  published?: boolean;

  @Field(() => Int)
  authorId: number;

  @Field(() => [Int], { nullable: true }) 
  @IsOptional()
  @IsArray()
  categories?: number[];

  @Field(() => [String], { nullable: true })
  tags?: string[];

  @Field(() => [CreateImageInput], { nullable: true })
  images?: CreateImageInput[];
}
