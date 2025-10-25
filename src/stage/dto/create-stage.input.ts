import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateStageInput {
  @Field()
  name: string; // Ex: "Escolha do Terreno", "Fundação"

  @Field(() => Int, { description: 'ID da fase à qual esta etapa pertence.' })
  phaseId: number;
  
}






