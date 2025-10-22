import { Field, InputType, Int } from "@nestjs/graphql";

@InputType()
export class LikeCommentInput {
  @Field(() => Int)
  commentId: number;

  @Field(() => Int)
  userId: number;
}
