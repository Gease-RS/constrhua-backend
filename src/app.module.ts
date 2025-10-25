import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Importe ConfigService
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { MailModule } from './mail/mail.module';
import { join } from 'path';
import { UsersModule } from './users/users.module';
import { PostModule } from './post/post.module';
import { CommentModule } from './comment/comment.module';
import { CategoryModule } from './category/category.module';
import { ReplyModule } from './reply/reply.module';
import { ReplyLikeModule } from './reply-like/reply-like.module';
import { ImageModule } from './image/image.module';
import { CommentLikeModule } from './comment-like/comment-like.module';
import { TagModule } from './tag/tag.module';
import { ConstructionModule } from './construction/construction.module';
import { TeamModule } from './team/team.module';
import { ProfessionalModule } from './professional/professional.module';
import { StageModule } from './stage/stage.module';
import { UploadModule } from './upload/upload.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { PhaseModule } from './phase/phase.module';
import { TaskModule } from './task/task.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      context: ({ req, res }: {req: Request; res: Response}) => ({
        req,
        res,
      }),
      playground: true,
      introspection: true,
    }),
    // CORREÇÃO AQUI: Usar JwtModule.registerAsync para ler variáveis de ambiente
    JwtModule.registerAsync({
      imports: [ConfigModule], 
      useFactory: async (configService: ConfigService) => ({
        global: true, 
        secret: configService.get<string>('JWT_ACCESS_TOKEN_SECRET'), 
        signOptions: { expiresIn: configService.get<string>('JWT_ACCESS_TOKEN_EXPIRES_IN') }, 
      }),
      inject: [ConfigService], 
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000, 
      limit: 5,   
    }]),
    PrismaModule,
    MailModule,
    AuthModule,
    UsersModule,
    PostModule,
    CommentModule,
    CategoryModule,
    ImageModule,
    ReplyModule,
    CommentLikeModule,
    ReplyLikeModule,
    TagModule,
    UploadModule,
    ConstructionModule,
    TeamModule,
    ProfessionalModule,
    StageModule,
    PhaseModule,
    TaskModule
  ],
})
export class AppModule {}
