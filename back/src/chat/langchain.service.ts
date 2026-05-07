import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Ollama, OllamaEmbeddings } from '@langchain/ollama';
import { MemoryVectorStore } from '@langchain/classic/vectorstores/memory';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { createStuffDocumentsChain } from '@langchain/classic/chains/combine_documents';
import { createRetrievalChain } from '@langchain/classic/chains/retrieval';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import { Document } from '@langchain/core/documents';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class LangchainService implements OnModuleInit {
  private readonly logger = new Logger(LangchainService.name);
  private chain: any;

  // Historial de conversación por socket (efímero, como la conexión)
  private sessionHistories = new Map<string, Array<HumanMessage | AIMessage>>();

  async onModuleInit() {
    await this.initializeRAG();
  }

  private async initializeRAG() {
    this.logger.log('Inicializando RAG en memoria...');
    try {
      const mdPath = path.join(process.cwd(), 'src', 'chat', 'data', 'conocimiento.md');
      const textContent = fs.readFileSync(mdPath, 'utf8');
      const docs = [new Document({ pageContent: textContent })];

      // chunkOverlap más alto para no perder ideas que cruzan fragmentos
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 300, 
      });
      const splitDocs = await textSplitter.splitDocuments(docs);

      const embeddings = new OllamaEmbeddings({
        model: 'nomic-embed-text',
        baseUrl: 'http://ollama:11434',
      });

      const vectorStore = await MemoryVectorStore.fromDocuments(splitDocs, embeddings);
      // k=5 para dar más contexto al modelo sin disparar el tiempo de respuesta
      const retriever = vectorStore.asRetriever({ k: 5 });

      const llm = new Ollama({
        baseUrl: 'http://ollama:11434',
        model: 'phi3',
        temperature: 0.1,  // CLAVE: bajo para RAG. 2.0 era el motivo de las invenciones
      });

      // Prompt limpio sin contradicciones internas
      const prompt = ChatPromptTemplate.fromMessages([
        [
          'system',
          `Eres el asistente virtual de la Fundación Fuente Agria. 
Responde ÚNICAMENTE con información del siguiente contexto. 
Si la pregunta no tiene respuesta en el contexto, di exactamente: 
"Lo siento, no tengo esa información. Contacta directamente con la Fundación Fuente Agria."
No añadas nada más en ese caso. Sé amable y conciso.

Contexto:
{context}`,
        ],
        // Historial de la conversación (últimas N rondas)
        new MessagesPlaceholder('chat_history'),
        ['human', '{input}'],
      ]);

      const documentChain = await createStuffDocumentsChain({ llm, prompt });
      this.chain = await createRetrievalChain({
        combineDocsChain: documentChain,
        retriever,
      });

      this.logger.log('RAG inicializado correctamente.');
    } catch (error) {
      this.logger.error('Error al inicializar RAG:', error);
    }
  }

  // Limpia el historial cuando el socket se desconecta
  clearSession(socketId: string) {
    this.sessionHistories.delete(socketId);
  }

  async askQuestion(
    question: string,
    socketId: string,
    onChunk?: (chunk: string) => void | boolean,
  ): Promise<string> {
    if (!this.chain) {
      const errorMsg = 'El sistema aún se está inicializando, inténtalo en unos segundos.';
      if (onChunk) onChunk(errorMsg);
      return errorMsg;
    }

    // Recupera o crea el historial de esta sesión
    if (!this.sessionHistories.has(socketId)) {
      this.sessionHistories.set(socketId, []);
    }
    const history = this.sessionHistories.get(socketId)!;

    // Limita el historial a las últimas 6 rondas (12 mensajes) para no sobrecargar el contexto
    const recentHistory = history.slice(-12);

    try {
      let finalAnswer = '';

      if (onChunk) {
        const stream = await this.chain.stream({
          input: question,
          chat_history: recentHistory,
        });

        for await (const chunk of stream) {
          if (chunk.answer !== undefined && chunk.answer !== null) {
            finalAnswer += chunk.answer;
            const shouldContinue = onChunk(chunk.answer);
            if (shouldContinue === false) {
              break;
            }
          }
        }
      } else {
        const response = await this.chain.invoke({
          input: question,
          chat_history: recentHistory,
        });
        finalAnswer = response.answer;
      }

      // Guarda la ronda actual en el historial
      history.push(new HumanMessage(question));
      history.push(new AIMessage(finalAnswer));

      return finalAnswer;
    } catch (error) {
      this.logger.error('Error al procesar la pregunta:', error);
      const errorMsg = 'Hubo un error al procesar tu consulta. Inténtalo de nuevo más tarde.';
      if (onChunk) onChunk(errorMsg);
      return errorMsg;
    }
  }
}