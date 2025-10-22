// src/common/interfaces/gql-context.interface.ts
import { Request, Response } from 'express'; // Importe Request e Response do 'express'

// Esta interface define a estrutura do objeto de contexto do GraphQL
// conforme o NestJS e o Apollo Server o constroem.
export interface GqlContext {
  req: Request & { user?: any }; // 'req' é o objeto Request do Express. Adicione 'user' se você o anexa ao request.
  res: Response; // 'res' é o objeto Response do Express
  // Adicione outras propriedades se você as anexar ao contexto
  // connection?: any; // Para WebSockets (subscriptions)
  // payload?: any; // Payload do WebSocket, se aplicável
}