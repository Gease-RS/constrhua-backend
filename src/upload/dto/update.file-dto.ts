import { Field } from "@nestjs/graphql";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";

// upload-file.dto.ts
export class UploadFileDto {
    @Field()
    @IsNotEmpty()
    @IsEnum(['image', 'video'])
    type: 'image' | 'video';
  
    @Field()
    @IsOptional()
    @IsString()
    alt?: string;
  }