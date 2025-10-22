import { InputType, Field, PartialType, ID, Float } from '@nestjs/graphql';
import { CreateStageInput } from './create-stage.input';
import { IsNotEmpty, IsNumber, Min, Max, IsOptional } from 'class-validator';

@InputType()
export class UpdateStageInput extends PartialType(CreateStageInput) {
  @Field(() => ID) // O ID é necessário para identificar qual etapa atualizar
  @IsNotEmpty({ message: 'O ID da etapa não pode ser vazio.' })
  @IsNumber({}, { message: 'O ID da etapa deve ser um número.' })
  id: number; // Mapeia para o ID do Prisma que é Int

  @Field({ nullable: true })
  name?: string;
  
  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber({}, { message: 'O progresso deve ser um número.' })
  @Min(0, { message: 'O progresso mínimo é 0.' })
  @Max(100, { message: 'O progresso máximo é 100.' })
  progress?: number; 
}
