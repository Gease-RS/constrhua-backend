import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateReplyInput {
  @Field()
  content: string;

  @Field(() => Int)
  commentId: number;

  @Field(() => Int)
  userId: number;
}
