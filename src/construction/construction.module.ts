import { Module } from '@nestjs/common';
import { ConstructionResolver } from './construction.resolver';
import { ConstructionService } from './construction.service';

@Module({
  providers: [ConstructionResolver, ConstructionService],
})
export class ConstructionModule {}
