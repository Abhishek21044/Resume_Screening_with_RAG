/**
 * Upload routes - Resume and Job Description file upload
 */

import { Router, Request, Response } from 'express';
import multer from 'multer';
import { extractTextFromBuffer } from '../utils/documentParser';
import { RAGService } from '../rag/ragService';
import { analyzeMatch } from '../services/matchScorer';
import { parseResume } from '../services/resumeParser';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const ext = file.originalname.toLowerCase().split('.').pop();
    if (['pdf', 'txt'].includes(ext || '')) cb(null, true);
    else cb(new Error('Only PDF and TXT files are allowed'));
  },
});

// In-memory session store (per server instance - use Redis/DB for production)
const sessions: Map<
  string,
  { rag: RAGService; resumeText: string; jdText: string; analysis: unknown; parsed: unknown }
> = new Map();

function getOrCreateSession(sessionId: string) {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      rag: new RAGService(),
      resumeText: '',
      jdText: '',
      analysis: null,
      parsed: null,
    });
  }
  return sessions.get(sessionId)!;
}

router.post('/resume', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const sessionId = (req.headers['x-session-id'] as string) || 'default';

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const text = await extractTextFromBuffer(file.buffer, file.originalname);
    const session = getOrCreateSession(sessionId);
    session.resumeText = text;

    const parsed = await parseResume(text);
    session.parsed = parsed;

    // If JD already uploaded, run analysis and index
    if (session.jdText) {
      await session.rag.indexDocuments(session.resumeText, session.jdText);
      session.analysis = await analyzeMatch(session.resumeText, session.jdText);
    }

    res.json({
      success: true,
      parsed,
      analysis: session.jdText ? session.analysis : null,
    });
  } catch (err) {
    console.error('Resume upload error:', err);
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Failed to process resume',
    });
  }
});

router.post('/job-description', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const sessionId = (req.headers['x-session-id'] as string) || 'default';

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const text = await extractTextFromBuffer(file.buffer, file.originalname);
    const session = getOrCreateSession(sessionId);
    session.jdText = text;

    if (session.resumeText) {
      await session.rag.indexDocuments(session.resumeText, session.jdText);
      session.analysis = await analyzeMatch(session.resumeText, session.jdText);
    }

    res.json({
      success: true,
      analysis: session.resumeText ? session.analysis : null,
    });
  } catch (err) {
    console.error('JD upload error:', err);
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Failed to process job description',
    });
  }
});

router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const sessionId = (req.headers['x-session-id'] as string) || 'default';
    const session = getOrCreateSession(sessionId);

    if (!session.resumeText || !session.jdText) {
      return res.status(400).json({
        error: 'Upload both resume and job description first',
      });
    }

    await session.rag.indexDocuments(session.resumeText, session.jdText);
    session.analysis = await analyzeMatch(session.resumeText, session.jdText);

    res.json({ success: true, analysis: session.analysis });
  } catch (err) {
    console.error('Analyze error:', err);
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Analysis failed',
    });
  }
});

router.get('/session', (req: Request, res: Response) => {
  const sessionId = (req.headers['x-session-id'] as string) || 'default';
  const session = getOrCreateSession(sessionId);

  res.json({
    hasResume: !!session.resumeText,
    hasJd: !!session.jdText,
    analysis: session.analysis,
    parsed: session.parsed,
  });
});

export { router as uploadRouter, sessions, getOrCreateSession };
