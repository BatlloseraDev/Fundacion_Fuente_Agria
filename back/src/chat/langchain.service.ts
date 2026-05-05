import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Ollama, OllamaEmbeddings } from '@langchain/ollama';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { MemoryVectorStore } from '@langchain/classic/vectorstores/memory';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { createStuffDocumentsChain } from '@langchain/classic/chains/combine_documents';
import { createRetrievalChain } from '@langchain/classic/chains/retrieval';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import * as path from 'path';

@Injectable()
export class LangchainService implements OnModuleInit {
  private readonly logger = new Logger(LangchainService.name);
  private chain: any;

  async onModuleInit() {
    await this.initializeRAG();
  }

  private async initializeRAG() {
    this.logger.log('Inicializando RAG en memoria...');
    try {
      // 1. Cargar el documento PDF estático
      const pdfPath = path.join(process.cwd(), 'src', 'chat', 'data', 'conocimiento.pdf'); 
      const loader = new PDFLoader(pdfPath);
      const docs = await loader.load();

      // 2. Dividir el texto en fragmentos (chunks)
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });
      const splitDocs = await textSplitter.splitDocuments(docs);

      // 3. Crear Vector Store en memoria usando Embeddings de Ollama
      // el contenedor de ollama http://ollama:11434 (desde el back en Docker) 
      const embeddings = new OllamaEmbeddings({
        model: 'nomic-embed-text', 
        baseUrl: 'http://ollama:11434',
      });
      
      const vectorStore = await MemoryVectorStore.fromDocuments(splitDocs, embeddings);
      const retriever = vectorStore.asRetriever({ k: 3 }); // Recupera los 3 fragmentos más relevantes

      // 4. Configurar el LLM (Ej: phi3, llama3 o el que hayas elegido)
      const llm = new Ollama({
        baseUrl: 'http://ollama:11434',
        model: 'phi3', 
        temperature: 1, 
      });

      // 5. System Prompt Estricto
      const prompt = ChatPromptTemplate.fromTemplate(`
Eres un asistente virtual de la Fundación Fuente Agria.
Tu único propósito es responder preguntas basándote EXCLUSIVAMENTE en el contexto proporcionado a continuación.

REGLAS ESTRICTAS:
1. NUNCA inventes información.
2. Si la respuesta a la pregunta del usuario no se encuentra CLARAMENTE dentro del contexto, debes responder EXACTAMENTE con la siguiente frase, sin añadir nada más: "Lo siento, no tengo esa información. Por favor, contacta directamente con la Fundación Fuente Agria."
3. Sé amable pero directo y conciso.
4. Puedes contestar de lo que se te permite hablar

Contexto:
{context}

Pregunta del usuario: {input}
Respuesta:`);

      // 6. Crear las cadenas (Chains)
      const documentChain = await createStuffDocumentsChain({
        llm,
        prompt,
      });

      this.chain = await createRetrievalChain({
        combineDocsChain: documentChain,
        retriever,
      });

      this.logger.log('RAG inicializado correctamente.');
    } catch (error) {
      this.logger.error('Error al inicializar RAG (¿existe el PDF?):', error);
    }
  }

  async askQuestion(question: string): Promise<string> {
    if (!this.chain) {
      return 'El sistema de chat aún se está inicializando o hubo un error al cargar el conocimiento.';
    }

    try {
      const response = await this.chain.invoke({
        input: question,
      });
      return response.answer;
    } catch (error) {
      this.logger.error('Error al procesar la pregunta:', error);
      return 'Hubo un error al procesar tu consulta. Inténtalo de nuevo más tarde.';
    }
  }
}