import { CreateConstructionInput } from './create-construction.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateConstructionInput extends PartialType(CreateConstructionInput) {
  @Field(() => Int)
  id: number;
}
