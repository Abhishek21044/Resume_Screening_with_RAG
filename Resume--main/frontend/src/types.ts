export interface MatchAnalysisData {
  matchScore: number;
  strengths: string[];
  gaps: string[];
  keyInsights: string[];
  overallAssessment: string;
}

export interface ParsedResume {
  skills: string[];
  experience: string[];
  education: string[];
  summary: string;
}
