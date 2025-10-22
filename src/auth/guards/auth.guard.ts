import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { Request } from 'express'; 

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const accessTokenSign = request.signedCookies?.access_token;
    const accessTokenPayload = request.cookies?.access_payload;
    const csrfToken = request.cookies?.csrf_token;

    this.logger.debug(`AuthGuard: Lendo cookies - Signature: ${accessTokenSign?.substring(0, 10)}..., Payload: ${accessTokenPayload?.substring(0, 10)}..., CSRF: ${csrfToken?.substring(0, 10)}...`);

    if (!accessTokenSign || !accessTokenPayload || !csrfToken) {
      this.logger.warn('AuthGuard: Cookies de autenticação ausentes.');
      throw new UnauthorizedException('Credenciais de autenticação ausentes.');
    }

    try {
      const decodedPayload = await this.authService.validateToken(accessTokenPayload, accessTokenSign);
      this.logger.debug('AuthGuard: JWT reconstruído e validado. Payload:', decodedPayload);

      // Verificação do CSRF Token
      if (decodedPayload.csrfToken !== csrfToken) {
        this.logger.warn('AuthGuard: CSRF Token inválido.');
        throw new UnauthorizedException('CSRF Token inválido.');
      }

      // MUDANÇA CRÍTICA AQUI: Use decodedPayload.sessionId como o ID da sessão
      const sessionIdFromPayload = decodedPayload.sessionId; // <--- Use a propriedade 'sessionId' do payload

      if (typeof sessionIdFromPayload !== 'string') {
        this.logger.error(`AuthGuard: 'sessionId' no payload não é uma string. Tipo: ${typeof sessionIdFromPayload}, Valor: ${sessionIdFromPayload}`);
        throw new UnauthorizedException('Formato de ID de sessão inválido no token.');
      }

      const isValidSession = await this.authService.findValidSession(
        sessionIdFromPayload, 
        accessTokenSign
      );

      if (!isValidSession) {
        // MUDANÇA NO LOG: Para mostrar o sessionId real que falhou
        this.logger.warn(`AuthGuard: Sessão inválida ou expirada no banco de dados para session ID: ${sessionIdFromPayload}`);
        throw new UnauthorizedException('Sessão inválida ou expirada. Faça login novamente.');
      }

      request.user = isValidSession.user;
      return true;
    } catch (error) {
      this.logger.error(`AuthGuard: Falha de autenticação - ${error.message}`, error.stack);
      throw new UnauthorizedException('Falha na autenticação.');
    }
  }
}
