import {
  Resolver,
  Mutation,
  Args,
  Context,
  Query
} from '@nestjs/graphql';
import {
  Logger,
  UnauthorizedException,
  UseGuards
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { GqlAuthGuard } from './guards/gql-auth.guard';
import { AuthResult, SendAuthCodeDto, VerifyAuthCodeDto } from './dto/auth.dto';
import { UserDto } from './dto/user.dto';
import { User } from 'src/users/entities/user.entity';
import { Request } from 'express';
import { UserType } from 'src/users/dto/user.type';
import { GqlContext } from 'src/common/interfaces/gql-context.interface';

@Resolver()
export class AuthResolver {
  private readonly logger = new Logger(AuthResolver.name);

  constructor(private authService: AuthService) { }

  @Mutation(() => String)
  async sendAuthCode(
    @Args('input') input: SendAuthCodeDto,
  ): Promise<string> {
    const result = await this.authService.sendAuthCode(input.email);
    return result.message;
  }

  @Mutation(() => AuthResult)
  async verifyAuthCode(
    @Args('code') code: string, // Recebe 'code' diretamente
    @Args('email') email: string, // Recebe 'email' diretamente
    @Context() context: GqlContext,
  ): Promise<AuthResult> {
    const { req, res } = context;

    try {
      const userAgent = context.req.headers['user-agent'];
      const ipAddress = context.req.ip;

      const authResult = await this.authService.verifyAuthCode(
        code,
        email,
        userAgent,
        ipAddress
      );

      // Dividir o JWT em duas partes
      const splitted = this.authService.splitToken(authResult.access_token);

      // Criar sessão no database
      await this.authService.createSession(
        authResult.user.id,
        splitted.signature,
        authResult.refresh_token,
      );

      // Armazenar a assinatura na sessão HTTP
      Object.defineProperty(req.session, 'access_token_sign', {
        value: splitted.signature,
        enumerable: true,
      });

      Object.defineProperty(req.session, 'user_id', {
        value: authResult.user.id,
        enumerable: true,
      });

      // Armazenar header.payload no cookie
      res.cookie(
        this.authService.accessTokenName,
        splitted.payload,
        this.authService.accessTokenOptions
      );

      // Armazenar refresh token na sessão
      Object.defineProperty(req.session, 'refresh_token', {
        value: authResult.refresh_token || undefined,
        enumerable: true,
      });

      this.logger.log(`User ${authResult.user.id} logged in via email | ${req.ip}`);

      return {
        accessToken: authResult.access_token,
        refreshToken: authResult.refresh_token,
        csrfToken: authResult.csrf_token,
        user: authResult.user,
        message: 'Verificação bem-sucedida',
      };
    } catch (error) {
      this.logger.error('Auth code verification failed:', error);
      throw error;
    }
  }

  @Mutation(() => Boolean)
  async logout(@Context() context: any): Promise<boolean> {
    const { req, res } = context;

    try {
      // Remover sessão do database se existir
      if (req.session?.user_id && req.session?.access_token_sign) {
        await this.authService.removeSession(
          req.session.user_id,
          req.session.access_token_sign,
        );
      }

      // Limpar cookie
      res.clearCookie(this.authService.accessTokenName);

      // Limpar sessão HTTP
      req.session.destroy();

      return true;
    } catch (error) {
      this.logger.error('Logout failed:', error);
      return false;
    }
  }

  @Query(() => User)
  @UseGuards(GqlAuthGuard)
  async currentUser(@Context() context: { req: Request }): Promise<User> {
    console.log('Context.req.user:', context.req.user); // Debug

    if (!context.req.user) {
      throw new UnauthorizedException('User not found in context after authentication.');
    }

    return context.req.user;
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => UserType)
  me(@Context('req') req: Request) {
    return req.user;
  }
}