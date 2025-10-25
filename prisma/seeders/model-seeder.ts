import { PrismaClient, TaskStatus } from '@prisma/client';

const prisma = new PrismaClient();

// ID que usaremos como TEMPLATE/MODELO no PhaseService.
const MODEL_CONSTRUCTION_ID = 1;
const MODEL_USER_ID = 1; // ID de um usuário existente (pode ser um usuário 'system' ou o primeiro admin)

async function seedModel() {
  console.log('Iniciando o seeding do modelo base de construção...');

  // 1. Cria a CONSTRUÇÃO MODELO
  const modelConstruction = await prisma.construction.upsert({
    where: { id: MODEL_CONSTRUCTION_ID },
    update: { name: 'MODELO PADRÃO (Não Excluir)' },
    create: {
      id: MODEL_CONSTRUCTION_ID,
      name: 'MODELO PADRÃO (Não Excluir)',
      address: 'N/A',
      cep: '00000-000',
      city: 'Modelo',
      district: 'Modelo',
      progress: 0.0,
      userId: MODEL_USER_ID, 
    },
  });
  console.log(`Modelo Base criado/atualizado: ${modelConstruction.name}`);

  // 2. Cria as PHASES (Fases) do Modelo
  const phasesData = [
    { name: '01 - Planejamento e Projeto', weight: 15000 },
    { name: '02 - Serviços Preliminares', weight: 5000 },
    { name: '03 - Estrutura (Fundação e Alvenaria)', weight: 35000 },
    { name: '04 - Instalações e Cobertura', weight: 15000 },
    { name: '05 - Acabamento (Fase Final)', weight: 25000 },
    { name: '06 - Finalização', weight: 5000 },
  ];

  for (const [index, phaseItem] of phasesData.entries()) {
    const phaseName = phaseItem.name;

    const phase = await prisma.phase.create({
      data: {
        name: phaseName,
        constructionId: MODEL_CONSTRUCTION_ID,
        progress: 0.0,
      },
    });
    console.log(`   - Phase criada: ${phaseName}`);

    // 3. Cria as STAGES (Etapas) e TASKS (Tarefas) dentro de cada Phase
    // NOTE: Os custos orçados (budgetedCost) são fictícios e usados para ponderação.
    
    let stagesTasksData: Array<{ stageName: string, tasks: Array<{ name: string, cost: number }> }> = [];

    // --- SEEDING POR FASE ---
    if (index === 0) { // 01 - Planejamento e Projeto
        stagesTasksData = [
            { stageName: 'Projetos Arquitetônicos e Estruturais', tasks: [
                { name: 'Elaboração do Projeto Arquitetônico', cost: 7000 },
                { name: 'Elaboração do Projeto Estrutural', cost: 4000 },
            ]},
            { stageName: 'Documentação e Legalização', tasks: [
                { name: 'Obtenção do Alvará de Construção (Prefeitura)', cost: 4000 },
            ]},
        ];
    } else if (index === 1) { // 02 - Serviços Preliminares
        stagesTasksData = [
            { stageName: 'Preparação Inicial', tasks: [
                { name: 'Limpeza e Desmate do Terreno', cost: 1500 },
                { name: 'Locação da Obra (Demarcação)', cost: 1000 },
            ]},
            { stageName: 'Infraestrutura do Canteiro', tasks: [
                { name: 'Montagem do Barracão e Instalações Provisórias', cost: 2500 },
            ]},
        ];
    } else if (index === 2) { // 03 - Estrutura
        stagesTasksData = [
            { stageName: 'Fundações', tasks: [
                { name: 'Escavação e Impermeabilização do Alicerce', cost: 10000 },
                { name: 'Montagem de Sapatas/Estacas', cost: 8000 },
            ]},
            { stageName: 'Superestrutura e Paredes', tasks: [
                { name: 'Montagem de Pilares, Vigas e Lajes', cost: 12000 },
                { name: 'Levantamento de Alvenaria (Paredes)', cost: 5000 },
            ]},
        ];
    } else if (index === 3) { // 04 - Instalações e Cobertura
        stagesTasksData = [
            { stageName: 'Hidráulica e Esgoto', tasks: [
                { name: 'Passagem e Teste de Tubulação Hidráulica', cost: 6000 },
            ]},
            { stageName: 'Elétrica e Dados', tasks: [
                { name: 'Passagem da Fiação e Eletrodutos', cost: 4000 },
            ]},
            { stageName: 'Cobertura', tasks: [
                { name: 'Instalação da Estrutura Metálica/Madeiramento', cost: 3000 },
                { name: 'Colocação de Telhas e Calhas', cost: 2000 },
            ]},
        ];
    } else if (index === 4) { // 05 - Acabamento
        stagesTasksData = [
            { stageName: 'Revestimentos Internos', tasks: [
                { name: 'Emboço e Reboco (Paredes Internas)', cost: 5000 },
                { name: 'Instalação de Gesso e Forros', cost: 3000 },
            ]},
            { stageName: 'Pisos e Esquadrias', tasks: [
                { name: 'Assentamento de Pisos e Revestimentos Cerâmicos', cost: 8000 },
                { name: 'Instalação de Portas e Janelas', cost: 4000 },
            ]},
            { stageName: 'Pintura', tasks: [
                { name: 'Aplicação de Massa Corrida e Pintura (Duas Demãos)', cost: 5000 },
            ]},
        ];
    } else if (index === 5) { // 06 - Finalização
        stagesTasksData = [
            { stageName: 'Instalações Finais', tasks: [
                { name: 'Instalação de Louças e Metais Sanitários', cost: 2000 },
                { name: 'Instalação de Tomadas e Interruptores Finais', cost: 1000 },
            ]},
            { stageName: 'Entrega', tasks: [
                { name: 'Limpeza Final e Remoção do Canteiro', cost: 1000 },
                { name: 'Obtenção do Habite-se', cost: 1000 },
            ]},
        ];
    }


    for (const stageItem of stagesTasksData) {
        const stage = await prisma.stage.create({
            data: {
                name: stageItem.stageName,
                phaseId: phase.id,
                progress: 0.0,
            }
        });
        
        for (const taskItem of stageItem.tasks) {
            await prisma.task.create({
                data: {
                    name: taskItem.name,
                    stageId: stage.id,
                    budgetedCost: taskItem.cost,
                    status: TaskStatus.NOT_STARTED,
                }
            });
        }
    }
  }

  console.log('Seeding do modelo base concluído!');
}

seedModel()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });