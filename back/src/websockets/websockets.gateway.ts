import {
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger, UseGuards } from '@nestjs/common';
import { WebsocketsService } from './websockets.service';
import { JwtAuthGuard } from '../auth/jwt_strategy/jwt-auth.guard';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})

@Injectable()
export class WebsocketsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() io!: Server;

  private logger = new Logger('WebsocketsGateway');

  constructor(private readonly websocketsService: WebsocketsService) {}

  handleConnection(client: Socket) {
    this.logger.verbose(`Nuevo cliente conectado.`);
  }

  handleDisconnect(client: Socket) {
    this.logger.verbose('Un cliente se ha desconectado.');
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('joinChat')
  handleJoinChat(@MessageBody() data: { chatId: number }, @ConnectedSocket() client: Socket) {
    const roomName = `chat_${data.chatId}`;
    client.join(roomName);

    this.logger.debug(`Cliente unido a la sala: ${roomName}`);
    return { status: 'ok', room: roomName };
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: { chatId: number; userId: number; message: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const savedMessage = await this.websocketsService.saveMessage(data);

      const roomName = `chat_${data.chatId}`;
      this.io.to(roomName).emit('newMessage', savedMessage);

      return { success: true };
    } catch (error) {
      this.logger.error(`Error guardando mensaje del chat ${data.chatId}:`, error);
      return { success: false, error: 'No se pudo procesar el mensaje' };
    }
  }
}