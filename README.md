<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>


## Description

Projeto Split Token

## Estrutura

```bash
src/
├── app.module.ts
├── main.ts
├── auth/
│   ├── auth.module.ts
│   ├── auth.service.ts
│   ├── auth.resolver.ts
│   ├── auth.guard.ts
│   ├── split-token.service.ts
│   └── dto/
│       ├── login.dto.ts
│       └── user.dto.ts
├── users/
│   ├── users.module.ts
│   ├── users.service.ts
│   ├── users.resolver.ts
│   └── user.entity.ts
└── common/
    ├── decorators/
    │   └── current-user.decorator.ts
    └── guards/
        └── gql-auth.guard.ts
```
# Criar novo projeto NestJS
```bash
npm i -g @nestjs/cli
nest new nestjs-split-token-auth
cd nestjs-split-token-auth
```

# Instalar dependências necessárias
```bash
npm install @nestjs/graphql @nestjs/apollo @apollo/server graphql
npm install @nestjs/jwt @nestjs/passport passport passport-local
npm install express-session express-rate-limit
npm install bcryptjs class-validator class-transformer
npm install @types/express-session @types/bcryptjs --save-dev
yarn add @apollo/server
yarn add cookie-parser
yarn add nodemailer
yarn add @nestjs/config
yarn add multer
yarn add -D @types/multer
yarn add slugify
npm install ms
```

# Execute as migrações
```bash
npx prisma migrate dev --name migrate-initial
npx prisma generate
```

# 1. Cria usuário
mutation CreateNewUser {
  createUser(input: {
    email: "constrhua@gmail.com",
    fullname: "Constrhua Diretoria",
    username: "constrhua",
    role: ADMIN 
  }) {
    id
    email
    fullname
    username
    role
    createdAt 
  }
}

# 2. Listar todos usuário
query ListAllUsers {
  listAllUsers {
    id
    fullname
    username
    email
    role
    isActive # Campo importante para diferenciar o status
    createdAt
    updatedAt
  }
}

# 3. Listar usuários 
query FindActiveUsers {
  findActiveUsers {
    id
    fullname
    username
    role
    createdAt
  }
}

# 4. Listar usuários inativos
query FindInactiveUsers {
  findInactiveUsers {
    id
    fullname
    username
    email
    isActive
    role
  }
}

# 5. Solicitar código de autenticação
mutation SendAuthCode {
  sendAuthCode(input: {
    email: "user@example.com"
  })
}

# 6. Verificar código e fazer login
mutation VerifyAuthCode {
  verifyAuthCode(input: {
    code: "codigo-recebido-por-email"
    email: "user@example.com"
  }) {
    id
    email
    username
    fullname
    avatar
    role
  }
}

# 7. Verificar usuário atual
query Me {
  me {
    id
    email
    username
    fullname
    avatar
    role
  }
}

# 8. Logout
mutation Logout {
  logout
}

# 9. Criar Construção
mutation CreateConstruction {
  createConstruction(createConstructionInput: {
    name: "Projeto Casa Moderna I",
    address: "Rua das Palmeiras, 123",
    cep: "12345-678",
    city: "São Paulo",
    district: "Jardim América",
    userId: 1 # ID do usuário responsável
  }) {
    id
    name
    progress # Deve retornar 0.0
  }
}

# 10. Criar Fase
mutation CreatePhase {
  createPhase(createPhaseInput: {
    name: "Fase 1: Projeto e Fundações",
    constructionId: 1 # Use o ID da construção criada acima
  }) {
    id
    name
    progress
    constructionId
  }
}

# 11. Criar Stage
mutation CreateStage {
  createStage(createStageInput: {
    name: "Alvenaria e Estrutura",
    phaseId: 1 # Use o ID da fase criada acima
  }) {
    id
    name
    progress
    phaseId
  }
}

# 12. Criar Tarefa
mutation CreateTasks {
  # Tarefa 1: Maior Custo/Peso
  task1: createTask(createTaskInput: {
    name: "Montagem do telhado",
    stageId: 1, # ID da Stage
    budgetedCost: 50000.00, # 50% do custo total da Stage (se a Task 2 for 50k)
    status: NOT_STARTED
  }) {
    id
    name
    budgetedCost
    status
  }

  # Tarefa 2: Menor Custo/Peso
  task2: createTask(createTaskInput: {
    name: "Instalação Elétrica (Geral)",
    stageId: 1,
    budgetedCost: 50000.00,
    status: NOT_STARTED
  }) {
    id
    name
    budgetedCost
    status
  }
}

# 13. Mudar status para completo
mutation CompleteTaskAndRecalculate {
  completeTask(id: 1) { # Use o ID da Task 1 criada acima
    id
    name
    status
  }
  
  # O Service deve automaticamente chamar o recálculo da Stage,
  # mas você pode chamar o recálculo manual para verificar:
  recalculateStageProgress(stageId: 1) {
    id
    progress # Deve retornar 50.0 (se as tarefas 1 e 2 tiverem o mesmo custo)
  }
}

# Minhas Construções
query MinhasConstrucoesComProgresso {
  constructions {
    id
    name
    address
    progress # Progresso geral da construção (0.0 a 100.0)
    
    # 1. Dados do Usuário
    user {
      id
      username
      fullname
    }
    
    # 2. Fases (Phases)
    phases {
      id
      name
      progress # Progresso da fase
      
      # 3. Etapas (Stages)
      stages {
        id
        name
        progress # Progresso da etapa
        
        # 4. Tarefas (Tasks)
        tasks {
          id
          name
          budgetedCost
          status
          startDate
          endDate
        }
      }
    }
    
    # 5. Equipes (Teams)
    teams {
      id
      name
    }
  }
}

# Exemplo de teste com curl
/*
### 1. Login
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { login(loginInput: { username: \"admin\", password: \"password123\" }) { id username email name } }"
  }' \
  -c cookies.txt

### 2. Consultar usuário autenticado
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { me { id username email name } }"
  }' \
  -b cookies.txt

### 3. Logout
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { logout }"
  }' \
  -b cookies.txt
*/

docker run -d --name constrhua-app \
  -e POSTGRES_DB=constdb \
  -e POSTGRES_USER=gease \
  -e POSTGRES_PASSWORD=2365acb77492acf365cbd49cd7a75cb94cd1f088 \
  -p 54440:5432 \
  bitnami/postgresql:latest

npm cache clean --force 
yarn cache clean

https://github.com/Sophaos/mini-trello-with-auth/blob/main/frontend/src/apollo/links.ts

https://github.com/Sophaos/mini-trello-with-auth/blob/main/frontend/src/apollo/client.ts

https://github.com/lacerdacaroline/nest-auth/tree/master

https://github.com/lacerdacaroline?tab=repositories

https://github.com/fredaguiar/authenticator-frontend/blob/master/src/ApolloClient.tsx

https://github.com/fredaguiar/authenticator-frontend/tree/master

https://github.com/mmvergara/book-lits/tree/main

https://github.com/naresh5033/Dribble-next13-fullstack/tree/main

https://github.com/ahmamedhat/Chatly/tree/main

http://localhost:3001/auth/current-user

