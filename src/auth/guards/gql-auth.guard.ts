// auth/guards/gql-auth.guard.ts

import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthService } from '../auth.service'; // Ajuste o caminho se necessário
import { Request } from 'express'; // Importe Request do express

@Injectable()
export class GqlAuthGuard implements CanActivate {
  private readonly logger = new Logger(GqlAuthGuard.name);

  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req as Request; // Acessa o objeto request do Express

    const accessTokenSign = request.signedCookies?.access_token;
    const accessTokenPayload = request.cookies?.access_payload;
    const csrfToken = request.cookies?.csrf_token;

    this.logger.debug(`GqlAuthGuard: Lendo cookies para GraphQL - Signature: ${accessTokenSign?.substring(0, 10)}..., Payload: ${accessTokenPayload?.substring(0, 10)}..., CSRF: ${csrfToken?.substring(0, 10)}...`);

    if (!accessTokenSign || !accessTokenPayload || !csrfToken) {
      this.logger.warn('GqlAuthGuard: Cookies de autenticação ausentes.');
      throw new UnauthorizedException('Credenciais de autenticação ausentes.');
    }

    try {
      const decodedPayload = await this.authService.validateToken(accessTokenPayload, accessTokenSign);
      this.logger.debug('GqlAuthGuard: JWT reconstruído e validado para GraphQL. Payload:', decodedPayload);

      // Verificação do CSRF Token
      if (decodedPayload.csrfToken !== csrfToken) {
        this.logger.warn('GqlAuthGuard: CSRF Token inválido.');
        throw new UnauthorizedException('CSRF Token inválido.');
      }

      // MUDANÇA CRÍTICA AQUI: Use decodedPayload.sessionId como o ID da sessão
      const sessionIdFromPayload = decodedPayload.sessionId; // <--- Use a propriedade 'sessionId' do payload

      if (typeof sessionIdFromPayload !== 'string') {
        this.logger.error(`GqlAuthGuard: 'sessionId' no payload não é uma string. Tipo: ${typeof sessionIdFromPayload}, Valor: ${sessionIdFromPayload}`);
        throw new UnauthorizedException('Formato de ID de sessão inválido no token.');
      }

      const isValidSession = await this.authService.findValidSession(
        sessionIdFromPayload, 
        accessTokenSign
      );

      if (!isValidSession) {
        this.logger.warn(`GqlAuthGuard: Sessão inválida ou expirada no banco de dados para session ID: ${sessionIdFromPayload}`);
        throw new UnauthorizedException('Sessão inválida ou expirada. Faça login novamente.');
      }

      // Anexa o usuário validado ao request para que os resolvers possam acessá-lo
      request.user = isValidSession.user; // Certifique-se de que o tipo Request no Express estende para incluir 'user'
      return true;
    } catch (error) {
      this.logger.error(`GqlAuthGuard: Falha de autenticação GraphQL - ${error.message}`, error.stack);
      throw new UnauthorizedException('Falha na autenticação GraphQL.');
    }
  }
}
