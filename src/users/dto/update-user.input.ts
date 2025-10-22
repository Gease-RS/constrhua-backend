// src/user/dto/update-user.input.ts
import { InputType, Field, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateUserInput {
  @Field({ nullable: true })
  fullname?: string;

  @Field({ nullable: true })
  username?: string;

  @Field({ nullable: true })
  avatar?: string;

  @Field({ nullable: true })
  bio?: string;
}
