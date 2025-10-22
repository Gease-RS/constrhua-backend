// src/mail/mail.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transport;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('MAIL_HOST'),
      port: parseInt(this.configService.get('MAIL_PORT')),
      secure: false,
      auth: {
        user: this.configService.get('MAIL_USER'),
        pass: this.configService.get('MAIL_PASS'),
      },
    });
  }

  async sendAuthCode(email: string, code: string): Promise<void> {
    try {
      const baseUrl = this.configService.get('CORS_ORIGIN') || "http://localhost:3000";
      const authUrl = `${baseUrl}/auth/verify?code=${code}&email=${encodeURIComponent(email)}`;
      const logoUrl = `${baseUrl}/logo-constrhua.png`;

      const mailOptions = {
        from: this.configService.get('MAIL_FROM'),
        to: email,
        subject: 'Faça login na sua conta',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="${logoUrl}" alt="Logo Constrhua" style="max-width: 80px; margin-bottom: 15px;">
              <h2 style="color: #333; margin-bottom: 10px;">Acesse sua conta</h2>
              <p style="color: #666; font-size: 16px;">Clique no botão abaixo para fazer login automaticamente</p>
            </div>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${authUrl}" 
                 style="background-color: #007bff; /* Azul vibrante */
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        font-size: 16px; 
                        font-weight: bold;
                        display: inline-block;
                        box-shadow: 0 4px 8px rgba(0,123,255,0.3);">
                🔐 Fazer Login
              </a>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 30px 0;">
              <p style="margin: 0; color: #666; font-size: 14px; text-align: center;">
                <strong>Não consegue clicar no botão?</strong><br>
                Copie e cole este link no seu navegador:
              </p>
              <p style="word-break: break-all; background: white; padding: 10px; border-radius: 3px; font-family: monospace; font-size: 12px; margin: 10px 0 0 0; border: 1px dashed #ccc;">
                ${authUrl}
              </p>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
              <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
                ⏰ Este link expira em 5 minutos por segurança<br>
                🔒 Se você não solicitou este acesso, ignore este email
              </p>
            </div>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Authentication link sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${email}:`, error);
      throw new Error('Failed to send authentication code');
    }
  }

  async sendWelcomeEmail(email: string, name?: string): Promise<void> {
    try {

      const baseUrl = this.configService.get('CORS_ORIGIN') || "http://localhost:3000";
      const loginUrl = `${baseUrl}/login`;
      const boasVindas = `${baseUrl}/logo-constrhua.png`;

      const mailOptions = {
        from: this.configService.get('MAIL_FROM'),
        to: email,
        subject: 'Bem-vindo(a) ao nosso serviço! 🎉', 
        html: `
          <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.05); background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="${boasVindas}" alt="Ícone de Boas-vindas" style="max-width: 100px; margin-bottom: 15px; border-radius: 50%;">
              <h2 style="color: #333; margin-bottom: 10px; font-size: 28px;">Olá${name ? `, ${name}` : ''}!</h2>
              <p style="color: #666; font-size: 17px; line-height: 1.5;">Sua conta foi criada com sucesso.</br>
                Estamos muito felizes em tê-lo(a) a bordo!
              </p>
            </div>
            
            <div style="background: #e6f7ff; padding: 25px; border-radius: 8px; margin: 25px 0; border: 1px solid #b3e0ff;">
              <h3 style="color: #007bff; margin-top: 0; font-size: 20px;">Como funciona o login:</h3>
              <ul style="color: #444; line-height: 1.8; list-style-type: none; padding-left: 0;">
                <li style="margin-bottom: 10px;">✅ Sistema sem senha - mais seguro e prático</li>
                <li style="margin-bottom: 10px;">📧 Sempre que precisar acessar, você receberá um link direto por e-mail</li>
                <li style="margin-bottom: 10px;">⚡ Um clique e você estará logado(a)!</li>
                <li>⏰ Links expiram em 5 minutos por segurança</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-top: 35px;">
              <p style="color: #555; font-size: 16px; margin-bottom: 25px;">
                Para começar a explorar, faça login na sua conta agora mesmo:
              </p>
              <a href="${loginUrl}" 
                 style="background-color: #28a745; /* Verde para ação principal */
                        color: white; 
                        padding: 15px 35px; 
                        text-decoration: none; 
                        border-radius: 50px; /* Botão mais arredondado */
                        font-size: 18px; 
                        font-weight: bold;
                        display: inline-block;
                        box-shadow: 0 6px 12px rgba(40,167,69,0.3);
                        transition: background-color 0.3s ease, transform 0.2s ease;">
                👉 Ir para o Login
              </a>
            </div>

            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 40px;">
              <p style="color: #999; font-size: 13px; text-align: center; margin: 0;">
                Se tiver alguma dúvida, não hesite em nos contatar.
              </p>
              <p style="color: #999; font-size: 13px; text-align: center; margin: 5px 0 0 0;">
                Atenciosamente,<br>
                Equipe Constrhua
              </p>
            </div>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Welcome email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${email}:`, error);
    }
  }
}
