import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class UpdateTeamInput {
  @Field(() => Int)
  id: number;

  @Field({ nullable: true })
  name?: string;

  @Field(() => Int, { nullable: true })
  constructionId?: number;
}