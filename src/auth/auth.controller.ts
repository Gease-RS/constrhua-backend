import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  Logger,
  Req,
  Get,
  UnauthorizedException,
  UseGuards,
  NotFoundException,
  BadRequestException, // Mantenha para lançar BadRequestException explicitamente se precisar
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { CustomThrottle } from 'src/common/decorators/custom-throttle.decorator';
import { AuthGuard } from './guards/auth.guard';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';

// DTO para a requisição de verificação
class VerifyAuthCodeDto {
  code: string;
  email: string;
}

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private authService: AuthService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) { }

  @Post('send-code')
  async sendAuthCode(@Body('email') email: string) {
    this.logger.log(`Received request to send auth code to: ${email}`);
    return this.authService.sendAuthCode(email);
  }

  @CustomThrottle(5, 60)
  @Post('verify')
  async verifyAuthCode(
    @Body() verifyDto: VerifyAuthCodeDto, // O ValidationPipe vai validar este DTO
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    this.logger.log(`Received verification request for email: ${verifyDto.email}, code: ${verifyDto.code.substring(0, 5)}...`);

    const userAgent = req.headers['user-agent'] || 'unknown';
    const ipAddress = (req.ip || req.headers['x-forwarded-for'] as string) || 'unknown';

    try {
      const { access_token, refresh_token, csrf_token, user } =
        await this.authService.verifyAuthCode(
          verifyDto.code,
          verifyDto.email,
          userAgent,
          ipAddress,
        );

      this.authService.setAuthCookies(res, access_token, csrf_token);

      this.logger.log(`User ${user.id} successfully verified. Cookies set.`);
      return {
        message: 'Verification successful',
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          fullname: user.fullname,
          avatar: user.avatar,
          role: user.role,
        },
      };
    } catch (error) {
      this.logger.error(`Verification failed for email ${verifyDto.email}: ${error.message}`, error.stack);

      // --- CORREÇÃO AQUI ---
      // Relança a exceção original. O NestJS e seus filtros de exceção globais
      // (como o padrão para HttpExceptions) irão formatar a resposta corretamente.
      // Se o erro original for uma BadRequestException do ValidationPipe,
      // ele será retornado como 400 Bad Request com a mensagem de validação.
      throw error;
    }
  }

  // No AuthController.ts, dentro de currentUser
  @Get('current-user')
  @UseGuards(AuthGuard)
  async currentUser(@Req() request: Request & { user: User }) { // Adicione a tipagem para Request.user
    this.logger.log('Accessing /auth/current-user endpoint.');
    this.logger.debug('Request.user object from AuthGuard:', request.user);

    // Verifique se request.user existe e se ele tem a propriedade 'id' (que é o ID do usuário)
    if (!request.user || !request.user.id) { // <-- CORRIGIDO AQUI: de .sub para .id
      this.logger.error('current-user: Usuário não encontrado na requisição após AuthGuard.');
      throw new UnauthorizedException('Usuário não autenticado ou inválido.');
    }

    const userFromDb = await this.prisma.user.findUnique({
      where: { id: request.user.id }, // <-- CORRIGIDO AQUI: de .sub para .id
      select: {
        id: true,
        email: true,
        username: true,
        fullname: true,
        role: true,
        avatar: true,
      },
    });

    if (!userFromDb) {
      this.logger.error(`current-user: Usuário com ID ${request.user.id} não encontrado no banco de dados.`); // <-- CORRIGIDO AQUI: de .sub para .id
      throw new NotFoundException('Usuário não encontrado no banco de dados.');
    }

    this.logger.log(`current-user: Dados do usuário para ID ${userFromDb.id} retornados.`);
    // Note que 'csrfToken' não está diretamente no objeto userFromDb
    // Ele está no payload do JWT (request.user.csrfToken se você passar o payload)
    // Ou você já tem acesso a ele via cookies ou payload completo.
    // Se você precisa do csrfToken aqui, ele já vem no request.user se o request.user for o payload completo do JWT.
    // Mas, como você está fazendo `request.user = isValidSession.user;` no AuthGuard,
    // `request.user` é um `User` do Prisma, que não tem `csrfToken`.
    // Se quiser o csrfToken aqui, você precisará pegá-lo do token decodificado
    // ou diretamente dos cookies no `currentUser` novamente, ou modificar o AuthGuard para anexar mais coisas.
    // Por enquanto, vou remover o csrfToken aqui para evitar um `undefined`.
    return {
      ...userFromDb,
      // csrfToken: request.user.csrfToken, // <-- Provavelmente deve ser removido ou pego de outra forma
    };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    this.logger.log('Logout requested. Clearing authentication cookies.');
    this.authService.clearAuthCookies(res);
    return { message: 'Logout realizado com sucesso' };
  }
}