import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreateProfessionalInput } from './create-professional.input';
import { IsInt, IsNotEmpty } from 'class-validator';
import { Role } from '@prisma/client';

@InputType()
export class UpdateProfessionalInput extends PartialType(CreateProfessionalInput) {
  @Field(() => Int)
  @IsInt()
  @IsNotEmpty()
  id: number;

  @Field(() => Role, { nullable: true })
  role?: Role; 
}