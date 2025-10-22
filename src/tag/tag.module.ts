import { Module } from '@nestjs/common';
import { TagService } from './tag.service';
import { TagResolver } from './tag.resolver';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SlugModule } from 'src/shared/slug.module';

@Module({
  imports: [PrismaModule, SlugModule], 
  providers: [TagResolver, TagService],
  exports: [TagService],
})
export class TagModule {}
