import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class UpdateImageInput {
  @Field({ nullable: true })
  url?: string;

  @Field({ nullable: true })
  alt?: string;

  @Field(() => String, { nullable: true })
  type?: 'image' | 'video';
}
