import { InputType, Field, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CreateCommentInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  content: string;

  @Field(() => Int)
  @IsInt()
  userId: number;

  @Field(() => Int)
  @IsInt()
  postId: number;
}
