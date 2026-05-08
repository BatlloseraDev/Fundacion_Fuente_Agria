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
Si hay contexto dinamico de base de datos, responde solo con esos datos de base de datos.
Si el contexto contiene datos de base de datos con un total de elementos, debes listar TODOS esos elementos.
No resumas ni omitas productos, encargos o actividades cuando el usuario pregunte que hay, cuales hay o que teneis.
No inventes productos, encargos, actividades, categorias ni etiquetas que no aparezcan en el contexto de base de datos.
Si preguntan por precio, tiempo, disponibilidad o fecha de un elemento concreto, busca el nombre mas parecido en la base de datos y responde ese dato concreto.
Si preguntan por tipos, categorias o etiquetas, agrupa por categorias o etiquetas en vez de inventar familias nuevas.
Si no encuentras una coincidencia clara pero hay opciones parecidas, mencionalas y pide aclaracion.

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

  private isListQuestion(question: string) {
    return /\b(que hay|cuales|todos|todas|lista|listado|teneis|haceis|organiza|organizan|muestrame|dime)\b/.test(question);
  }

  private isActivitiesListQuestion(question: string) {
    return (
      this.isListQuestion(question) ||
      /\b(actividades?|talleres?|eventos?|excursiones?|cursos?|jornadas?)\b/.test(question)
    );
  }

  private isCatalogListQuestion(question: string) {
    return (
      this.isListQuestion(question) ||
      /\b(productos?|catalogo|articulos?|tienda)\b/.test(question)
    );
  }

  private isOrdersListQuestion(question: string) {
    return (
      this.isListQuestion(question) ||
      /\b(encargos?|pedidos?|trabajos?|servicios?)\b/.test(question)
    );
  }

  private isCategoryQuestion(question: string) {
    return /\b(tipos?|categorias?|clases)\b/.test(question);
  }

  private isLabelQuestion(question: string) {
    return /\b(etiquetas?|tags)\b/.test(question);
  }

  private isPriceQuestion(question: string) {
    return /\b(precio|precios|vale|valen|cuesta|cuestan|coste|cuanto)\b/.test(question);
  }

  private significantWords(text: string) {
    const ignored = new Set([
      'que',
      'hay',
      'de',
      'del',
      'la',
      'el',
      'los',
      'las',
      'un',
      'una',
      'y',
      'o',
      'en',
      'por',
      'para',
      'me',
      'dime',
      'no',
    ]);

    return this.normalizeQuestion(text)
      .split(/\s+/)
      .filter((word) => word.length > 2 && !ignored.has(word));
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

  private getEstimatedDays(timeInitial?: Date | null, timeFinal?: Date | null) {
    if (!timeInitial || !timeFinal) return null;
    return Math.max(1, Math.ceil((timeFinal.getTime() - timeInitial.getTime()) / 86400000));
  }

  private hasEntityMatch(question: string, text: string) {
    const askedWords = this.significantWords(question);
    const searchableWords = this.significantWords(text);
    return askedWords.some((word) => searchableWords.includes(word));
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
        const detail = this.compactText(product.longDescription ?? product.description);
        return `- ${product.name}. Categoria: ${category}. Precio: ${product.price.toFixed(2)} EUR. Estado: ${availability}. Etiquetas: ${labels}. Descripcion: ${product.description}. Detalle: ${detail}`;
      })
      .join('\n');

    return `Catalogo actual desde base de datos.
Total de productos: ${products.length}.
Categorias reales del catalogo:
${categoryLines}

Etiquetas reales del catalogo:
${labelLines}

Productos reales del catalogo. Debes listar exactamente ${products.length} productos si el usuario pregunta por productos:
${productLines}

Instrucciones catalogo: si preguntan por el precio de un producto concreto, busca el nombre del producto en esta lista. Si preguntan por tipos de productos, usa las categorias reales. Si preguntan por etiquetas, usa las etiquetas reales.`;
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
        return `- ${order.title}. Precio orientativo: ${price}. Tiempo estimado: ${time}. Descripcion: ${this.compactText(order.text)}`;
      })
      .join('\n');

    return `Encargos actuales desde base de datos.
${headerContext}
Total de encargos: ${orders.length}. Debes listar exactamente ${orders.length} encargos si el usuario pregunta por encargos:
${orderLines}

Instrucciones encargos: son trabajos o servicios personalizables, con precios orientativos. Si preguntan como pedir uno, indica que deben contar su idea mediante el formulario o contactar con la fundacion para concretar presupuesto, plazo y detalles.`;
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
      .map((activity) => {
        const category = activity.category?.name ?? 'Sin categoria';
        const date = activity.date.toLocaleDateString('es-ES');
        const detail = this.compactText(this.jsonContentToText(activity.contentJson) || activity.description);
        return `- ${activity.title}. Categoria: ${category}. Fecha: ${date}. Descripcion: ${activity.description}. Detalle: ${detail}`;
      })
      .join('\n');

    const categoryLines = categories.length
      ? categories.map((category) => `- ${category.name}`).join('\n')
      : '- Sin categorias activas';

    return `Actividades actuales desde base de datos.
Categorias reales de actividades:
${categoryLines}

Total de actividades: ${activities.length}. Debes listar exactamente ${activities.length} actividades si el usuario pregunta por actividades:
${activityLines}

Instrucciones actividades: cuando el usuario pregunte que actividades hay, responde siempre con nombre de la actividad, tipo/categoria y fecha. No respondas solo con la categoria. Si preguntan cuando es una actividad, responde con la fecha. Si preguntan como participar o apuntarse, indica que consulten el detalle de la actividad o contacten con la fundacion para confirmar plazas y condiciones.`;
  }

  private async getDirectActivitiesAnswer(question: string) {
    if (!this.isActivitiesQuestion(question)) return null;

    const activities = await this.prisma.actividad.findMany({
      include: { category: true },
      orderBy: { date: 'desc' },
    });

    if (activities.length === 0) {
      return 'Ahora mismo no hay actividades publicadas en la base de datos.';
    }

    const formatActivity = (activity: (typeof activities)[number]) => {
      const category = activity.category?.name ?? 'Sin categoria';
      const date = activity.date.toLocaleDateString('es-ES');
      return `${activity.title}. Tipo: ${category}. Fecha: ${date}.`;
    };

    if (this.isActivitiesListQuestion(question)) {
      const activityLines = activities
        .map((activity, index) => `${index + 1}. ${formatActivity(activity)}`)
        .join('\n');
      return `Hay ${activities.length} actividad(es) publicada(s):\n${activityLines}`;
    }

    const askedWords = this.significantWords(question);
    const matchedActivity = activities.find((activity) => {
      const searchable = this.significantWords(
        `${activity.title} ${activity.description} ${activity.category?.name ?? ''}`,
      );
      return askedWords.some((word) => searchable.includes(word));
    });

    if (matchedActivity) {
      return `Si, hay una actividad relacionada: ${formatActivity(matchedActivity)}`;
    }

    return null;
  }

  private async getDirectCatalogAnswer(question: string) {
    if (!this.isCatalogQuestion(question)) return null;

    const products = await this.prisma.article.findMany({
      include: {
        categories: { include: { categoryArticle: true } },
        labels: { include: { label: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (products.length === 0) {
      return 'Ahora mismo no hay productos publicados en la base de datos.';
    }

    const formatProduct = (product: (typeof products)[number]) => {
      const categories =
        product.categories.map((item) => item.categoryArticle.name).join(', ') || 'Sin categoria';
      const labels = product.labels.map((item) => item.label.name).join(', ') || 'sin etiquetas';
      const availability = product.available ? 'disponible' : 'no disponible';
      return `${product.name}. Categoria: ${categories}. Precio: ${product.price.toFixed(2)} EUR. Estado: ${availability}. Etiquetas: ${labels}.`;
    };

    const matchedProduct = products.find((product) =>
      this.hasEntityMatch(
        question,
        `${product.name} ${product.description} ${product.longDescription ?? ''} ${product.categories
          .map((item) => item.categoryArticle.name)
          .join(' ')} ${product.labels.map((item) => item.label.name).join(' ')}`,
      ),
    );

    if (matchedProduct && this.isPriceQuestion(question)) {
      const availability = matchedProduct.available ? 'disponible' : 'no disponible';
      return `${matchedProduct.name} cuesta ${matchedProduct.price.toFixed(2)} EUR y esta ${availability}.`;
    }

    if (matchedProduct && !this.isCatalogListQuestion(question)) {
      return `Si, hay un producto relacionado: ${formatProduct(matchedProduct)}`;
    }

    if (this.isCategoryQuestion(question)) {
      const categoryMap = new Map<string, string[]>();
      for (const product of products) {
        const categories = product.categories.length
          ? product.categories.map((item) => item.categoryArticle.name)
          : ['Sin categoria'];
        for (const category of categories) {
          categoryMap.set(category, [...(categoryMap.get(category) ?? []), product.name]);
        }
      }

      const categoryLines = [...categoryMap.entries()]
        .map(([category, names]) => `- ${category}: ${names.join(', ')}`)
        .join('\n');

      return `Los tipos de productos del catalogo son:\n${categoryLines}`;
    }

    if (this.isLabelQuestion(question)) {
      const labelMap = new Map<string, string[]>();
      for (const product of products) {
        const labels = product.labels.length
          ? product.labels.map((item) => item.label.name)
          : ['Sin etiquetas'];
        for (const label of labels) {
          labelMap.set(label, [...(labelMap.get(label) ?? []), product.name]);
        }
      }

      const labelLines = [...labelMap.entries()]
        .map(([label, names]) => `- ${label}: ${names.join(', ')}`)
        .join('\n');

      return `Las etiquetas del catalogo son:\n${labelLines}`;
    }

    if (this.isCatalogListQuestion(question)) {
      const productLines = products
        .map((product, index) => `${index + 1}. ${formatProduct(product)}`)
        .join('\n');
      return `Hay ${products.length} producto(s) publicado(s):\n${productLines}`;
    }

    return null;
  }

  private async getDirectOrdersAnswer(question: string) {
    if (!this.isOrdersQuestion(question)) return null;

    const orders = await this.prisma.order.findMany({
      where: { active: true },
      orderBy: { id: 'desc' },
    });

    if (orders.length === 0) {
      return 'Ahora mismo no hay encargos activos publicados en la base de datos.';
    }

    const formatOrder = (order: (typeof orders)[number]) => {
      const price = order.price !== null ? `${order.price.toFixed(2)} EUR` : 'precio por confirmar';
      const days = this.getEstimatedDays(order.timeInitial, order.timeFinal);
      const time = days ? `${days} dias aproximadamente` : 'tiempo por confirmar';
      return `${order.title}. Precio orientativo: ${price}. Tiempo estimado: ${time}.`;
    };

    const matchedOrder = orders.find((order) =>
      this.hasEntityMatch(question, `${order.title} ${order.text}`),
    );

    if (matchedOrder && this.isPriceQuestion(question)) {
      const price =
        matchedOrder.price !== null
          ? `${matchedOrder.price.toFixed(2)} EUR`
          : 'precio por confirmar';
      return `${matchedOrder.title} tiene un precio orientativo de ${price}.`;
    }

    if (matchedOrder && /\b(tiempo|tarda|tardan|plazo|cuando)\b/.test(question)) {
      const days = this.getEstimatedDays(matchedOrder.timeInitial, matchedOrder.timeFinal);
      const time = days ? `${days} dias aproximadamente` : 'tiempo por confirmar';
      return `${matchedOrder.title} tiene un tiempo estimado de ${time}.`;
    }

    if (matchedOrder && !this.isOrdersListQuestion(question)) {
      return `Si, hay un encargo relacionado: ${formatOrder(matchedOrder)}`;
    }

    if (this.isOrdersListQuestion(question)) {
      const orderLines = orders
        .map((order, index) => `${index + 1}. ${formatOrder(order)}`)
        .join('\n');
      return `Hay ${orders.length} encargo(s) activo(s):\n${orderLines}`;
    }

    return null;
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

      const directActivitiesAnswer = await this.getDirectActivitiesAnswer(normalizedQuestion);

      if (directActivitiesAnswer) {
        finalAnswer = directActivitiesAnswer;
        if (onChunk) onChunk(finalAnswer);
        history.push(new HumanMessage(question));
        history.push(new AIMessage(finalAnswer));
        return finalAnswer;
      }

      const directCatalogAnswer = await this.getDirectCatalogAnswer(normalizedQuestion);

      if (directCatalogAnswer) {
        finalAnswer = directCatalogAnswer;
        if (onChunk) onChunk(finalAnswer);
        history.push(new HumanMessage(question));
        history.push(new AIMessage(finalAnswer));
        return finalAnswer;
      }

      const directOrdersAnswer = await this.getDirectOrdersAnswer(normalizedQuestion);

      if (directOrdersAnswer) {
        finalAnswer = directOrdersAnswer;
        if (onChunk) onChunk(finalAnswer);
        history.push(new HumanMessage(question));
        history.push(new AIMessage(finalAnswer));
        return finalAnswer;
      }

      const retrievedDocs = await this.retriever.invoke(normalizedQuestion);
      const dynamicContext = await this.getDynamicContext(normalizedQuestion);
      const context = dynamicContext
        ? [new Document({ pageContent: dynamicContext })]
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
