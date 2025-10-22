// auth/auth.service.ts

import {
  Injectable,
  Logger,
  ForbiddenException,
  InternalServerErrorException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { Response } from 'express';
import { User, Session, RoleUser } from '@prisma/client';
import * as ms from 'ms';
import { SplitTokenService } from './split-token.service';

interface JwtConfig {
  accessTokenSecret: string;
  accessTokenExpiresIn: string | number;
  refreshTokenSecret: string;
  refreshTokenExpiresIn: string | number;
}

interface VerifyAuthCodeResult {
  access_token: string;
  refresh_token: string;
  csrf_token: string;
  user: {
    id: number;
    email: string;
    username: string;
    fullname: string;
    avatar?: string | null;
    role: RoleUser;
    createdAt: Date;
    updatedAt: Date;
  };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private jwtConfig: JwtConfig;

  public readonly accessTokenName = 'access_token';
  public readonly accessPayloadName = 'access_payload';
  public readonly csrfName = 'csrf_token';

  public readonly accessTokenOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as 'lax',
    path: '/',
    signed: true,
  };

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private splitTokenService: SplitTokenService,
  ) {
    this.jwtConfig = {
      accessTokenSecret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
      accessTokenExpiresIn: this.configService.get<string | number>('JWT_ACCESS_TOKEN_EXPIRES_IN'),
      refreshTokenSecret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      refreshTokenExpiresIn: this.configService.get<string | number>('JWT_REFRESH_TOKEN_EXPIRES_IN'),
    };
    this.logger.debug(`AuthService constructor: accessTokenExpiresIn = ${this.jwtConfig.accessTokenExpiresIn}, type = ${typeof this.jwtConfig.accessTokenExpiresIn}`);
  }

  async sendAuthCode(email: string): Promise<{ message: string }> {
    try {
      this.logger.log(`Sending auth code to email: ${email}`);
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      let user = await this.prisma.user.findUnique({ where: { email } });

      if (!user) {
        user = await this.prisma.user.create({
          data: {
            email,
            username: email.split('@')[0],
            fullname: '',
            isActive: true,
            role: 'FREE',
          },
        });
      }

      await this.prisma.authCode.create({
        data: {
          code,
          email,
          userId: user.id,
          expiresAt,
          used: false,
        },
      });

      await this.mailService.sendAuthCode(email, code);

      this.logger.log(`Auth code sent successfully to: ${email}`);
      return { message: 'Código de autenticação enviado com sucesso.' };
    } catch (error) {
      this.logger.error(`Failed to send auth code to ${email}:`, error.message, error.stack);
      throw new InternalServerErrorException('Erro ao enviar código de autenticação.');
    }
  }

  splitToken(token: string): { payload: string; signature: string } {
    return this.splitTokenService.splitToken(token);
  }

  async removeSession(sessionId: string, userId?: number): Promise<void> {
    try {
      const where: any = { sessionId };
      if (userId) {
        where.userId = userId;
      }

      await this.prisma.session.deleteMany({ where });
      this.logger.log(`Session ${sessionId} removed successfully`);
    } catch (error) {
      this.logger.error(`Failed to remove session ${sessionId}:`, error.message, error.stack);
      throw new InternalServerErrorException('Erro ao remover sessão.');
    }
  }

  clearAuthCookies(res: Response): void {
    try {
      res.clearCookie(this.accessTokenName);
      res.clearCookie(this.accessPayloadName);
      res.clearCookie(this.csrfName);
      this.logger.debug('Auth cookies cleared successfully');
    } catch (error) {
      this.logger.error('Failed to clear auth cookies:', error.message, error.stack);
    }
  }

  async createSession(
    userId: number,
    accessTokenPayload: string,
    accessTokenSignature: string,
    refreshToken?: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<string> {
    const sessionId = uuidv4();
    const rawExpires = this.jwtConfig.accessTokenExpiresIn;

    this.logger.debug(`createSession: jwtConfig.accessTokenExpiresIn = ${rawExpires}, type = ${typeof rawExpires}`);

    let expiresInMs: number;

    try {
      expiresInMs =
        typeof rawExpires === 'string'
          ? ms(rawExpires)
          : typeof rawExpires === 'number'
            ? rawExpires * 1000
            : Number(rawExpires) * 1000;

      if (!expiresInMs || isNaN(expiresInMs) || !isFinite(expiresInMs)) {
        throw new Error(`Valor inválido para expiresInMs: ${expiresInMs}`);
      }

      this.logger.debug(`createSession: expiresInMs = ${expiresInMs} ms (${expiresInMs / 1000}s)`);
    } catch (error) {
      this.logger.error(`Erro ao processar JWT_ACCESS_TOKEN_EXPIRES_IN. Valor recebido: "${rawExpires}". Erro: ${error.message}`);
      throw new InternalServerErrorException('Erro de configuração de tempo de expiração da sessão.');
    }

    const expiresAt = new Date(Date.now() + expiresInMs);

    this.logger.debug(
      `createSession: Criando sessão com - sessionId: ${sessionId}, userId: ${userId}, expiresAt: ${expiresAt.toISOString()}`
    );

    try {
      const session = await this.prisma.session.create({
        data: {
          sessionId,
          userId,
          accessTokenSign: accessTokenPayload,
          expiresAt,
          refreshToken: refreshToken || null,
          userAgent: userAgent || null,
          ipAddress: ipAddress || null,
        },
      });

      this.logger.debug(`Sessão criada com sucesso: ${session.sessionId}`);
      return session.sessionId;
    } catch (error) {
      this.logger.error(`Erro ao criar sessão: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Erro ao criar sessão de usuário.');
    }
  }

  async validateToken(payload: string, signature: string): Promise<any> {
    try {
      const fullToken = `${payload}.${signature}`;
      this.logger.debug(`validateToken: Tentando verificar token completo: ${fullToken.substring(0, 20)}...`);

      const verifiedPayload = this.jwtService.verify(fullToken, {
        secret: this.jwtConfig.accessTokenSecret,
      });

      this.logger.debug(`Token validado para sub (userId como number): ${verifiedPayload.sub}`);
      return verifiedPayload;
    } catch (error) {
      this.logger.error('Erro na validação do token:', error.message, error.stack);
      throw new UnauthorizedException('Token inválido ou expirado.');
    }
  }

  setAuthCookies(res: Response, accessToken: string, csrfToken: string) {
    const { payload, signature } = this.splitTokenService.splitToken(accessToken);

    this.logger.debug(`setAuthCookies: Setando cookies - access_token (signature): ${signature.substring(0, 8)}..., csrf_token: ${csrfToken.substring(0, 8)}..., access_payload: ${payload.substring(0, 8)}...`);

    const expiresInMs =
      typeof this.jwtConfig.accessTokenExpiresIn === 'string'
        ? ms(this.jwtConfig.accessTokenExpiresIn)
        : Number(this.jwtConfig.accessTokenExpiresIn) * 1000;

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      expires: new Date(Date.now() + expiresInMs),
      signed: true,
    };

    res.cookie(this.accessTokenName, signature, cookieOptions);
    this.logger.debug(`Cookie '${this.accessTokenName}' (signature) set.`);

    res.cookie(this.csrfName, csrfToken, { ...cookieOptions, signed: false });
    this.logger.debug(`Cookie '${this.csrfName}' (CSRF) set.`);

    res.cookie(this.accessPayloadName, payload, { ...cookieOptions, signed: false });
    this.logger.debug(`Cookie '${this.accessPayloadName}' (header.payload) set.`);
  }

  async findValidSession(sessionId: string, accessTokenSign?: string): Promise<(Session & { user: User }) | null> {
    this.logger.debug(`findValidSession: sessionId recebido: ${sessionId}, accessTokenSign recebido: ${accessTokenSign?.substring(0, 10)}...`);
    const whereCondition = {
      sessionId,
      //...(accessTokenSign && { accessTokenSign }),
      expiresAt: { gt: new Date() },
    };
    this.logger.debug('findValidSession: Condição WHERE do Prisma:', whereCondition);
  
    try {
      const session = await this.prisma.session.findFirst({
        where: whereCondition,
        include: { user: true },
      });
  
      this.logger.debug('findValidSession: Resultado da busca Prisma:', session);
  
      if (!session) {
        this.logger.warn(`findValidSession: Sessão com ID ${sessionId} não encontrada com as condições especificadas.`);
        return null;
      }
  
      if (!session.user) {
        this.logger.warn(`findValidSession: Sessão com ID ${sessionId} encontrada, mas sem usuário associado.`);
        return null;
      }
  
      if (!session.user.isActive) {
        this.logger.warn(`findValidSession: Sessão com ID ${sessionId} encontrada, mas usuário ${session.user.id} está inativo.`);
        return null;
      }
  
      this.logger.debug(`findValidSession: Sessão com ID ${sessionId} e usuário ${session.user.id} é válida.`);
      return session;
    } catch (error) {
      this.logger.error('Erro ao buscar sessão no Prisma:', error);
      return null;
    }
  }
  

  /*async findValidSession(sessionId: string, accessTokenSign: string): Promise<(Session & { user: User }) | null> {
    const safeSessionId = String(sessionId);
  
    try {
      this.logger.debug(`findValidSession: Buscando sessão com sessionId: ${safeSessionId.substring(0, 8)}..., signature: ${accessTokenSign.substring(0, 8)}...`);
  
      const session = await this.prisma.session.findFirst({
        where: {
          sessionId: safeSessionId,
          accessTokenSign,
          expiresAt: { gt: new Date() },
        },
        include: { user: true },
      });
  
      if (session && session.user?.isActive) {
        this.logger.debug(`Sessão válida encontrada. userId: ${session.userId}`);
        return session;
      }
  
      this.logger.debug(`Sessão não encontrada ou inválida.`);
      return null;
    } catch (error) {
      this.logger.error(`Erro ao buscar sessão válida: ${error.message}`, error.stack);
      return null;
    }
  }*/
  
  async verifyAuthCode(code: string, email: string, userAgent?: string, ipAddress?: string): Promise<VerifyAuthCodeResult> {
    try {
      this.logger.log(`Attempting to verify auth code for email: ${email}, code: ${code.substring(0, 5)}...`);

      const authCode = await this.prisma.authCode.findFirst({
        where: {
          code,
          email,
          used: false,
          expiresAt: { gt: new Date() },
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true,
              fullname: true,
              avatar: true,
              role: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });

      if (!authCode) throw new ForbiddenException('Código de autenticação inválido ou expirado.');
      if (!authCode.user) throw new InternalServerErrorException('Usuário associado não encontrado.');

      await this.prisma.authCode.update({ where: { id: authCode.id }, data: { used: true } });

      const csrfToken = this.splitTokenService.generateCsrfToken();
      const basePayload = {
        sub: authCode.user.id,
        email: authCode.user.email,
        username: authCode.user.username,
        fullname: authCode.user.fullname,
        role: authCode.user.role,
        createdAt: authCode.user.createdAt,
        updatedAt: authCode.user.updatedAt,
      };

      const accessTokenInitial = this.splitTokenService.generateAccessToken(
        { ...basePayload, csrfToken },
        csrfToken,
      );

      const { payload, signature } = this.splitTokenService.splitToken(accessTokenInitial);

      const sessionId = await this.createSession(
        authCode.user.id,
        payload,
        signature,
        undefined,
        userAgent,
        ipAddress,
      );

      this.logger.debug(`verifyAuthCode: Sessão criada com sessionId: ${sessionId}`);

      const finalPayload = {
        ...basePayload,
        sessionId,
        csrfToken,
      };

      const access_token = this.splitTokenService.generateAccessToken(finalPayload, csrfToken);
      const refresh_token = this.splitTokenService.generateRefreshToken(finalPayload);

      return {
        access_token,
        refresh_token,
        csrf_token: csrfToken,
        user: {
          ...authCode.user,
        },
      };
    } catch (error) {
      this.logger.error(`Auth code verification failed for email ${email}:`, error.message, error.stack);
      throw error;
    }
  }
}
