/**
 * Chat routes - RAG-powered Q&A about the candidate
 */

import { Router, Request, Response } from 'express';
import { getOrCreateSession } from './upload';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const sessionId = (req.headers['x-session-id'] as string) || 'default';
    const { message, history = [] } = req.body as {
      message?: string;
      history?: Array<{ role: 'user' | 'assistant'; content: string }>;
    };

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const session = getOrCreateSession(sessionId);

    if (!session.resumeText || !session.jdText) {
      return res.status(400).json({
        error: 'Upload resume and job description before asking questions',
      });
    }

    const answer = await session.rag.ask(message.trim(), history);

    res.json({ answer });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Chat failed',
    });
  }
});

export { router as chatRouter };
