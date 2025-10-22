import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamInput } from './dto/create-team.input';
import { UpdateTeamInput } from './dto/update-team.input';
import { Team } from './entities/team.entity';

@Injectable()
export class TeamService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTeamInput: CreateTeamInput): Promise<Team> {
    return this.prisma.team.create({
      data: {
        name: createTeamInput.name,
        constructionId: createTeamInput.constructionId
      },
      include: {
        construction: true,
        professionals: true,
      },
    });
  }

  /** ERROR
   * 
   * @returns Type '{ construction: { userId: number; name: string; address: string; cep: string; city: string; district: string; id: number; createdAt: Date; updatedAt: Date; }; professionals: { name: string; ... 6 more ...; teamId: number; }[]; } & { ...; }' is not assignable to type 'Team'.
  Types of property 'professionals' are incompatible.
    Type '{ name: string; id: number; createdAt: Date; updatedAt: Date; email: string; role: Role; phone: string; teamId: number; }[]' is not assignable to type 'Professional[]'.
      Property 'team' is missing in type '{ name: string; id: number; createdAt: Date; updatedAt: Date; email: string; role: Role; phone: string; teamId: number; }' but required in type 'Professional'.ts(2322)
   */

      /** DTO
       * 
       * @returns import { InputType, Field, Int } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsInt } from 'class-validator';

@InputType()
export class CreateTeamInput {
  @Field()
  @IsString()
  @IsNotEmpty({ message: 'O nome da equipe não pode ser vazio.' })
  name: string;

  @Field(() => Int)
  @IsInt()
  @IsNotEmpty({ message: 'O ID da construção não pode ser vazio.' })
  constructionId: number;
}
       */

/** ENTITY
 * 
 * @returns 
 * import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { Professional } from '../../professional/entities/professional.entity';
import { Construction } from '../../construction/entities/construction.entity';
import { GraphQLDateTime } from 'graphql-scalars';

@ObjectType()
export class Team {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field(() => Int)
  constructionId: number;

  @Field(() => Construction)
  construction: Construction; 

  @Field(() => [Professional], { nullable: true })
  professionals?: Professional[]; 

  @Field(() => GraphQLDateTime)
  createdAt: Date;

  @Field(() => GraphQLDateTime)
  updatedAt: Date;
}
 */

/** SCHEMA
 * 
 * @returns model Construction {
  id           Int       @id @default(autoincrement()) 
  name         String
  address      String
  cep          String
  city         String
  district     String
  userId       Int       
  user         User      @relation(fields: [userId], references: [id])
  teams        Team[]
  stages       Stage[]

  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}

model Team {
  id           Int       @id @default(autoincrement()) 
  name         String    // Ex: Equipe de Arquitetos
  construction Construction @relation(fields: [constructionId], references: [id])
  constructionId Int       
  professionals Professional[]

  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}

model Professional {
  id           Int       @id @default(autoincrement()) 
  name         String
  role         Role
  phone        String
  email        String
  team         Team      @relation(fields: [teamId], references: [id])
  teamId       Int       

  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}

enum Role {
  PROPRIETARIO
  CONSTRUTOR
  ARQ         // Arquiteto
  ENG         // Engenheiro
  MESTRE      // Mestre de obras
  SUPERVISOR
  OPERADOR
  AUTONOMO
}

model Stage {
  id           Int       @id @default(autoincrement()) 
  name         String    // Ex: Estrutura, Instalações, etc.
  progress     Float     @default(0.0) // Ex: 50%
  constructionId Int       
  construction Construction @relation(fields: [constructionId], references: [id])
  substages    SubStage[]    // Subetapas editáveis

  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}

model SubStage {
  id           Int       @id @default(autoincrement()) 
  name         String      // Ex: Hidráulica, Elétrica
  progress     Float     @default(0.0) // Ex: 20%
  stageId      Int       
  stage        Stage      @relation(fields: [stageId], references: [id])

  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}
 */

  async findAll(): Promise<Team[]> {
    return this.prisma.team.findMany({
      include: {
        construction: true,
        professionals: true,
      },
    });
  }

  async findOne(id: number): Promise<Team> {
    const team = await this.prisma.team.findUnique({
      where: { id },
      include: {
        construction: true,
        professionals: true,
      },
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }

    return team;
  }

  async update(id: number, updateTeamInput: UpdateTeamInput): Promise<Team> {
    await this.findOne(id); // Verifica se existe
    
    return this.prisma.team.update({
      where: { id },
      data: {
        name: updateTeamInput.name,
        constructionId: updateTeamInput.constructionId
      },
      include: {
        construction: true,
        professionals: true,
      },
    });
  }

  async remove(id: number): Promise<Team> {
    await this.findOne(id); // Verifica se existe
    
    return this.prisma.team.delete({
      where: { id },
      include: {
        construction: true,
        professionals: true,
      },
    });
  }
}