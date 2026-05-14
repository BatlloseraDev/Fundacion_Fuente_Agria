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

  @SubscribeMessage('sendBotMessage')
  async handleMessage(
    @MessageBody() payload: { text: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`Pregunta de ${client.id}: ${payload.text}`);

    client.emit('typing', true);

    let fullResponse = '';
    let interrupted = false;
    const INTERRUPTION_MESSAGE = '\n\n[Sistema]: Es posible que la IA se haya pillado, se ha interrumpido su ejecución.';

    // Llamamos a askQuestion pasando el callback para el streaming real de LangChain
    const answer = await this.langchainService.askQuestion(
      payload.text,
      client.id,
      (chunk: string) => {
        if (interrupted) return false; // Si ya se interrumpió, ignoramos más chunks y paramos el stream

        fullResponse += chunk;
        
        // Condiciones de interrupción
        const hasBadSymbols = fullResponse.includes('---') || fullResponse.includes('###');
        const wordCount = fullResponse.split(/\s+/).filter(word => word.length > 0).length;

        if (hasBadSymbols || wordCount > 1000) {
          interrupted = true;
          client.emit('messageChunk', { text: chunk + INTERRUPTION_MESSAGE });
          return false; // Interrumpimos el stream en el servicio
        } else {
          client.emit('messageChunk', { text: chunk });
        }
      }
    );

    client.emit('typing', false);

    // Opcional: enviar la respuesta completa al final por si el cliente la necesita
    // (Depende de cómo gestione tu frontend los chunks vs el mensaje final)
    if (interrupted) {
      client.emit('receiveMessage', { text: fullResponse + INTERRUPTION_MESSAGE, sender: 'bot' });
    } else {
      client.emit('receiveMessage', { text: answer, sender: 'bot' });
    }
  }
}
