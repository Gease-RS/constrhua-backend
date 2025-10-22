import { CreateReplyLikeInput } from './create-reply-like.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateReplyLikeInput extends PartialType(CreateReplyLikeInput) {
  @Field(() => Int)
  id: number;
}
