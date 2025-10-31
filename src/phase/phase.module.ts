import { Module } from '@nestjs/common';
import { PhaseService } from './phase.service';
import { PhaseResolver } from './phase.resolver';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { StageService } from 'src/stage/stage.service';
import { StageModule } from 'src/stage/stage.module';
import { PhaseController } from './phase.controller';

@Module({
  controllers: [PhaseController],
  imports: [PrismaModule, StageModule],
  providers: [PhaseResolver, PhaseService, PrismaService, StageService], 
  exports: [PhaseService],
})

export class PhaseModule {}
