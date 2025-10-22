// src/auth/split-token.service.ts
import * as crypto from 'crypto';
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ISplitTokenService } from '../common/interfaces/split-token.interface';

@Injectable()
export class SplitTokenService implements ISplitTokenService {
  private readonly logger = new Logger(SplitTokenService.name);
  
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  splitToken(token: string): { payload: string; signature: string } {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }
    return {
      payload: `${parts[0]}.${parts[1]}`,
      signature: parts[2],
    };
  }

  reconstructToken(payload: string, signature: string): string {
    return `${payload}.${signature}`;
  }

  async verifyReconstructedToken(payload: string, signature: string): Promise<any> {
    const token = this.reconstructToken(payload, signature);
    return this.jwtService.verifyAsync(token, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
    });
  }

  generateAccessToken(payload: any, csrfToken: string): string {
    const fullPayload = { ...payload, csrfToken };
    const expiresInValue = this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_IN');
    this.logger.debug(`generateAccessToken: JWT_ACCESS_TOKEN_EXPIRES_IN lido: ${expiresInValue} (tipo: ${typeof expiresInValue})`); // NOVO LOG
    
    return this.jwtService.sign(fullPayload, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: expiresInValue, // Usar o valor lido
    });
  }
  
  generateRefreshToken(payload: any): string {
    const expiresInValue = this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_IN');
    this.logger.debug(`generateRefreshToken: JWT_REFRESH_TOKEN_EXPIRES_IN lido: ${expiresInValue} (tipo: ${typeof expiresInValue})`); // NOVO LOG
    
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: expiresInValue, // Usar o valor lido
    });
  }

  generateCsrfToken(): string {
    const tokenBytes = crypto.randomBytes(32);
    const csrfToken = tokenBytes.toString('hex');
    return csrfToken;
  }

  decode(token: string): any {
    return this.jwtService.decode(token);
  }
}
