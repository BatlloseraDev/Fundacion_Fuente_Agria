import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordRecoveryService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Cumpliendo con el flujo solicitado
      throw new BadRequestException('Introduce un correo electrónico válido o registrado.');
    }

    // Generar token único (hex string seguro)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = await bcrypt.hash(resetToken, 10); //hashear el token en BBDD

    // Caducidad de 1 hora
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Guardar en BBDD
    await this.prisma.passwordResetToken.create({
      data: {
        token: tokenHash,
        userId: user.id,
        expiresAt,
      },
    });

    // Construir enlace 
    const resetLink = `${this.configService.get<string>('FRONTEND_URL')||'http://localhost:5173'}/reset-password/${resetToken}?email=${email}`;

    // Enviar correo (
    await this.mailService.sendResetPasswordEmail(user.email, resetLink);
  


    return { message: 'Se han enviado las instrucciones a tu correo.' };
  }

  async resetPassword(email: string, token: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new BadRequestException('Usuario no válido.');

    // Buscar tokens activos del usuario
    const resetTokens = await this.prisma.passwordResetToken.findMany({
      where: {
        userId: user.id,
        expiresAt: { gt: new Date() }, // Que no haya expirado
      },
      orderBy: { createdAt: 'desc' },
    });

    if (resetTokens.length === 0) {
      throw new BadRequestException('El token es inválido o ha caducado.');
    }

    // Verificar el token contra el hash guardado (se comprueba el más reciente)
    const validTokenRecord = resetTokens.find(async (record) => await bcrypt.compare(token, record.token));

    if (!validTokenRecord) {
      throw new BadRequestException('El token es inválido.');
    }

    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar usuario
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Invalidar tokens usados eliminándolos
    await this.prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    return { message: 'Contraseña actualizada correctamente.' };
  }
}