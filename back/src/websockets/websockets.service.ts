import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WebsocketsService {
  constructor(private readonly prisma: PrismaService) {}

  async saveMessage(data: { chatId?: number; userId: number; message: string }) {
    let finalChatId = data.chatId;

    if (!finalChatId) {
      let chat = await this.prisma.chat.findFirst({ where: { userId: data.userId } });
      if (!chat) {
        chat = await this.prisma.chat.create({ data: { userId: data.userId } });
      }
      finalChatId = chat.id;
    }

    return this.prisma.message.create({
      data: {
        chatId: finalChatId,
        userId: data.userId,
        message: data.message,
      },
      include: {
        user: { select: { id: true, name: true, subname: true, avatarUrl: true } },
      },
    });
  }
}