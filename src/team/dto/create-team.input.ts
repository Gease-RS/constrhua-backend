import { InputType, Field, Int } from '@nestjs/graphql';
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