import { InputType, Field, Float } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsNumber, Min, Max, IsOptional } from 'class-validator';

@InputType()
export class CreateStageInput {
  @Field()
  @IsNotEmpty({ message: 'O nome da etapa não pode ser vazio.' })
  @IsString({ message: 'O nome da etapa deve ser uma string.' })
  name: string;

  @Field(() => Float, { defaultValue: 0.0, nullable: true })
  @IsOptional()
  @IsNumber({}, { message: 'O progresso deve ser um número.' })
  @Min(0, { message: 'O progresso mínimo é 0.' })
  @Max(100, { message: 'O progresso máximo é 100.' })
  progress?: number; // Opcional ao criar, com um valor padrão no Prisma

  @Field(() => Number) // O ID da construção é obrigatório para associar a etapa
  @IsNotEmpty({ message: 'O ID da construção não pode ser vazio.' })
  @IsNumber({}, { message: 'O ID da construção deve ser um número.' })
  constructionId: number;
}





