import { Module } from '@nestjs/common';
import { StageService } from './stage.service';
import { StageResolver } from './stage.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { TaskModule } from 'src/task/task.module';

@Module({
  imports: [PrismaModule, TaskModule],
  providers: [StageService, StageResolver],
  exports: [StageService],
})
export class StageModule {}

