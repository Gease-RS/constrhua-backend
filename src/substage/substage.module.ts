import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { StageModule } from '../stage/stage.module';
import { SubStageService } from './substage.service';
import { SubStageResolver } from './substage.resolver';

@Module({
  imports: [PrismaModule, StageModule],
  providers: [SubStageService, SubStageResolver],
  exports: [SubStageService],
})
export class SubStageModule {}