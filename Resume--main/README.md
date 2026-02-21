# Resume Screening Tool

AI-powered Resume Screening Tool where recruiters can upload a resume and job description, get an instant match score, and ask questions about the candidate via RAG-powered chat.

## Tech Stack

- **Backend**: Node.js 18+, Express.js, TypeScript
- **Frontend**: React 18, TypeScript, Vite
- **LLM & Embeddings**: Google Gemini only (no OpenAI)
- **RAG**: Custom in-memory vector store with cosine similarity
- **Document Processing**: pdf-parse (PDF), UTF-8 (TXT)

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           RESUME SCREENING TOOL                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐     ┌──────────────────┐     ┌──────────────────────────┐
│   React Frontend  │────▶│  Express API     │────▶│  Services                 │
│   - Upload UI     │     │  - /api/upload   │     │  - Document Parser        │
│   - Match Display │     │  - /api/chat     │     │  - Text Chunker           │
│   - Chat UI       │     │  - /api/health   │     │  - Match Scorer (LLM)     │
└──────────────────┘     └──────────────────┘     │  - Resume Parser (LLM)   │
                                                    └────────────┬─────────────┘
                                                                 │
                    ┌────────────────────────────────────────────┼────────────────┐
                    │                                            │                │
                    ▼                                            ▼                ▼
         ┌──────────────────┐                      ┌─────────────────────┐  ┌─────────┐
         │  RAG Pipeline     │                      │  Gemini API          │  │ Session │
         │  1. Chunk text    │                      │  - Embeddings        │  │ Store   │
         │  2. Embed chunks  │─────────────────────▶│  - Generate content  │  │ (memory) │
         │  3. Vector store  │                      └─────────────────────┘  └─────────┘
         │  4. Retrieve      │
         │  5. Augment LLM   │
         └──────────────────┘

RAG Flow (when user asks a question):
  User Question → Embed question → Vector similarity search → Retrieve top-k chunks
  → Pass chunks + question to LLM → Return answer
```

## RAG Implementation (Critical)

This project implements **actual RAG**, not direct LLM queries:

| Step | Implementation |
|------|----------------|
| **Document Processing** | `textChunker.ts` - Extracts text, splits by sections (Education, Experience, Skills), chunks by size (500 chars, 100 overlap) |
| **Embeddings** | Gemini `text-embedding-004` for resume/JD chunks |
| **Vector Storage** | In-memory store with cosine similarity (swap to Pinecone/Chroma for production) |
| **Retrieval** | User question → embed → similarity search → top 5 chunks |
| **Augmented Generation** | Retrieved chunks + question → Gemini → answer |

**Correct flow**: Embed → Vector search → Retrieve relevant chunks → Pass to LLM  
**Wrong**: Sending entire resume + question directly to LLM

## Setup

### Prerequisites

- Node.js 18+
- Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env and add your GOOGLE_AI_API_KEY
npm run dev
```

Backend runs at `http://localhost:3001`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173` and proxies `/api` to the backend.

### Production Build

```bash
# Backend
cd backend && npm run build && npm start

# Frontend
cd frontend && npm run build
# Serve the dist/ folder with any static server
```

## API Documentation

### Upload Resume

```
POST /api/upload/resume
Content-Type: multipart/form-data
X-Session-Id: <optional session id>
Body: file (PDF or TXT)

Response: { success, parsed, analysis? }
```

### Upload Job Description

```
POST /api/upload/job-description
Content-Type: multipart/form-data
X-Session-Id: <optional session id>
Body: file (PDF or TXT)

Response: { success, analysis? }
```

### Run Analysis

```
POST /api/upload/analyze
X-Session-Id: <optional session id>

Response: { success, analysis }
```

### Get Session State

```
GET /api/upload/session
X-Session-Id: <optional session id>

Response: { hasResume, hasJd, analysis?, parsed? }
```

### Chat (RAG Q&A)

```
POST /api/chat
Content-Type: application/json
X-Session-Id: <optional session id>
Body: { message: string, history?: Array<{role, content}> }

Response: { answer: string }
```

## Sample Files

Use the files in `samples/` for testing:

- `resume1.txt` - Full stack engineer (React, Node.js, SUNY Buffalo)
- `resume2.txt` - Backend engineer (Python, Stanford)
- `job-description1.txt` - Senior Full Stack role
- `job-description2.txt` - Backend Engineer role

## Demo Workflow

1. Upload a resume (PDF or TXT)
2. Upload a job description (PDF or TXT)
3. View match score, strengths, gaps, and insights
4. Ask questions in chat, e.g.:
   - "Does this candidate have a degree from a state university?"
   - "Can they handle backend architecture?"
   - "What's their experience with PostgreSQL?"
   - "Is they eligible to work in the US?"

## Project Structure

```
project/
├── backend/
│   ├── src/
│   │   ├── index.ts           # Express app
│   │   ├── routes/            # upload, chat
│   │   ├── rag/               # vectorStore, ragService
│   │   ├── services/          # matchScorer, resumeParser
│   │   └── utils/             # documentParser, textChunker
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/        # UploadSection, MatchAnalysis, ChatSection
│   │   └── types.ts
│   └── package.json
├── samples/                   # Sample resumes and JDs
└── README.md
```

## License

MIT
