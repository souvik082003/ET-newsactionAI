# ET NewsAction AI — ET Hackathon 2026 (PS8)

<div align="center">
  <a href="./architecture.md"><img src="https://img.shields.io/badge/Architecture-View%20Doc-blue?style=for-the-badge&logo=gitbook" alt="Architecture"></a>
  <a href="./impact.md"><img src="https://img.shields.io/badge/Impact%20Model-View%20Doc-success?style=for-the-badge&logo=googledocs" alt="Impact Model"></a>
  <a href="./CONTRIBUTING.md"><img src="https://img.shields.io/badge/Contributing-Guidelines-orange?style=for-the-badge&logo=github" alt="Contributing"></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge" alt="License"></a>
</div>
<br>

> **Turn News Into Action. For Everyone.**

## Problem Statement

Business news in 2026 is still delivered like 2005 — static text, one-size-fits-all. Most users (students, retail investors, job seekers, PWD users) cannot understand what a news article means for **them** or what to **do** about it. ET has the data. We build the intelligence layer.

## Our Solution

**ET NewsAction AI** takes any ET news article (URL, pasted text, or PDF) and transforms it into **structured, actionable guidance** personalized by user role — powered by a RAG pipeline that ensures every response is grounded in the actual article. Zero hallucination.

## Features

| Feature | Description |
|---------|-------------|
| 🤖 RAG Pipeline | Retrieval-Augmented Generation ensures answers come only from the article |
| 👥 Role-Based Actions | Personalized for: Student, Investor, Job Seeker, Business Owner, General Reader |
| ♿ PWD-First Accessibility | High contrast, large text, dyslexia font, voice I/O, reduced motion |
| 📰 Story Arc Tracker | Background, current events, key players, sentiment, what to watch next |
| 🎤 Voice Input/Output | Browser-native TTS (read aloud) and STT (speak questions) |
| 📱 PWA Support | Installable as a mobile/desktop app |
| 📥 Export Reports | Download analysis as a text file |
| 💬 Custom Questions | Ask anything about the article with full Q&A history |

## Key Documentation

- 📊 **[Impact Model & Business Case](./impact.md)**: Detailed breakdown of the monetization, user adoption strategy, and problem-solution fit.
- 🏗️ **[System Architecture](./architecture.md)**: Deep dive into the RAG pipeline, LLM integration, and component architecture.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 (Vite), Tailwind CSS, Framer Motion, Lucide Icons |
| Backend | Python FastAPI |
| LLM | Google Gemini 2.5 Flash via google-genai SDK |
| Embeddings | sentence-transformers (all-MiniLM-L6-v2) |
| Vector DB | ChromaDB (in-memory) |
| Scraping | newspaper3k + BeautifulSoup |
| PDF Parsing | PyMuPDF (fitz) |
| Voice | Web Speech API (browser-native TTS + STT) |

## Architecture

```
User → [React PWA Frontend]
         ↓ REST API (FastAPI)
    ┌────┴────────────────────┐
  Scraper              RAG Engine
  (URL/PDF/Text)    (ChromaDB + embeddings)
    └────┬────────────────────┘
         ↓ Retrieved chunks
      LLM Engine
   (Gemini 2.5 Flash)
         ↓
    Structured Action Response
         ↓
    [React Frontend — renders cards]
```

## Setup Instructions

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # ← add your GEMINI_API_KEY
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/process` | Process article from URL/text/PDF |
| POST | `/actions` | Generate 4 standard action cards |
| POST | `/query` | Ask a custom question (RAG) |
| POST | `/story-arc` | Generate story arc analysis |
| DELETE | `/session/{id}` | Clean up session |
| GET | `/health` | Health check |

## Accessibility Features

1. **High Contrast Mode** — Black background with gold text (WCAG AAA)
2. **Large Text Mode** — 1.25em upscaling with increased line height
3. **Dyslexia Font** — OpenDyslexic font with increased letter spacing
4. **Reduced Motion** — Disables all animations
5. **Voice I/O** — Read any card aloud (TTS), speak questions (STT)
6. **Focus Highlight** — 4px orange focus rings for keyboard navigation
7. **Skip to Content** — Screen reader skip link
8. **ARIA Labels** — Every interactive element is labeled

## Environment Variables

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Google Gemini API key (in `backend/.env`) |

Get your key at: https://aistudio.google.com/apikey

## License

MIT — Built for ET AI Hackathon 2026
