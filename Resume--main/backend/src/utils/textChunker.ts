/**
 * Text Chunker - Splits documents into semantic chunks for RAG
 * Chunks by sections (Education, Experience, Skills, etc.) when possible
 */

export interface TextChunk {
  content: string;
  metadata: {
    section?: string;
    chunkIndex: number;
    totalChunks: number;
  };
}

const SECTION_PATTERNS = [
  /^(education|academic|qualifications?)\s*:?\s*$/im,
  /^(experience|work experience|employment|professional experience)\s*:?\s*$/im,
  /^(skills?|technical skills?|competencies?)\s*:?\s*$/im,
  /^(summary|profile|objective|about)\s*:?\s*$/im,
  /^(projects?)\s*:?\s*$/im,
  /^(certifications?|certificates?)\s*:?\s*$/im,
  /^(achievements?|accomplishments?)\s*:?\s*$/im,
  /^(references?)\s*:?\s*$/im,
];

const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 100;

export function chunkText(text: string, source: 'resume' | 'jd' = 'resume'): TextChunk[] {
  const chunks: TextChunk[] = [];
  const normalizedText = text.replace(/\r\n/g, '\n').trim();

  if (!normalizedText) return chunks;

  // Try to split by section headers first (for resumes)
  const sections = splitBySections(normalizedText);

  let chunkIndex = 0;
  for (const section of sections) {
    const sectionChunks = splitBySize(section.content, section.name);
    for (const chunk of sectionChunks) {
      chunks.push({
        content: chunk,
        metadata: {
          section: section.name,
          chunkIndex: chunkIndex++,
          totalChunks: 0, // Will set after
        },
      });
    }
  }

  // If no sections found, chunk by size
  if (chunks.length === 0) {
    const sizeChunks = splitBySize(normalizedText);
    sizeChunks.forEach((content, i) => {
      chunks.push({
        content,
        metadata: {
          chunkIndex: i,
          totalChunks: sizeChunks.length,
        },
      });
    });
  }

  // Set totalChunks
  chunks.forEach((c) => (c.metadata.totalChunks = chunks.length));

  return chunks;
}

interface Section {
  name: string;
  content: string;
}

function splitBySections(text: string): Section[] {
  const sections: Section[] = [];
  const lines = text.split('\n');
  let currentSection: Section = { name: 'General', content: '' };

  for (const line of lines) {
    const trimmed = line.trim();
    const sectionMatch = SECTION_PATTERNS.find((p) => p.test(trimmed));

    if (sectionMatch && trimmed.length < 50) {
      if (currentSection.content.trim()) {
        sections.push({ ...currentSection, content: currentSection.content.trim() });
      }
      currentSection = {
        name: trimmed.replace(/[:]/g, '').trim(),
        content: '',
      };
    } else {
      currentSection.content += (currentSection.content ? '\n' : '') + line;
    }
  }

  if (currentSection.content.trim()) {
    sections.push({ ...currentSection, content: currentSection.content.trim() });
  }

  return sections.length > 0 ? sections : [{ name: 'General', content: text }];
}

function splitBySize(text: string, sectionName?: string): string[] {
  const result: string[] = [];
  const paragraphs = text.split(/\n\n+/);

  let current = '';
  for (const para of paragraphs) {
    if (current.length + para.length + 2 > CHUNK_SIZE && current) {
      result.push(current.trim());
      const overlap = getOverlapText(current, CHUNK_OVERLAP);
      current = overlap + '\n\n' + para;
    } else {
      current += (current ? '\n\n' : '') + para;
    }
  }
  if (current.trim()) result.push(current.trim());

  return result.length > 0 ? result : [text];
}

function getOverlapText(text: string, overlapSize: number): string {
  const words = text.split(/\s+/);
  if (words.length <= 5) return text;
  const overlapWords = Math.ceil(overlapSize / 5);
  return words.slice(-overlapWords).join(' ');
}
