import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Assumindo que você tem um PrismaService
import { CreateProfessionalInput } from './dto/create-professional.input';
import { UpdateProfessionalInput } from './dto/update-professional.input';
import { Professional } from './entities/professional.entity'; // Importe a entidade Professional

@Injectable()
export class ProfessionalService {
  constructor(private prisma: PrismaService) {}

  async create(createProfessionalInput: CreateProfessionalInput): Promise<Professional> {
    return this.prisma.professional.create({
      data: createProfessionalInput,
    });
  }

  /**
   Property 'team' is missing in type '{ name: string; id: number; role: Role; phone: string; email: string; teamId: number; createdAt: Date; updatedAt: Date; }' but required in type 'Professional'.ts(2741)
professional.entity.ts(28, 3): 'team' is declared here.
   */

  async findAll(): Promise<Professional[]> {
    return this.prisma.professional.findMany({
      include: {
        team: true, // Inclua a equipe se precisar dela
      },
    });
  }

  async findOne(id: number): Promise<Professional | null> {
    return this.prisma.professional.findUnique({
      where: { id },
      include: {
        team: true,
      },
    });
  }

  async update(id: number, updateProfessionalInput: UpdateProfessionalInput): Promise<Professional> {
    return this.prisma.professional.update({
      where: { id },
      data: updateProfessionalInput,
    });
  }

  async remove(id: number): Promise<Professional> {
    return this.prisma.professional.delete({
      where: { id },
    });
  }
}