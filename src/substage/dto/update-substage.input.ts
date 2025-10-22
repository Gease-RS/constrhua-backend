import { InputType, Field, PartialType, ID, Float, Int } from '@nestjs/graphql';
import { CreateSubStageInput } from './create-substage.input';
import { IsNotEmpty, IsNumber, Min, Max, IsOptional } from 'class-validator';

@InputType()
export class UpdateSubStageInput extends PartialType(CreateSubStageInput) {
  @Field(() => Int) // O ID é necessário para identificar qual subetapa atualizar
  @IsNotEmpty({ message: 'O ID da subetapa não pode ser vazio.' })
  @IsNumber({}, { message: 'O ID da subetapa deve ser um número.' })
  id: number; // Mapeia para o ID do Prisma que é Int

  // O progresso pode ser ajustado na atualização, se você quiser validar novamente
  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber({}, { message: 'O progresso deve ser um número.' })
  @Min(0, { message: 'O progresso mínimo é 0.' })
  @Max(100, { message: 'O progresso máximo é 100.' })
  progress?: number;
}