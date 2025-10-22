import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class DeleteCategoryInput {
  @Field(() => Int)
  @IsNotEmpty({ message: 'O ID da categoria é obrigatório' })
  id: number;
}