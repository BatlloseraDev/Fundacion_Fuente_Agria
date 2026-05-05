import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { LangchainService } from './langchain.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*', //TODO: En producción hay que ajustar esto 
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateway.name);

  constructor(private readonly langchainService: LangchainService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}. Se libera el estado de su conexión efímera.`);
    // Al desconectarse, perdemos la referencia del socket y con él su "historial de red"
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() payload: { text: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`Pregunta recibida del cliente ${client.id}: ${payload.text}`);
    
    // Le decimos al cliente que estamos escribiendo
    client.emit('typing', true);

    const answer = await this.langchainService.askQuestion(payload.text);

    // Detenemos el estado de "escribiendo" y enviamos la respuesta
    client.emit('typing', false);
    client.emit('receiveMessage', { text: answer, sender: 'bot' });
  }
}
