/**
 * Resume Parser - Extracts structured info from resume text using LLM
 */

import { completeChat } from '../utils/llm';

export interface ParsedResume {
  skills: string[];
  experience: string[];
  education: string[];
  summary: string;
}

export async function parseResume(text: string): Promise<ParsedResume> {
  const prompt = `Extract structured information from this resume. Respond with a JSON object (no markdown) with:
- "skills": array of skill names mentioned
- "experience": array of job titles or role descriptions (e.g., "Senior Engineer at Company X")
- "education": array of degrees/schools
- "summary": 1-2 sentence summary of the candidate

RESUME:
---
${text.slice(0, 5000)}
---`;

  const content = await completeChat(
    [{ role: 'user', content: prompt }],
    { maxTokens: 600, temperature: 0.2 }
  ) || '{}';
  const cleaned = content.replace(/```json\n?|\n?```/g, '').trim();
  const parsed = JSON.parse(cleaned);

  return {
    skills: Array.isArray(parsed.skills) ? parsed.skills : [],
    experience: Array.isArray(parsed.experience) ? parsed.experience : [],
    education: Array.isArray(parsed.education) ? parsed.education : [],
    summary: String(parsed.summary || ''),
  };
}
