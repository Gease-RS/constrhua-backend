import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { RoleUser } from '@prisma/client';
import { GraphQLDateTime } from 'graphql-scalars';

registerEnumType(RoleUser, {
  name: 'RoleUser',
  description: 'Papéis disponíveis para o usuário',
});

@ObjectType()
export class UserType {
  @Field(() => Int)
  id: number;

  @Field()
  email: string;

  @Field()
  fullname: string;

  @Field()
  username: string;

  @Field({ nullable: true })
  avatar?: string;

  @Field({ nullable: true })
  bio?: string;

  @Field(() => RoleUser)
  role: RoleUser;

  @Field(() => Boolean, { defaultValue: true })
  isActive: boolean;

  @Field(() => GraphQLDateTime)
  createdAt: Date;

  @Field(() => GraphQLDateTime)
  updatedAt: Date;
}
