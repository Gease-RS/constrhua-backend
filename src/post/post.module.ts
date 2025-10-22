import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostResolver } from './post.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { PostController } from './post.controller';
import { PostFieldsResolver } from './post-field.resolver';
import { PostUpdateService } from './post.update';
import { TagModule } from 'src/tag/tag.module';
import { UsersModule } from 'src/users/users.module';
import { SlugService } from 'src/shared/slug.service';

@Module({
  imports: [PrismaModule, UsersModule, TagModule], 
  controllers: [PostController],
  providers: [PostService, PostResolver, SlugService, PostFieldsResolver, PostUpdateService], 
})
export class PostModule {}
