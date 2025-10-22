// src/user/user.service.ts
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserInput } from './dto/update-user.input';
import { RoleUser } from '@prisma/client';
import { User } from './entities/user.entity';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    private readonly prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async createUser(data: {
    email: string;
    fullname: string;
    username: string;
    role: RoleUser; 
  }): Promise<User> { 
    try {
      // 1. Verificar se o e-mail já está em uso
      const existingEmail = await this.prisma.user.findUnique({ where: { email: data.email } });
      if (existingEmail) {
        throw new BadRequestException('E-mail já está em uso.');
      }
    
      // 2. Verificar se o username já está em uso
      const existingUsername = await this.prisma.user.findUnique({ where: { username: data.username } });
      if (existingUsername) {
        throw new BadRequestException('Username já está em uso.');
      }
    
      // 3. Criar o usuário no banco de dados
      const newUser = await this.prisma.user.create({ data });

      // 4. Enviar o e-mail de boas-vindas
      // O método sendWelcomeEmail pode ser assíncrono, mas não precisamos esperar por ele para retornar o usuário.
      // É uma boa prática não bloquear a resposta da API por causa do envio de e-mail.
      // Você pode usar .then().catch() ou um bloco try-catch interno para logar erros no envio de e-mail.
      this.mailService.sendWelcomeEmail(newUser.email, newUser.fullname)
        .then(() => this.logger.log(`Welcome email sent to ${newUser.email}`))
        .catch(error => this.logger.error(`Failed to send welcome email to ${newUser.email}:`, error.message, error.stack));
      
      // 5. Retornar o novo usuário
      return newUser;
    } catch (error) {
      this.logger.error(`Failed to create user:`, error.message, error.stack);
      throw error; // Relança a exceção para que o controlador possa tratá-la
    }
  }

  async listAll() {
  return this.prisma.user.findMany({
    // Sem a cláusula where: { isActive: true }, ele retorna todos.
    select: {
      id: true,
      fullname: true,
      username: true,
      email: true, // Incluindo email, pois é útil na lista geral
      isActive: true, // Campo essencial para ver o status
      avatar: true,
      bio: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

  async findAll() {
    return this.prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        fullname: true,
        username: true,
        avatar: true,
        bio: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findInactive() {
  return this.prisma.user.findMany({
    where: { isActive: false }, 
    select: {
      id: true,
      fullname: true,
      username: true,
      email: true, 
      avatar: true,
      bio: true,
      role: true,
      isActive: true, 
      createdAt: true,
      updatedAt: true,
    },
  });
}

  async findById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullname: true,
        username: true,
        email: true,
        avatar: true,
        bio: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: number, data: UpdateUserInput) {
    const user = await this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        fullname: true,
        username: true,
        email: true,
        avatar: true,
        bio: true,
        role: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async deactivate(id: number) {
    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'User deactivated successfully' };
  }
}
