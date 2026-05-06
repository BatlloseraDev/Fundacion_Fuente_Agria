import { Ollama } from '@langchain/ollama';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { createStuffDocumentsChain } from '@langchain/classic/chains/combine_documents';
import { createRetrievalChain } from '@langchain/classic/chains/retrieval';
import { MemoryVectorStore } from '@langchain/classic/vectorstores/memory';
import { OllamaEmbeddings } from '@langchain/ollama';

async function run() {
  const embeddings = new OllamaEmbeddings({ model: 'nomic-embed-text', baseUrl: 'http://localhost:11434' });
  const vectorStore = await MemoryVectorStore.fromTexts(['La Fundación Fuente Agria es una entidad social.'], [{ id: 1 }], embeddings);
  const retriever = vectorStore.asRetriever();
  
  const llm = new Ollama({ baseUrl: 'http://localhost:11434', model: 'phi3' });
  const prompt = ChatPromptTemplate.fromTemplate(`Context: {context}\n\nQuestion: {input}`);
  const combineDocsChain = await createStuffDocumentsChain({ llm, prompt });
  const chain = await createRetrievalChain({ combineDocsChain, retriever });
  
  const stream = await chain.stream({ input: 'Qué es la Fundación?' });
  let count = 0;
  for await (const chunk of stream) {
    if (chunk.answer) {
        process.stdout.write(chunk.answer);
        count++;
    }
  }
  console.log('\n\nTokens:', count);
}
run().catch(console.error);
