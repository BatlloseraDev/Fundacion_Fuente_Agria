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
  cors: { origin: '*' }, // TODO: ajustar en producción
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateway.name);

  constructor(private readonly langchainService: LangchainService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
    // Libera el historial de conversación de esta sesión
    this.langchainService.clearSession(client.id);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() payload: { text: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`Pregunta de ${client.id}: ${payload.text}`);

    client.emit('typing', true);

    // Llamamos a askQuestion pasando el callback para el streaming real de LangChain
    const answer = await this.langchainService.askQuestion(
      payload.text,
      client.id,
      (chunk: string) => {
        // Por cada token/fragmento que genera Ollama, lo enviamos al cliente
        client.emit('messageChunk', { text: chunk });
      }
    );

    client.emit('typing', false);

    // Opcional: enviar la respuesta completa al final por si el cliente la necesita
    // (Depende de cómo gestione tu frontend los chunks vs el mensaje final)
    client.emit('receiveMessage', { text: answer, sender: 'bot' });
  }
}