/**
 * In-Memory Vector Store for RAG
 * Uses Gemini embeddings only (no OpenAI)
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

function getGeminiClient(): GoogleGenerativeAI {
  const key = process.env.GOOGLE_AI_API_KEY;
  if (!key) throw new Error('GOOGLE_AI_API_KEY required. Add it to backend/.env');
  return new GoogleGenerativeAI(key);
}

interface StoredDocument {
  id: string;
  content: string;
  embedding: number[];
  metadata: Record<string, unknown>;
}

export class InMemoryVectorStore {
  private documents: StoredDocument[] = [];
  private embeddingModel =
    process.env.GEMINI_EMBEDDING_MODEL || 'text-embedding-004';

  async addDocuments(
    contents: string[],
    metadatas: Record<string, unknown>[] = []
  ): Promise<void> {
    if (contents.length === 0) return;

    const embeddings = await this.getEmbeddings(contents);

    contents.forEach((content, i) => {
      this.documents.push({
        id: `doc_${Date.now()}_${i}`,
        content,
        embedding: embeddings[i],
        metadata: metadatas[i] || {},
      });
    });
  }

  async similaritySearch(query: string, k: number = 4): Promise<StoredDocument[]> {
    if (this.documents.length === 0) return [];

    const [queryEmbedding] = await this.getEmbeddings([query]);
    const scored = this.documents.map((doc) => ({
      doc,
      score: cosineSimilarity(queryEmbedding, doc.embedding),
    }));

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, k).map((s) => s.doc);
  }

  clear(): void {
    this.documents = [];
  }

  private async getEmbeddings(texts: string[]): Promise<number[][]> {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: this.embeddingModel });

    const results: number[][] = [];

    // batchEmbedContents for efficiency
    if (texts.length === 1) {
      const res = await model.embedContent(texts[0]);
      results.push(res.embedding.values);
      return results;
    }

    const batchSize = 100;
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const requests = batch.map((text) => ({
        content: { parts: [{ text }] },
      }));
      const res = await model.batchEmbedContents({ requests });
      for (const emb of res.embeddings) {
        results.push(emb.values);
      }
    }

    return results;
  }
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0,
    normA = 0,
    normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}
