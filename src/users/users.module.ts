import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [PrismaModule, AuthModule, MailModule],
  providers: [UsersService, UsersResolver],
  exports: [UsersService],
})
export class UsersModule {}