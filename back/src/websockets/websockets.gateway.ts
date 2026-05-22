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
import { Injectable, Logger } from '@nestjs/common';
import { WebsocketsService } from './websockets.service';

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

  @SubscribeMessage('joinChat')
  handleJoinChat(@MessageBody() data: { chatId: number }, @ConnectedSocket() client: Socket) {
    if (data.chatId) {
      client.join(`chat_${data.chatId}`);
    }
    return { status: 'ok' };
  }

  @SubscribeMessage('joinAdmins')
  handleJoinAdmins(@ConnectedSocket() client: Socket) {
    client.join('admin_room');
    return { status: 'ok' };
  }

  @SubscribeMessage('joinOrders')
  handleJoinOrders(@ConnectedSocket() client: Socket) {
    client.join('orders_room');
    return { status: 'ok' };
  }

  @SubscribeMessage('joinReservations')
  handleJoinReservations(@ConnectedSocket() client: Socket) {
    client.join('reservations_room');
    return { status: 'ok' };
  }

  emitNewOrder(order: any) {
    this.io.to('orders_room').emit('newOrder', order);
  }

  emitOrderUpdated(order: any) {
    this.io.to('orders_room').emit('orderUpdated', order);
  }

  emitNewReservation(reservation: any) {
    this.io.to('reservations_room').emit('newReservation', reservation);
  }

  emitReservationUpdated(reservation: any) {
    this.io.to('reservations_room').emit('reservationUpdated', reservation);
  }

  emitStockUpdated(article: { id: number; stock: number; available: boolean }) {
    this.io.emit('stockUpdated', article);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: { chatId?: number; userId: number; message: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      if (!data?.userId || !data?.message?.trim()) {
        this.logger.warn(`Mensaje de soporte invalido recibido de ${client.id}`);
        return { success: false, error: 'Mensaje invalido' };
      }

      const savedMessage = await this.websocketsService.saveMessage(data);
      const roomName = `chat_${savedMessage.chatId}`;

      client.join(roomName);

      this.io.to(roomName).to('admin_room').emit('newMessage', savedMessage);

      return { success: true };
    } catch (error) {
      this.logger.error(`Error guardando mensaje:`, error);
      return { success: false, error: 'No se pudo procesar el mensaje' };
    }
  }
}
