import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;
  private logger = new Logger('MailService');

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async sendOrderConfirmation(email: string, orderData: any) {
    try {
      const mailOptions = {
        from: process.env.MAIL_FROM,
        to: email,
        subject: `Confirmación de Encargo #${orderData.id} - Fundación Fuente Agria`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1a1f36;">¡Hola! Hemos recibido tu encargo 👋</h2>
            <p>Tu encargo ha sido registrado correctamente en nuestro sistema.</p>
            <div style="background: #f8f9fb; padding: 20px; border-left: 4px solid #4cc9f0; margin: 20px 0;">
              <p><strong>Nº de Encargo:</strong> #${orderData.id}</p>
              <p><strong>Título:</strong> ${orderData.title}</p>
            </div>
            <p style="background: #fff3cd; color: #856404; padding: 15px;">
              ⚠️ <strong>IMPORTANTE:</strong> Puedes pasarnos los archivos multimedia respondiendo directamente a este correo, o a través del chat de la web.
            </p>
          </div>
        `,
      };
      await this.transporter.sendMail(mailOptions);
      this.logger.verbose(`Confirmación enviada a: ${email}`);
    } catch (error) {
      this.logger.error(`Error enviando confirmación a ${email}`, error);
    }
  }

  async sendOrderReady(email: string, orderData: any) {
    try {
      const mailOptions = {
        from: process.env.MAIL_FROM,
        to: email,
        subject: `¡Tu encargo #${orderData.id} está LISTO! 🎉`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #06d6a0;">¡Tu encargo ya está terminado!</h2>
            <p>El encargo <strong>#${orderData.id}</strong> (<em>${orderData.title}</em>) ha sido marcado como <strong>COMPLETADO</strong>.</p>
            <p>Ya puedes pasar a recogerlo por nuestras instalaciones. ¡Gracias por confiar en nosotros!</p>
          </div>
        `,
      };
      await this.transporter.sendMail(mailOptions);
      this.logger.verbose(`Aviso de 'Listo' enviado a: ${email}`);
    } catch (error) {
      this.logger.error(`Error enviando aviso a ${email}`, error);
    }
  }
}