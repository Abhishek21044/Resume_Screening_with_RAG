/**
 * Resume Screening Tool - Backend API
 * Node.js + Express + RAG (Gemini only)
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { uploadRouter } from './routes/upload';
import { chatRouter } from './routes/chat';

const app = express();
const PORT = process.env.PORT || 3003;

if (!process.env.GOOGLE_AI_API_KEY) {
  console.warn('Warning: GOOGLE_AI_API_KEY not set. Add it to .env to use the API.');
}

app.use(cors({ origin: true }));
app.use(express.json({ limit: '10mb' }));

app.use('/api/upload', uploadRouter);
app.use('/api/chat', chatRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Resume Screening API running on http://localhost:${PORT}`);
});
