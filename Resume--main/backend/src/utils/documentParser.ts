/**
 * Document Parser - Extracts text from PDF and TXT files
 */

// pdf-parse is CommonJS; use require for compatibility
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse') as (buffer: Buffer) => Promise<{ text: string }>;

export async function extractTextFromBuffer(
  buffer: Buffer,
  filename: string
): Promise<string> {
  const ext = filename.toLowerCase().split('.').pop();

  if (ext === 'pdf') {
    const data = await pdfParse(buffer);
    return data.text;
  }

  if (ext === 'txt') {
    return buffer.toString('utf-8');
  }

  throw new Error(`Unsupported file format: ${ext}. Use PDF or TXT.`);
}
