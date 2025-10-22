import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; // Ajuste o caminho conforme sua estrutura
import { CreateConstructionInput } from './dto/create-construction.input';
import { Construction } from './entities/construction.entity';
import { UpdateConstructionInput } from './dto/update-construction.input'

@Injectable()
export class ConstructionService {
  constructor(private prisma: PrismaService) { }

  // construction.resolver.ts ou construction.service.ts
  async create(createConstructionInput: CreateConstructionInput): Promise<Construction> {
    try {
      const { userId, ...data } = createConstructionInput;
      console.log('🚀 Dados recebidos:', { userId, data });

      // Verificar se o usuário existe
      const userExists = await this.prisma.user.findUnique({
        where: { id: userId }
      });

      if (!userExists) {
        throw new Error(`Usuário com ID ${userId} não encontrado`);
      }

      console.log('✅ Usuário encontrado:', userExists);

      const newConstruction = await this.prisma.construction.create({
        data: {
          ...data,
          user: {
            connect: { id: userId },
          },
        },
        include: {
          user: true,
          teams: true,
          stages: true,
        },
      });

      return newConstruction;
    } catch (error) {
      console.error('❌ Erro ao criar construção:', error);

      // Transformar em um erro GraphQL
      throw new Error(`Falha ao criar construção: ${error.message}`);
    }
  }

  async findAll(): Promise<Construction[]> {
    return this.prisma.construction.findMany({
      include: {
        user: true,
        teams: true,
        stages: true,
      },
    });
  }

  async findOne(id: string | number): Promise<Construction | null> { // Aceita string ou number para robustez
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;

    if (isNaN(numericId as number)) { // Verifica se é NaN após a conversão
        throw new Error('ID de construção inválido fornecido. Esperado um número.');
    }

    return this.prisma.construction.findUnique({
        where: {
            id: numericId as number // Garante que o Prisma receba um number
        },
        include: {
            user: true,
            teams: true,
            stages: true
        }
    });
}

  async update(id: number, updateConstructionInput: UpdateConstructionInput): Promise<Construction> {
    return this.prisma.construction.update({
      where: { id },
      data: updateConstructionInput,
      include: {
        user: true,
        teams: true,
        stages: true,
      },
    });
  }

  async remove(id: number): Promise<Construction> {
    return this.prisma.construction.delete({
      where: { id },
      include: {
        user: true,
        teams: true,
        stages: true,
      },
    });
  }
}