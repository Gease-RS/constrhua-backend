import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser'; // Mantenha

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurar CORS
  app.enableCors({
    allowedHeaders: ['content-type', 'Authorization', 'X-Access-Payload', 'X-CSRF-Token'], // Adicionado os headers customizados
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000', // Certifique-se de que esta é a URL do seu frontend
    credentials: true,  // Essencial para cookies em requisições cross-origin
  });


  // Cookie parser (essencial para ler req.cookies e req.signedCookies)
  // Passe um segredo para o cookieParser para que ele possa validar cookies assinados
  // O segredo DEVE ser o mesmo usado para assinar o cookie 'access_token' se ele for assinado
  app.use(cookieParser(process.env.COOKIE_SECRET)); // Adicione COOKIE_SECRET ao seu .env

  app.useGlobalPipes(new ValidationPipe());
  /*
  app.useGlobalPipes(new ValidationPipe({
    transform: true, // Habilita a transformação automática de tipos
    whitelist: true, // Remove propriedades que não estão definidas no DTO
    forbidNonWhitelisted: true, // Lança um erro se propriedades não definidas forem enviadas
  }));
  */

  // Inicia a aplicação NestJS
  const port = process.env.PORT || 8001;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();