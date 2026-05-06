import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WebsocketsService {
  constructor(private readonly prisma: PrismaService) {}

  async saveMessage(data: { chatId: number; userId: number; message: string }) {
    return this.prisma.message.create({
      data: {
        chatId: data.chatId,
        userId: data.userId,
        message: data.message,
      },
      include: {
        user: { select: { id: true, name: true, subname: true, avatarUrl: true } },
      },
    });
  }
}