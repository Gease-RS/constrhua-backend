import { Module } from '@nestjs/common';
import { PhaseService } from './phase.service';
import { PhaseResolver } from './phase.resolver';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { StageService } from 'src/stage/stage.service';
import { StageModule } from 'src/stage/stage.module';

@Module({
  imports: [PrismaModule, StageModule], 
  providers: [PhaseResolver, PhaseService, PrismaService, StageService], 
})
export class PhaseModule {}