import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.chat.findMany({
      select: {
        id: true,
        user: {
          select: {
            id: true,
            name: true,
            subname: true,
            email: true,
            avatarUrl: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            message: true,
            createdAt: true,
          },
        },
      },
      orderBy: { id: 'desc' },
    });
  }

  async findMessages(chatId: number) {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      select: { id: true },
    });
    if (!chat) throw new NotFoundException('Chat no encontrado');

    return this.prisma.message.findMany({
      where: { chatId },
      select: {
        id: true,
        message: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            subname: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findMyChat(userId: number) {
    let chat = await this.prisma.chat.findFirst({
      where: { userId },
      include: {
        messages: {
          include: { user: { select: { id: true, name: true, subname: true, avatarUrl: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!chat) {
      chat = await this.prisma.chat.create({
        data: { userId },
        include: { messages: { include: { user: true } } },
      });
    }
    return chat;
  }
}