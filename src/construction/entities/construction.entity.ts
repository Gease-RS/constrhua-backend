import { Field, Int, ObjectType, Float } from '@nestjs/graphql';
import { Team } from 'src/team/entities/team.entity'; 
import { Phase } from 'src/phase/entities/phase.entity'; // ✨ Mudança: Importa Phase (o novo nível)
import { User } from 'src/users/entities/user.entity';
import { GraphQLDateTime } from 'graphql-scalars';

@ObjectType()
export class Construction {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  // --- Campos de Localização ---
  @Field()
  address: string;

  @Field()
  cep: string;

  @Field()
  city: string;

  @Field()
  district: string;

  // --- Campo de Progresso (Novo) ---
  @Field(() => Float, { description: 'Progresso total da construção, calculado pela média ponderada das Phases.' })
  progress: number; // ✨ Novo campo para rastrear o progresso geral

  // --- Relações com Usuário e Equipe ---
  @Field(() => Int) 
  userId: number;

  @Field(() => User) 
  user?: User;

  @Field(() => [Team], { nullable: true }) 
  teams?: Team[];

  // --- Relação com as Fases ---
  @Field(() => [Phase], { nullable: true }) // ✨ Relação alterada: Agora se relaciona com Phase
  phases?: Phase[];

  // --- Metadados ---
  @Field(() => GraphQLDateTime)
  createdAt: Date;

  @Field(() => GraphQLDateTime)
  updatedAt: Date;
}