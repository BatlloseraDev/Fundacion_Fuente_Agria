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

  async sendReservationConfirmation(email: string, reservation: any) {
    try {
      const items = this.formatReservationItems(reservation);
      const expiresAt = reservation.reservationExpiresAt
        ? new Date(reservation.reservationExpiresAt).toLocaleDateString('es-ES')
        : '3 dias habiles';

      await this.transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: email,
        subject: `Reserva ${reservation.ticketCode} - Fundacion Fuente Agria`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; max-width: 640px; margin: 0 auto;">
            <h2 style="color: #1a1f36;">Reserva recibida correctamente</h2>
            <p>Hola ${reservation.user?.name ?? ''}, hemos reservado tus productos.</p>
            <div style="background: #f8f9fb; padding: 18px; border-left: 4px solid #0d6efd; margin: 18px 0;">
              <p><strong>Ticket:</strong> ${reservation.ticketCode}</p>
              <p><strong>Nombre:</strong> ${reservation.user?.name ?? ''} ${reservation.user?.subname ?? ''}</p>
              <p><strong>Correo:</strong> ${reservation.user?.email ?? email}</p>
              <p><strong>Fecha limite:</strong> ${expiresAt}</p>
            </div>
            ${items}
            <p style="background: #fff3cd; color: #856404; padding: 15px;">
              Si no se presenta en 3 dias habiles, su reserva quedara anulada.
            </p>
          </div>
        `,
      });

      this.logger.verbose(`Reserva enviada a: ${email}`);
    } catch (error) {
      this.logger.error(`Error enviando reserva a ${email}`, error);
    }
  }

  async sendReservationAdminNotice(emails: string[], reservation: any) {
    const recipients = emails.filter(Boolean);
    if (recipients.length === 0) return;

    try {
      await this.transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: recipients.join(','),
        subject: `Nueva reserva ${reservation.ticketCode}`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; max-width: 640px; margin: 0 auto;">
            <h2>Nueva reserva de catalogo</h2>
            <p><strong>Ticket:</strong> ${reservation.ticketCode}</p>
            <p><strong>Usuario:</strong> ${reservation.user?.name ?? ''} ${reservation.user?.subname ?? ''}</p>
            <p><strong>Correo:</strong> ${reservation.user?.email ?? ''}</p>
            ${this.formatReservationItems(reservation)}
          </div>
        `,
      });

      this.logger.verbose(`Aviso de reserva enviado a admins`);
    } catch (error) {
      this.logger.error('Error enviando aviso de reserva a admins', error);
    }
  }

  async sendCartReminder(email: string, cart: any) {
    try {
      await this.transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: email,
        subject: 'Has olvidado reservar tus productos',
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; max-width: 640px; margin: 0 auto;">
            <h2 style="color: #1a1f36;">Tienes productos esperando en tu carrito</h2>
            <p>Has dejado productos en el carrito de la Fundacion Fuente Agria.</p>
            ${this.formatCartItems(cart)}
            <p style="background: #fff3cd; color: #856404; padding: 15px;">
              Si pasan otras 12 horas sin reservar, el carrito se vaciara y los productos volveran al inventario.
            </p>
          </div>
        `,
      });

      this.logger.verbose(`Recordatorio de carrito enviado a: ${email}`);
    } catch (error) {
      this.logger.error(`Error enviando recordatorio de carrito a ${email}`, error);
    }
  }

  private formatReservationItems(reservation: any) {
    const rows = (reservation.articles ?? [])
      .map(
        (item: any) =>
          `<li>${item.article?.name ?? 'Producto'} x${item.quantity} - ${Number(item.estimatedPrice).toFixed(2)} EUR</li>`,
      )
      .join('');

    return `<ul>${rows}</ul>`;
  }

  private formatCartItems(cart: any) {
    const rows = (cart.items ?? [])
      .map(
        (item: any) =>
          `<li>${item.article?.name ?? 'Producto'} x${item.quantity} - ${Number(item.article?.price ?? 0).toFixed(2)} EUR</li>`,
      )
      .join('');

    return `<ul>${rows}</ul>`;
  }
}
