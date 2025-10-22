import { InputType, Field, ObjectType } from '@nestjs/graphql';
import { IsEmail, IsString, IsNotEmpty } from 'class-validator';
import { UserDto } from './user.dto';

@InputType()
export class SendAuthCodeDto {
  @Field()
  @IsEmail()
  email: string;
}

@InputType()
export class VerifyAuthCodeDto {
  @Field()
  @IsString()
  @IsNotEmpty()
  code: string;

  @Field()
  @IsEmail()
  email: string;
}

@ObjectType()
export class AuthResult {
  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;

  @Field()
  csrfToken: string; 

  @Field(() => UserDto) 
  user: UserDto;

  @Field({ nullable: true })
  message?: string; 
}


