// src/phase/dto/create-phase.input.ts
import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreatePhaseInput {
  @Field()
  name: string; // Ex: "Planejamento e Projeto"

  @Field(() => Int, { description: 'ID da construção à qual esta fase pertence.' })
  constructionId: number;
}
