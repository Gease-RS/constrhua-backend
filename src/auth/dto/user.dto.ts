import { ObjectType, Field, ID, registerEnumType, Int } from '@nestjs/graphql';
import { RoleUser } from '@prisma/client';
import { GraphQLDateTime } from 'graphql-scalars';

@ObjectType()
export class UserDto {
  @Field(() => Int)
  id: number;

  @Field()
  email: string;

  @Field()
  fullname: string;

  @Field()
  username: string;

  @Field(() => RoleUser)
  role: RoleUser;

  @Field({ nullable: true })
  avatar?: string;

  @Field(() => GraphQLDateTime)
  createdAt: Date;

  @Field(() => GraphQLDateTime)
  updatedAt: Date;
}
