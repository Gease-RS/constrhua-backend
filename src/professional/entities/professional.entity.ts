import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { RoleProfessional  } from '@prisma/client';
import { Team } from '../../team/entities/team.entity'; 
import { GraphQLDateTime } from 'graphql-scalars';

registerEnumType(RoleProfessional , {
  name: 'RoleProfressional',
  description: 'Papéis disponíveis para profissionais',
});


@ObjectType()
export class Professional {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field(() => RoleProfessional )
  role: RoleProfessional ;

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
