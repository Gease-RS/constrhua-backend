import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePhaseInput } from './dto/create-phase.input';
import { UpdatePhaseInput } from './dto/update-phase.input';
import { PrismaService } from 'src/prisma/prisma.service';
import { Phase, TaskStatus } from '@prisma/client'; // Importa o Enum do Prisma Client

@Injectable()
export class PhaseService {
  constructor(private prisma: PrismaService) { }

  //--------------------------------------------------------------------------------------
  // 1. CRIAÇÃO (Onde entra a lógica do modelo/template)
  //--------------------------------------------------------------------------------------

   async createNewPhaseFromTemplate(constructionId: number) {
    // 1️⃣ Busca a construção modelo base (por exemplo, id=1)
    const templateConstructionId = 1; // ou defina dinamicamente

    // 2️⃣ Cria uma nova fase vinculada à construção informada
    const newPhase = await this.prisma.phase.create({
      data: {
        name: 'Nova Fase',
        progress: 0.0,
        constructionId,
      },
    });

    // 3️⃣ Copia estrutura da construção modelo para a nova fase
    await this.copyTemplateStructure(
      newPhase.id,
      constructionId,
      templateConstructionId,
    );

    return {
      message: 'Fase criada com sucesso!',
      phaseId: newPhase.id,
    };
  }

    private async copyTemplateStructure(
    newPhaseId: number,
    newConstructionId: number,
    templateConstructionId: number,
  ) {
    const templateStages = await this.prisma.stage.findMany({
      where: { phase: { constructionId: templateConstructionId } },
      include: { tasks: true },
    });

    for (const templateStage of templateStages) {
      const newStage = await this.prisma.stage.create({
        data: {
          name: templateStage.name,
          phaseId: newPhaseId,
          isSkipped: false,
          progress: 0.0,
        },
      });

      for (const templateTask of templateStage.tasks) {
        await this.prisma.task.create({
          data: {
            name: templateTask.name,
            stageId: newStage.id,
            budgetedCost: templateTask.budgetedCost ?? 0,
            status: 'NOT_STARTED',
          },
        });
      }
    }
  }

  async create(createPhaseInput: CreatePhaseInput) {
    const { name, constructionId } = createPhaseInput;

    // 1️⃣ Cria a nova Phase
    const newPhase = await this.prisma.phase.create({
      data: {
        name,
        constructionId,
        progress: 0.0,
      },
    });

    // 2️⃣ Verifica se deve copiar estrutura do modelo base
    const MODEL_ID = 1;
    const isModelCopy = await this.shouldCopyFromTemplate(constructionId);

    if (isModelCopy) {
      await this.copyTemplateStructure(newPhase.id, newPhase.constructionId, MODEL_ID);
    }

    return newPhase;
  }

  //--------------------------------------------------------------------------------------
  // 2. FUNÇÃO AUXILIAR: Lógica de Cópia (Deep Copy)
  //--------------------------------------------------------------------------------------

  private async shouldCopyFromTemplate(constructionId: number): Promise<boolean> {
    // Lógica de Negócio: Se a Construction for nova e for baseada em um modelo,
    // você copiaria todas as fases. Aqui, assumimos que esta função determina se
    // a Phase deve ser preenchida automaticamente.
    // 
    // Para simplificar, vamos simular que estamos sempre copiando do modelo 
    // (ID 1), mas você ajustaria isso com base no tipo de Construction.
    return true; // Simplificado: sempre copia do modelo
  }

  /*
  private async copyTemplateStructure(
  newPhaseId: number,
  newConstructionId: number,
  templateConstructionId: number
) {
  // 1. Busca as stages e tasks do modelo base
  const templateStages = await this.prisma.stage.findMany({
    where: { phase: { constructionId: templateConstructionId } },
    include: { tasks: true },
  });

  // 2. Replica a estrutura de forma independente (sem afetar progress)
  for (const templateStage of templateStages) {
    const newStage = await this.prisma.stage.create({
      data: {
        name: templateStage.name,
        phaseId: newPhaseId,
        isSkipped: false,         // nova etapa nunca é pulada
        progress: 0.0,            // sempre inicia zerada
      },
    });

    // 3. Replica as tarefas da stage modelo
    for (const templateTask of templateStage.tasks) {
      await this.prisma.task.create({
        data: {
          name: templateTask.name,
          stageId: newStage.id,
          budgetedCost: templateTask.budgetedCost ?? 0,  // copia custo orçado
          status: TaskStatus.NOT_STARTED,                // sempre reinicia status
        },
      });
    }
  }
}
*/

  //--------------------------------------------------------------------------------------
  // 3. CRUD BÁSICO
  //--------------------------------------------------------------------------------------

  // phase.service.ts (Exemplo do findAll)

  async findAll() {
    return this.prisma.phase.findMany({
      include: { stages: true },
    });
  }

  async findByConstruction(constructionId: number) {
    return this.prisma.phase.findMany({
      where: { constructionId },
      include: { stages: true },
    });
  }


   async findAllG(constructionId: number): Promise<Phase[]> {
    // Retorna o tipo complexo do Prisma, mas usamos 'as any' 
    // ou 'as Phase[]' para satisfazer o TypeScript no resolver.
    return this.prisma.phase.findMany({
      where: { constructionId },
      include: { stages: { include: { tasks: true } } },
    }) as any; // ✨ APLICAÇÃO DO TYPE CASTING
  }
  
  async findOne(id: number) {
    return this.prisma.phase.findUnique({
      where: { id }
    });
  }

  async update(id: number, updatePhaseInput: UpdatePhaseInput) {
    // A atualização de uma fase geralmente envolve apenas a mudança de nome.
    // Alterações estruturais (adição/remoção de stages) seriam feitas nos serviços de Stage/Task.
    return this.prisma.phase.update({
      where: { id },
      data: { name: updatePhaseInput.name },
    });
    // Nota: O recálculo de progresso global seria disparado por um serviço 
    // ou listener após a conclusão de uma Task.
  }

  async remove(id: number) {
    // A remoção de uma Phase deve ser CASCATA, removendo Stages e Tasks filhas.
    // (Garantir que a configuração do seu schema.prisma tenha `onDelete: Cascade` nas relações).
    try {
      await this.prisma.phase.delete({
        where: { id },
      });
      return { success: true, message: `Fase ${id} e suas etapas/tarefas associadas foram removidas.` };
    } catch (error) {
      // Tratar erros de integridade, se a exclusão em cascata falhar.
      throw new NotFoundException(`Não foi possível remover a Fase com ID ${id}.`);
    }
  }
}

