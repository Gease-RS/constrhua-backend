import { InputType, Field, Int } from '@nestjs/graphql';
import { RoleProfessional } from '@prisma/client';
import { IsString, IsNotEmpty, IsInt, IsEmail, IsEnum } from 'class-validator';

@InputType()
export class CreateProfessionalInput {
  @Field()
  @IsString()
  @IsNotEmpty({ message: 'O nome do profissional não pode ser vazio.' })
  name: string;

  @Field(() => RoleProfessional )
  @IsEnum(RoleProfessional , { message: 'Role inválida.' })
  role : RoleProfessional ;

  @Field()
  @IsString()
  @IsNotEmpty({ message: 'O telefone não pode ser vazio.' })
  phone: string;

  @Field()
  @IsEmail({}, { message: 'Formato de e-mail inválido.' })
  @IsNotEmpty({ message: 'O e-mail não pode ser vazio.' })
  email: string;

  @Field(() => Int)
  @IsInt()
  @IsNotEmpty({ message: 'O ID da equipe não pode ser vazio.' })
  teamId: number;
}