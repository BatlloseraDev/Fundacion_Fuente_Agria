import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Ollama, OllamaEmbeddings } from '@langchain/ollama';
import { MemoryVectorStore } from '@langchain/classic/vectorstores/memory';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { createStuffDocumentsChain } from '@langchain/classic/chains/combine_documents';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import { Document } from '@langchain/core/documents';
import { PrismaService } from '../prisma/prisma.service';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class LangchainService implements OnModuleInit {
  private readonly logger = new Logger(LangchainService.name);
  private documentChain: any;
  private retriever: any;

  constructor(private readonly prisma: PrismaService) {}

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
        chunkSize: 700,
        chunkOverlap: 120,
      });
      const splitDocs = await textSplitter.splitDocuments(docs);

      const embeddings = new OllamaEmbeddings({
        model: 'nomic-embed-text',
        baseUrl: 'http://ollama:11434',
      });

      const vectorStore = await MemoryVectorStore.fromDocuments(splitDocs, embeddings);
      // k=5 para dar más contexto al modelo sin disparar el tiempo de respuesta
      this.retriever = vectorStore.asRetriever({ k: 4 });

      const llm = new Ollama({
        baseUrl: 'http://ollama:11434',
        model: process.env.OLLAMA_CHAT_MODEL || 'qwen2.5:1.5b',
        temperature: 0.1,
        numPredict: 500,
        numCtx: 4096,
        keepAlive: '10m',
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

Da respuestas completas. Si haces una lista, cierrala con una frase final util.
No cortes una frase a medias.
Si el contexto contiene datos de base de datos con un total de elementos, debes listar TODOS esos elementos.
No resumas ni omitas productos, encargos o actividades cuando el usuario pregunte que hay, cuales hay o que teneis.

Contexto:
{context}`,
        ],
        // Historial de la conversación (últimas N rondas)
        new MessagesPlaceholder('chat_history'),
        ['human', '{input}'],
      ]);

      this.documentChain = await createStuffDocumentsChain({ llm, prompt });

      this.logger.log('RAG inicializado correctamente.');
    } catch (error) {
      this.logger.error('Error al inicializar RAG:', error);
    }
  }

  // Limpia el historial cuando el socket se desconecta
  clearSession(socketId: string) {
    this.sessionHistories.delete(socketId);
  }

  private normalizeQuestion(question: string) {
    return question
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[¿?¡!.,;:()]/g, ' ')
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => {
        const dictionary: Record<string, string> = {
          k: 'que',
          q: 'que',
          ke: 'que',
          qe: 'que',
          xq: 'por que',
          pq: 'por que',
          x: 'por',
          pa: 'para',
          p: 'para',
          cm: 'como',
          komo: 'como',
          com: 'como',
          d: 'de',
          dl: 'del',
          tmb: 'tambien',
          tb: 'tambien',
          xa: 'para',
          xfa: 'por favor',
          porfa: 'por favor',
          ola: 'hola',
          holaa: 'hola',
          wenass: 'buenas',
          grax: 'gracias',
          info: 'informacion',
          tlf: 'telefono',
          tel: 'telefono',
          mail: 'email',
          ubi: 'ubicacion',
          dnd: 'donde',
          kuanto: 'cuanto',
          ai: 'hay',
          ay: 'hay',
          ago: 'hago',
          acer: 'hacer',
          aser: 'hacer',
          kiero: 'quiero',
          kier: 'quiero',
          personalisada: 'personalizada',
          personlisada: 'personalizada',
          personlizada: 'personalizada',
          fundasion: 'fundacion',
          catalgo: 'catalogo',
          catlogo: 'catalogo',
          encarg: 'encargo',
          actis: 'actividades',
          loguear: 'iniciar sesion',
          pass: 'contrasena',
          password: 'contrasena',
        };

        return dictionary[word] ?? word;
      })
      .join(' ');
  }

  private isCatalogQuestion(question: string) {
    return /\b(productos?|catalogo|tienda|articulos?|comprar|vendeis|teneis|tipos?|categorias?|etiquetas?|personalizables?|restauracion|artesania)\b/.test(question);
  }

  private isOrdersQuestion(question: string) {
    return /\b(encargos?|pedidos?|presupuesto|personalizad[ao]s?|tazas?|sillas?|bordad[ao]s?|boda|empresa|evento)\b/.test(question);
  }

  private isActivitiesQuestion(question: string) {
    return /\b(actividades?|talleres?|eventos?|excursiones?|ceramica|senderismo|mercadillo)\b/.test(question);
  }

  private async getCatalogContext() {
    const products = await this.prisma.article.findMany({
      include: {
        categories: { include: { categoryArticle: true } },
        labels: { include: { label: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (products.length === 0) {
      return 'Catalogo actual: no hay productos publicados.';
    }

    const categoryMap = new Map<string, string[]>();
    const labelMap = new Map<string, string[]>();

    for (const product of products) {
      const categories = product.categories.length
        ? product.categories.map((item) => item.categoryArticle.name)
        : ['Sin categoria'];
      const labels = product.labels.length
        ? product.labels.map((item) => item.label.name)
        : ['Sin etiquetas'];

      for (const category of categories) {
        categoryMap.set(category, [...(categoryMap.get(category) ?? []), product.name]);
      }

      for (const label of labels) {
        labelMap.set(label, [...(labelMap.get(label) ?? []), product.name]);
      }
    }

    const categoryLines = [...categoryMap.entries()]
      .map(([category, names]) => `- ${category}: ${names.length} producto(s): ${names.join(', ')}`)
      .join('\n');

    const labelLines = [...labelMap.entries()]
      .map(([label, names]) => `- ${label}: ${names.length} producto(s): ${names.join(', ')}`)
      .join('\n');

    const productLines = products
      .map((product) => {
        const category = product.categories[0]?.categoryArticle?.name ?? 'Sin categoria';
        const availability = product.available ? 'disponible' : 'no disponible';
        const labels = product.labels.map((item) => item.label.name).join(', ') || 'sin etiquetas';
        return `- ${product.name}. Categoria: ${category}. Precio: ${product.price.toFixed(2)} EUR. Estado: ${availability}. Etiquetas: ${labels}. Descripcion: ${product.description}`;
      })
      .join('\n');

    return `Catalogo actual desde base de datos.
Total de productos: ${products.length}.
Categorias reales del catalogo:
${categoryLines}

Etiquetas reales del catalogo:
${labelLines}

Productos reales del catalogo. Debes listar exactamente ${products.length} productos si el usuario pregunta por productos:
${productLines}`;
  }

  private async getOrdersContext() {
    const orders = await this.prisma.order.findMany({
      where: { active: true },
      orderBy: { id: 'desc' },
      take: 10,
    });

    if (orders.length === 0) {
      return 'Encargos actuales: no hay encargos activos publicados.';
    }

    const orderLines = orders
      .map((order) => {
        const price = order.price !== null ? `${order.price.toFixed(2)} EUR` : 'precio por confirmar';
        const days =
          order.timeInitial && order.timeFinal
            ? Math.max(
                1,
                Math.ceil((order.timeFinal.getTime() - order.timeInitial.getTime()) / 86400000),
              )
            : null;
        const time = days ? `${days} dias aproximadamente` : 'tiempo por confirmar';
        return `- ${order.title}. Precio orientativo: ${price}. Tiempo estimado: ${time}. Descripcion: ${order.text}`;
      })
      .join('\n');

    return `Encargos actuales desde base de datos. Total de encargos: ${orders.length}. Debes listar exactamente ${orders.length} encargos si el usuario pregunta por encargos:\n${orderLines}`;
  }

  private async getActivitiesContext() {
    const activities = await this.prisma.actividad.findMany({
      include: { category: true },
      orderBy: { date: 'desc' },
      take: 10,
    });

    if (activities.length === 0) {
      return 'Actividades actuales: no hay actividades publicadas.';
    }

    const activityLines = activities
      .map((activity) => {
        const category = activity.category?.name ?? 'Sin categoria';
        const date = activity.date.toLocaleDateString('es-ES');
        return `- ${activity.title}. Categoria: ${category}. Fecha: ${date}. Descripcion: ${activity.description}`;
      })
      .join('\n');

    return `Actividades actuales desde base de datos. Total de actividades: ${activities.length}. Debes listar exactamente ${activities.length} actividades si el usuario pregunta por actividades:\n${activityLines}`;
  }

  private async getDynamicContext(question: string) {
    const sections: string[] = [];

    if (this.isCatalogQuestion(question)) {
      sections.push(await this.getCatalogContext());
    }

    if (this.isOrdersQuestion(question)) {
      sections.push(await this.getOrdersContext());
    }

    if (this.isActivitiesQuestion(question)) {
      sections.push(await this.getActivitiesContext());
    }

    return sections.join('\n\n');
  }

  async askQuestion(
    question: string,
    socketId: string,
    onChunk?: (chunk: string) => void | boolean,
  ): Promise<string> {
    if (!this.documentChain || !this.retriever) {
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
    const recentHistory = history.slice(-4);

    try {
      let finalAnswer = '';
      const normalizedQuestion = this.normalizeQuestion(question);
      const retrievedDocs = await this.retriever.invoke(normalizedQuestion);
      const dynamicContext = await this.getDynamicContext(normalizedQuestion);
      const context = dynamicContext
        ? [new Document({ pageContent: dynamicContext }), ...retrievedDocs]
        : retrievedDocs;

      if (onChunk) {
        const stream = await this.documentChain.stream({
          input: normalizedQuestion,
          chat_history: recentHistory,
          context,
        });

        for await (const chunk of stream) {
          const text = typeof chunk === 'string' ? chunk : (chunk?.answer ?? chunk?.text ?? '');
          if (text) {
            finalAnswer += text;
            const shouldContinue = onChunk(text);
            if (shouldContinue === false) {
              break;
            }
          }
        }
      } else {
        const response = await this.documentChain.invoke({
          input: normalizedQuestion,
          chat_history: recentHistory,
          context,
        });
        finalAnswer = typeof response === 'string' ? response : response.answer;
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
