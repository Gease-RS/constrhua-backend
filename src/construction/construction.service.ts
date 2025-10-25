import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConstructionInput } from './dto/create-construction.input';
import { UpdateConstructionInput } from './dto/update-construction.input';
import { Construction } from './entities/construction.entity';

@Injectable()
export class ConstructionService {
  constructor(private readonly prisma: PrismaService) { }

  //----------------------------------------------------------------------
  // 1. CRIAÇÃO (Inicializa o progresso)
  //----------------------------------------------------------------------

  async create(createConstructionInput: CreateConstructionInput): Promise<Construction> {
    const { userId, ...rest } = createConstructionInput;

    return this.prisma.construction.create({
      data: {
        ...rest,
        progress: 0.0,
        user: {
          connect: { id: userId },
        },
      },
      include: {
        user: true,
        teams: true,
        phases: {
          include: {
            stages: {
              include: {
                tasks: true,
              },
            },
          },
        },
      },
    }) as unknown as Construction;
  }

  //----------------------------------------------------------------------
  // 2. BUSCA
  //----------------------------------------------------------------------

  async findAll(): Promise<Construction[]> {
    return this.prisma.construction.findMany({
      include: {
        user: true,
        teams: true,
        phases: {
          include: {
            stages: {
              include: {
                tasks: true,
              },
            },
          },
        },
      },
    }) as unknown as Construction[];
  }

  async findOne(id: number): Promise<Construction> {
    const construction = await this.prisma.construction.findUnique({
      where: { id },
      include: {
        user: true,
        teams: true,
        phases: {
          include: {
            stages: {
              include: {
                tasks: true,
              },
            },
          },
        },
      },
    });

    if (!construction) {
      throw new NotFoundException(`Construção com ID ${id} não encontrada`);
    }

    return construction as unknown as Construction;
  }

  //----------------------------------------------------------------------
  // 3. ATUALIZAÇÃO E REMOÇÃO
  //----------------------------------------------------------------------

  async update(id: number, updateConstructionInput: UpdateConstructionInput): Promise<Construction> {
    await this.findOne(id);

    return this.prisma.construction.update({
      where: { id },
      data: updateConstructionInput,
      include: {
        user: true,
        teams: true,
        phases: {
          include: {
            stages: {
              include: {
                tasks: true,
              },
            },
          },
        },
      },
    }) as unknown as Construction;
  }

  async remove(id: number): Promise<Construction> {
    await this.findOne(id);

    const deletedConstruction = await this.prisma.construction.delete({
      where: { id },
    });

    return deletedConstruction as Construction;
  }

  //----------------------------------------------------------------------
  // 4. LÓGICA DE PROGRESSO (Cálculo Final)
  //----------------------------------------------------------------------

  /**
   * Calcula o progresso ponderado da Construção com base no custo orçado
   * e no progresso das Phases filhas.
   */
  async calculateConstructionProgress(constructionId: number): Promise<number> {
    const phases = await this.prisma.phase.findMany({
      where: { constructionId },
      include: {
        stages: {
          include: {
            tasks: true
          }
        }
      }
    });

    if (phases.length === 0) return 0.0;

    let totalBudgetedCost = 0;
    let completedCost = 0;

    for (const phase of phases) {
      const phaseCost = phase.stages.reduce((sum, stage) => {
        return sum + stage.tasks.reduce((taskSum, task) => taskSum + task.budgetedCost, 0);
      }, 0);

      const phaseCompletedCost = (phase.progress / 100) * phaseCost;

      totalBudgetedCost += phaseCost;
      completedCost += phaseCompletedCost;
    }

    if (totalBudgetedCost === 0) return 0.0;

    return (completedCost / totalBudgetedCost) * 100;
  }

  async updateConstructionProgress(constructionId: number): Promise<Construction> {
    const progress = await this.calculateConstructionProgress(constructionId);

    return this.prisma.construction.update({
      where: { id: constructionId },
      data: { progress: parseFloat(progress.toFixed(2)) },
      include: {
        user: true,
        teams: true,
        phases: {
          include: {
            stages: {
              include: {
                tasks: true,
              },
            },
          },
        },
      },
    }) as unknown as Construction;
  }
}