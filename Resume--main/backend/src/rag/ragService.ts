/**
 * RAG Service - Retrieval-Augmented Generation for resume Q&A
 * Flow: User Question -> Embed question -> Vector search -> Retrieve chunks -> LLM with context
 */

import { InMemoryVectorStore } from './vectorStore';
import { chunkText, TextChunk } from '../utils/textChunker';
import { completeChat } from '../utils/llm';

export class RAGService {
  private vectorStore: InMemoryVectorStore;
  private resumeChunks: TextChunk[] = [];
  private jdChunks: TextChunk[] = [];
  private resumeText = '';
  private jdText = '';

  constructor() {
    this.vectorStore = new InMemoryVectorStore();
  }

  async indexDocuments(resumeText: string, jdText: string): Promise<void> {
    this.vectorStore.clear();
    this.resumeText = resumeText;
    this.jdText = jdText;

    this.resumeChunks = chunkText(resumeText, 'resume');
    this.jdChunks = chunkText(jdText, 'jd');

    const allChunks = [
      ...this.resumeChunks.map((c) => ({
        content: `[RESUME]\n${c.content}`,
        metadata: { source: 'resume', ...c.metadata },
      })),
      ...this.jdChunks.map((c) => ({
        content: `[JOB DESCRIPTION]\n${c.content}`,
        metadata: { source: 'jd', ...c.metadata },
      })),
    ];

    await this.vectorStore.addDocuments(
      allChunks.map((c) => c.content),
      allChunks.map((c) => c.metadata)
    );
  }

  async ask(
    question: string,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
  ): Promise<string> {
    // RAG: Retrieve relevant chunks (NOT sending entire resume!)
    const relevantDocs = await this.vectorStore.similaritySearch(question, 5);
    const context = relevantDocs.map((d) => d.content).join('\n\n---\n\n');

    const systemPrompt = `You are an expert resume screener. Answer questions about the candidate's resume and their fit for the job based ONLY on the retrieved context below. If the information is not in the context, say "I don't have that information in the resume" or similar. Be concise and accurate.

Retrieved context from resume and job description:
${context}`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...conversationHistory.slice(-6).map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user' as const, content: question },
    ];

    const answer = await completeChat(messages, { maxTokens: 500, temperature: 0.3 });
    return answer || 'No response generated.';
  }

  getIndexedContent(): { resumeText: string; jdText: string } {
    return { resumeText: this.resumeText, jdText: this.jdText };
  }
}
