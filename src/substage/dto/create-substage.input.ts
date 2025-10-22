import { InputType, Field, Float, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsNumber, Min, Max, IsOptional } from 'class-validator';

@InputType()
export class CreateSubStageInput {
  @Field()
  @IsNotEmpty({ message: 'O nome da subetapa não pode ser vazio.' })
  @IsString({ message: 'O nome da subetapa deve ser uma string.' })
  name: string;

  @Field(() => Float, { defaultValue: 0.0, nullable: true })
  @IsOptional()
  @IsNumber({}, { message: 'O progresso deve ser um número.' })
  @Min(0, { message: 'O progresso mínimo é 0.' })
  @Max(100, { message: 'O progresso máximo é 100.' })
  progress?: number; // Opcional ao criar, com um valor padrão no Prisma

  @Field(() => Int) 
  @IsNotEmpty({ message: 'O ID da etapa não pode ser vazio.' })
  @IsNumber({}, { message: 'O ID da etapa deve ser um número.' })
  stageId: number;
}