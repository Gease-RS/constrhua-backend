import { InputType, Field } from '@nestjs/graphql';
import { RoleUser } from '@prisma/client';

@InputType()
export class CreateUserInput {
  @Field()
  email: string;

  @Field()
  fullname: string;

  @Field()
  username: string;

  @Field(() => RoleUser)
  role: RoleUser;
}
