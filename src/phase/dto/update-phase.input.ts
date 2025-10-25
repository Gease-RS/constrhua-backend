import { CreatePhaseInput } from './create-phase.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdatePhaseInput extends PartialType(CreatePhaseInput) {
  @Field(() => Int)
  id: number;
}
