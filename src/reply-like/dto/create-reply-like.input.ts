// src/reply-like/dto/create-reply-like.input.ts
import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateReplyLikeInput {
  @Field(() => Int)
  replyId: number;

  @Field(() => Int)
  userId: number;
}
