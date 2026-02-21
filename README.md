
🧠 AI Resume Screening Tool (RAG-Based)

An AI-powered Resume Screening Tool that allows recruiters to upload a resume and job description, calculate a match score, and ask contextual questions using **real Retrieval-Augmented Generation (RAG)**.

 🚀 Tech Stack

 Backend

* Node.js 18+
* Express.js
* Gemini LLM API
* Gemini Embeddings (`text-embedding-004`)
* In-Memory Vector Store
* pdf-parse

 Frontend

* React 18
* TypeScript

🎯 Objective

Recruiters can:

1. Upload 1 Resume (PDF/TXT)
2. Upload 1 Job Description (PDF/TXT)
3. Get:

   * Match Score (e.g., 75%)
   * Strengths
   * Gaps
   * Key Insights
4. Ask contextual questions via RAG-powered chat


✅ RAG Implementation (CRITICAL REQUIREMENT)

This project implements **actual RAG**, NOT direct LLM queries.

 RAG Flow

1. Extract text from Resume & JD
2. Chunk documents into sections
3. Generate embeddings for resume chunks
4. Store embeddings in vector database
5. Convert user question → embedding
6. Perform similarity search (Top-K)
7. Retrieve relevant resume sections
8. Pass retrieved context + question to LLM
9. Generate grounded answer

✔ Embeddings
✔ Vector Storage
✔ Retrieval
✔ Augmented Generation


 🏗 Architecture Overview

React Frontend
        |
        v
Express Backend
        |
        v
PDF/TXT Parsing
        |
        v
Text Chunking
        |
        v
Gemini Embeddings
        |
        v
Vector Store (Cosine Similarity)
        |
        v
Retrieve Top-K Chunks
        |
        v
LLM + Retrieved Context
        |
        v
Final Answer


📂 Project Structure

backend/
  src/
    routes/
    rag/
    services/
    utils/

frontend/
  src/
    components/

samples/

 ⚙️ Setup Instructions

🔹 Backend

```bash
cd backend
npm install
```

Create `.env` file:

```
GOOGLE_AI_API_KEY=your_api_key
GEMINI_MODEL=gemini-2.5-flash
GEMINI_EMBEDDING_MODEL=text-embedding-004
```

Run backend:

```bash
npm run dev
```

Server runs at:

```
http://localhost:8000
```

---

## 🔹 Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

# 🔌 API Documentation

## 1️⃣ Upload Resume + JD

**POST** `/upload`

Form Data:

* resume (PDF/TXT)
* jd (PDF/TXT)

Response:

```json
{
  "matchScore": 75,
  "strengths": [],
  "gaps": [],
  "insights": []
}
```

---

## 2️⃣ Chat (RAG-Powered)

**POST** `/chat`

Body:

```json
{
  "question": "Does he have React experience?",
  "history": []
}
```

Response:

```json
{
  "answer": "Yes, the candidate has 3 years of React experience..."
}
```

---

# 📊 Features Implemented

✔ Upload Resume (PDF/TXT)
✔ Upload Job Description (PDF/TXT)
✔ PDF Parsing using pdf-parse
✔ Section-based Text Chunking
✔ Embedding Generation
✔ Vector Storage (In-Memory)
✔ Cosine Similarity Retrieval
✔ Match Score Calculation
✔ Strengths & Gaps Analysis
✔ RAG-Based Contextual Chat
✔ Conversation Memory


# 🧠 Match Scoring Logic

* Extract skills from Job Description
* Compare with Resume content
* Calculate percentage match
* Identify missing skills
* Generate strengths & gaps

