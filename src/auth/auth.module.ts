// auth/auth.module.ts
import { Module } from '@nestjs/common';
// Não é necessário importar JwtModule ou ConfigModule aqui se eles são globais no AppModule
// import { JwtModule } from '@nestjs/jwt';
// import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { SplitTokenService } from './split-token.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../mail/mail.module';
import { GqlAuthGuard } from './guards/gql-auth.guard';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [AuthController], 
  imports: [
    PrismaModule, 
    MailModule,
    JwtModule
  ],
  providers: [
    AuthService, 
    AuthResolver, 
    GqlAuthGuard, 
    SplitTokenService, 
  ],
  exports: [AuthService, GqlAuthGuard],
})
export class AuthModule {}
