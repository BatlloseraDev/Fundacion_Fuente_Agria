import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOllama, OllamaEmbeddings } from '@langchain/ollama';
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

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

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

      const llm = new ChatOllama({
        baseUrl: 'http://ollama:11434',
        model: this.configService.get<string>('OLLAMA_CHAT_MODEL') || 'qwen2.5:1.5b',
        temperature: 0,
        numPredict: 500,
        numCtx: 4096,
        keepAlive: '10m',
      });

      // Prompt limpio sin contradicciones internas
      const prompt = ChatPromptTemplate.fromMessages([
        [
          'system',
          `Eres el asistente virtual de la Fundación Fuente Agria. 
Responde ÚNICAMENTE basándote en la información proporcionada en el Contexto. 
Si la respuesta no está en el Contexto, di exactamente: "Lo siento, no tengo esa información. Contacta directamente con la Fundación Fuente Agria."

Instrucciones:
- Si el usuario pregunta qué productos, actividades o encargos hay, enumera de forma clara y resumida los que aparezcan en el Contexto.
- Si el usuario pone una condición (ej. "disponibles"), filtra la lista del Contexto y nombra ÚNICAMENTE los que la cumplan (ej. los que dicen "Estado: disponible").
- Si el usuario hace una pregunta de procedimiento (ej. "cómo comprar" o "cómo apuntarme"), usa el Contexto para explicarle los pasos.
- NUNCA inventes productos, precios o información que no exista en el Contexto.
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
          kuanta: 'cuanta',
          kuantos: 'cuantos',
          kuantas: 'cuantas',
          kuesta: 'cuesta',
          kuestan: 'cuestan',
          presio: 'precio',
          prezio: 'precio',
          balen: 'valen',
          bale: 'vale',
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
          encargs: 'encargos',
          encargoos: 'encargos',
          actis: 'actividades',
          aktis: 'actividades',
          actividads: 'actividades',
          actibidades: 'actividades',
          aktividades: 'actividades',
          loguear: 'iniciar sesion',
          pass: 'contrasena',
          password: 'contrasena',
        };

        return dictionary[word] ?? word;
      })
      .join(' ');
  }

  private getQuickSocialAnswer(question: string) {
    const cleaned = question.trim();

    if (/^(hola+|buenas|saludos|hey|ola+|holaa+|que tal|q tal|buenos dias|buen dia|buenas tardes|buenas noches)\b/.test(cleaned)) {
      if (/\bbuenos dias\b|\bbuen dia\b/.test(cleaned)) {
        return 'Buenos dias. Estoy aqui para ayudarte con la web de la Fundacion Fuente Agria. Puedes preguntarme por productos, encargos o actividades.';
      }

      if (/\bbuenas tardes\b/.test(cleaned)) {
        return 'Buenas tardes. Dime que necesitas y te ayudo con el catalogo, los encargos o las actividades.';
      }

      if (/\bbuenas noches\b/.test(cleaned)) {
        return 'Buenas noches. Te ayudo con cualquier duda sobre la web, el catalogo, los encargos o las actividades.';
      }

      return 'Hola, encantado de ayudarte. Puedes preguntarme por el catalogo, los encargos personalizados o las actividades de la Fundacion Fuente Agria.';
    }

    if (/^(gracias|muchas gracias|mil gracias|vale gracias|ok gracias|perfecto gracias|muy amable|genial gracias)\b/.test(cleaned)) {
      return 'De nada, para eso estoy. Si necesitas algo mas sobre la Fundacion Fuente Agria, el catalogo, los encargos o las actividades, puedes preguntarme.';
    }

    if (/^(adios|hasta luego|hasta otra|nos vemos|chao|chau|me voy|gracias adios)\b/.test(cleaned)) {
      return 'Hasta luego. Ha sido un placer ayudarte.';
    }

    return null;
  }

  private isCatalogQuestion(question: string) {
    return /\b(productos?|catalogo|tienda|articulos?|comprar|vendeis|teneis|tipos?|categorias?|etiquetas?|personalizables?|restauracion|restaurad[ao]s?|restaurar|artesania|artesanal(?:es)?|manualidades?|stock|disponible|disponibilidad|precio|precios|vale|valen|cuesta|cuestan|coste|cuanto)\b/.test(question);
  }

  private isOrdersQuestion(question: string) {
    return /\b(encargos?|pedidos?|presupuesto|personalizad[ao]s?|medida|tazas?|sillas?|bordad[ao]s?|boda|empresa|evento|regalos?|detalles?|reparacion|reparar|muebles?|formulario|solicitud|plazo|tarda|tardan|tiempo|fecha|cantidad|precio|precios|vale|valen|cuesta|cuestan|coste|cuanto)\b/.test(question);
  }

  private isActivitiesQuestion(question: string) {
    return /\b(actividades?|talleres?|eventos?|excursiones?|ceramica|senderismo|mercadillo|cursos?|jornadas?|participar|apuntarme|apuntar|inscripcion|inscribirme|calendario|proxim[ao]s?|fecha|cuando)\b/.test(question);
  }

  private compactText(text?: string | null, maxLength = 220) {
    if (!text) return 'Sin descripcion detallada';
    const compacted = text.replace(/\s+/g, ' ').trim();
    return compacted.length > maxLength ? `${compacted.slice(0, maxLength - 3)}...` : compacted;
  }

  private jsonContentToText(contentJson: unknown) {
    if (!Array.isArray(contentJson)) return '';

    return contentJson
      .map((block: any) => {
        if (typeof block === 'string') return block;
        if (typeof block?.content === 'string') return block.content;
        if (typeof block?.text === 'string') return block.text;
        return '';
      })
      .filter(Boolean)
      .slice(0, 3)
      .join(' ');
  }

  private async getOrdersHeaderContext() {
    const pageConfig = await this.prisma.page.findFirst({
      where: { stage: 'orders_header' },
    });

    const fallback = {
      title: 'Encargos Personalizados',
      description:
        'La fundacion realiza trabajos a medida para bodas, eventos corporativos o regalos unicos.',
    };

    const content =
      typeof pageConfig?.contentJson === 'string'
        ? JSON.parse(pageConfig.contentJson)
        : (pageConfig?.contentJson as any) ?? fallback;

    return `Cabecera de encargos: ${content.title ?? fallback.title}. ${this.compactText(
      content.description ?? fallback.description,
      260,
    )}`;
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

    const productLines = products
      .slice(0, 20) // Limitamos a 20 para no desbordar el límite de tokens de la IA
      .map((product) => {
        const category = product.categories[0]?.categoryArticle?.name ?? 'Sin categoria';
        const availability = product.available ? 'disponible' : 'no disponible';
        const labels = product.labels.map((item) => item.label.name).join(', ') || 'sin etiquetas';
        const detail = this.compactText(product.description, 100);
        return `- Producto: ${product.name} | Categoria: ${category} | Precio: ${product.price.toFixed(2)} EUR | Estado: ${availability} | Etiquetas: ${labels} | Info: ${detail}`;
      })
      .join('\n');

    return `[DATOS DEL CATÁLOGO DE PRODUCTOS EN BASE DE DATOS]\nTotal de productos encontrados: ${products.length} (mostrando últimos ${Math.min(products.length, 20)}).\n${productLines}\nFIN DE DATOS DEL CATÁLOGO`;
  }

  private async getOrdersContext() {
    const headerContext = await this.getOrdersHeaderContext();
    const orders = await this.prisma.order.findMany({
      where: { active: true },
      orderBy: { id: 'desc' },
    });

    if (orders.length === 0) {
      return 'Encargos actuales: no hay encargos activos publicados.';
    }

    const orderLines = orders
      .slice(0, 15) // Limitamos a 15 para proteger el contexto
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
        return `- Encargo: ${order.title} | Precio orientativo: ${price} | Tiempo estimado: ${time} | Info: ${this.compactText(order.text, 100)}`;
      })
      .join('\n');

    return `[DATOS DE ENCARGOS ACTIVOS EN BASE DE DATOS]\n${headerContext}\nTotal de encargos: ${orders.length}.\n${orderLines}\nFIN DE DATOS DE ENCARGOS`;
  }

  private async getActivitiesContext() {
    const categories = await this.prisma.categoriaActividad.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });

    const activities = await this.prisma.actividad.findMany({
      include: { category: true },
      orderBy: { date: 'desc' },
    });

    if (activities.length === 0) {
      return 'Actividades actuales: no hay actividades publicadas.';
    }

    const activityLines = activities
      .slice(0, 15) // Limitamos a 15 para proteger el contexto
      .map((activity) => {
        const category = activity.category?.name ?? 'Sin categoria';
        const date = activity.date.toLocaleDateString('es-ES');
        const detail = this.compactText(this.jsonContentToText(activity.contentJson) || activity.description, 100);
        return `- Actividad: ${activity.title} | Categoria: ${category} | Fecha: ${date} | Info: ${detail}`;
      })
      .join('\n');

    return `[DATOS DE ACTIVIDADES EN BASE DE DATOS]\nTotal de actividades: ${activities.length}.\n${activityLines}\nFIN DE DATOS DE ACTIVIDADES`;
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
      const quickSocialAnswer = this.getQuickSocialAnswer(normalizedQuestion);

      if (quickSocialAnswer) {
        finalAnswer = quickSocialAnswer;
        if (onChunk) onChunk(finalAnswer);
        history.push(new HumanMessage(question));
        history.push(new AIMessage(finalAnswer));
        return finalAnswer;
      }

      const retrievedDocs = await this.retriever.invoke(normalizedQuestion);
      const dynamicContext = await this.getDynamicContext(normalizedQuestion);
      
      // Combinar el conocimiento del Markdown (retrievedDocs) con el de la BBDD (dynamicContext)
      const context = dynamicContext
        ? [...retrievedDocs, new Document({ pageContent: dynamicContext })]
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
