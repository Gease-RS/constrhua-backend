import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class DeletePostDto {
  @Field(() => Int)
  id: number;

  @Field()
  message: string;
}