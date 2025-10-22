import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class Tag {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field()
  slug: string;
}

