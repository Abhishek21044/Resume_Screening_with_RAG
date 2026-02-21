/**
 * Match Scorer - Uses LLM to analyze resume vs JD and produce match score + insights
 */

import { completeChat } from '../utils/llm';

export interface MatchAnalysis {
  matchScore: number;
  strengths: string[];
  gaps: string[];
  keyInsights: string[];
  overallAssessment: string;
}

export async function analyzeMatch(
  resumeText: string,
  jdText: string
): Promise<MatchAnalysis> {
  const prompt = `You are an expert recruiter. Analyze the following resume against the job description and provide a structured assessment.

RESUME:
---
${resumeText.slice(0, 6000)}
---

JOB DESCRIPTION:
---
${jdText.slice(0, 4000)}
---

Respond with a JSON object (no markdown, no code blocks) with exactly these keys:
- "matchScore": number 0-100 (overall fit percentage)
- "strengths": array of 3-5 strings (key strengths that align with the JD)
- "gaps": array of 2-4 strings (missing skills, experience, or requirements)
- "keyInsights": array of 2-3 strings (notable observations)
- "overallAssessment": string (2-3 sentences summarizing fit)`;

  const content = await completeChat(
    [{ role: 'user', content: prompt }],
    { maxTokens: 800, temperature: 0.3 }
  ) || '{}';
  const cleaned = content.replace(/```json\n?|\n?```/g, '').trim();
  const parsed = JSON.parse(cleaned) as MatchAnalysis;

  return {
    matchScore: Math.min(100, Math.max(0, Number(parsed.matchScore) || 0)),
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
    gaps: Array.isArray(parsed.gaps) ? parsed.gaps : [],
    keyInsights: Array.isArray(parsed.keyInsights) ? parsed.keyInsights : [],
    overallAssessment: String(parsed.overallAssessment || ''),
  };
}
