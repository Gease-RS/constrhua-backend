// create-construction.input.ts
import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsNumber, IsOptional, IsDecimal } from 'class-validator';

@InputType()
export class CreateConstructionInput {
  // --- Campos de Localização e Identificação ---
  @Field(() => String)
  @IsNotEmpty({ message: 'O nome da obra não pode ser vazio.' })
  @IsString({ message: 'O nome da obra deve ser uma string.' })
  name: string;

  @Field(() => String)
  @IsNotEmpty({ message: 'O endereço da obra não pode ser vazio.' })
  @IsString({ message: 'O endereço da obra deve ser uma string.' })
  address: string;

  @Field(() => String)
  @IsNotEmpty({ message: 'O CEP da obra não pode ser vazio.' })
  @IsString({ message: 'O CEP da obra deve ser uma string.' })
  cep: string;

  @Field(() => String)
  @IsNotEmpty({ message: 'A cidade da obra não pode ser vazia.' })
  @IsString({ message: 'A cidade da obra deve ser uma string.' })
  city: string;

  @Field(() => String)
  @IsNotEmpty({ message: 'O distrito da obra não pode ser vazio.' })
  @IsString({ message: 'O distrito da obra deve ser uma string.' })
  district: string;

  // --- Relação com o Usuário ---
  @Field(() => Int, { description: 'ID do usuário responsável pela obra.' })
  @IsNotEmpty({ message: 'O ID do usuário não pode ser vazio.' })
  @IsNumber({}, { message: 'O ID do usuário deve ser um número.' })
  userId: number;
  
  // O campo 'progress' é omitido por ser gerado no service.
}