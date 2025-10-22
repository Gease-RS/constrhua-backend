import { Module } from '@nestjs/common';
import { StageService } from './stage.service';
import { StageResolver } from './stage.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { SubStageService } from 'src/substage/substage.service';

@Module({
  imports: [PrismaModule],
  providers: [StageService, StageResolver, SubStageService],
  exports: [StageService],
})
export class StageModule {}