import { InputType, Field, Int } from '@nestjs/graphql';
import { IsArray, IsBoolean, IsOptional, IsString, ValidateNested } from 'class-validator';
import { UpdateImageInput } from 'src/image/dto/update-image.input';

@InputType()
export class UpdatePostInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  content?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @Field(() => Int)
  authorId: number;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @Field(() => [Int], { nullable: true })
  @IsOptional()
  @IsArray()
  categories?: number[];

  @Field(() => [UpdateImageInput], { nullable: true })
  @IsOptional()
  @ValidateNested({ each: true })
  images?: UpdateImageInput[];
}
