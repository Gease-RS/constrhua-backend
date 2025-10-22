import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { MediaType } from '@prisma/client';

registerEnumType(MediaType, {
  name: 'MediaType',
});

@InputType()
export class CreateImageInput {
  @Field()
  url: string;

  @Field({ nullable: true })
  alt?: string;

  @Field(() => MediaType)
  type: MediaType;
}
