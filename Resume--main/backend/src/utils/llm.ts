/**
 * LLM - Gemini only (no OpenAI)
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface CompleteOptions {
  maxTokens?: number;
  temperature?: number;
}

function getGeminiClient(): GoogleGenerativeAI {
  const key = process.env.GOOGLE_AI_API_KEY;
  if (!key) throw new Error('GOOGLE_AI_API_KEY required. Add it to backend/.env');
  return new GoogleGenerativeAI(key);
}

export async function completeChat(
  messages: ChatMessage[],
  options: CompleteOptions = {}
): Promise<string> {
  const { maxTokens = 500, temperature = 0.3 } = options;
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    generationConfig: {
      maxOutputTokens: maxTokens,
      temperature,
    },
  });

  const systemMsg = messages.find((m) => m.role === 'system');
  const chatMessages = messages.filter((m) => m.role !== 'system');

  const parts: string[] = [];
  if (systemMsg) parts.push(`System: ${systemMsg.content}\n\n`);
  for (const m of chatMessages) {
    parts.push(`${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}\n\n`);
  }
  const prompt = parts.join('') + 'Assistant:';

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  return text?.trim() || '';
}
