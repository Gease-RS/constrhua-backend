import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { Role } from '@prisma/client';
import { Team } from '../../team/entities/team.entity'; 
import { GraphQLDateTime } from 'graphql-scalars';

registerEnumType(Role, {
  name: 'Role',
  description: 'Papéis disponíveis para profissionais',
});


@ObjectType()
export class Professional {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field(() => Role)
  role: Role;

  @Field()
  phone: string;

  @Field()
  email: string;

  @Field(() => Team, { nullable: true }) 
  team?: Team;

  @Field(() => Int)
  teamId: number;

  @Field(() => GraphQLDateTime)
  createdAt: Date;

  @Field(() => GraphQLDateTime)
  updatedAt: Date;
}
