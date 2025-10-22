import { InputType, Field, Int } from '@nestjs/graphql';
import { IsInt } from 'class-validator';

@InputType()
export class CreateCommentLikeInput {
  @Field(() => Int)
  @IsInt()
  userId: number;

  @Field(() => Int)
  @IsInt()
  commentId: number;
}
