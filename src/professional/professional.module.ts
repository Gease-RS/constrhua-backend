import { Module } from '@nestjs/common';
import { ProfessionalService } from './professional.service';
import { ProfessionalResolver } from './professional.resolver';
import { PrismaModule } from '../prisma/prisma.module'; // Assumindo que você tem um PrismaModule

@Module({
  imports: [PrismaModule], // Importe o PrismaModule
  providers: [ProfessionalResolver, ProfessionalService],
  exports: [ProfessionalService], // Opcional: se outros módulos precisarem do ProfessionalService
})
export class ProfessionalModule {}