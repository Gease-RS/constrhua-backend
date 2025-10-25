import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreatePhaseInput {
  @Field()
  name: string; // Ex: "Planejamento e Projeto", "Infraestrutura"

  @Field(() => Int, { description: 'ID da construção à qual esta fase pertence.' })
  constructionId: number;
  
  // O campo 'progress' é omitido, pois ele deve ser *calculado* pelo backend (serviço) 
  // após a criação e não fornecido pelo input do usuário.
}