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

## Features Completed

| Feature | Description |
|---------|-------------|
| 📰 **My ET Newsroom** | A personalized homepage dashboard that dynamically rewrites the top 4 breaking news headlines specifically tailored for your selected role. |
| 🎬 **AI Video Studio** | Generates an auto-playing broadcast slide-deck of the story arc, complete with physical AI text-to-speech auto-narration. |
| 🤖 **RAG Pipeline** | Retrieval-Augmented Generation ensures answers come only from the article. |
| 👥 **Role-Based Actions** | Highly structured action plans personalized for: Student, Investor, Job Seeker, General. |
| 🌍 **Vernacular Engine** | Native semantic translation of the article actions into regional Indian languages without losing contextual framing. |
| ♿ **PWD-First Accessibility**| Includes Dyslexia fonts, standard High Contrast modes, reduced motion switches, and deep screen-reader ARIA label support. |
| 📈 **Story Arc Tracker** | Tracks the timeline context, sentiment shifts, and future predictions of any pasted story. |
| 💬 **Interactive Briefing**| Ask limitless custom follow-up questions directly to the underlying article PDF/URL. |

## Key Documentation

- 📊 **[Impact Model & Business Case](./impact.md)**: Detailed breakdown of the monetization, user adoption strategy, and problem-solution fit.
- 🏗️ **[System Architecture](./architecture.md)**: Deep dive into the RAG pipeline, LLM integration, and component architecture.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 (Vite), Tailwind CSS, Framer Motion, Lucide Icons |
| Backend | Python FastAPI |
| LLM | Google Gemini 2.5 Flash Lite via google-genai SDK |
| Embeddings | sentence-transformers (all-MiniLM-L6-v2) |
| Vector DB | ChromaDB (in-memory) |
| Scraping | newspaper3k + BeautifulSoup |
| PDF Parsing | PyMuPDF (fitz) |
| Voice | Web Speech API (browser-native TTS auto-narration) |

## Architecture

```text
User → [React PWA Frontend]
         ↓ REST API (FastAPI)
    ┌────┴────────────────────┐
  Scraper              RAG Engine
  (URL/PDF/Text)    (ChromaDB + embeddings)
    └────┬────────────────────┘
         ↓ Retrieved chunks
      LLM Engine
   (Gemini 2.5 Lite)
         ↓
    Structured Action Response
         ↓
    [React Frontend — renders Dashboard & Studio]
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
| GET | `/newsroom/{role}`| Fetch dynamic role-rewritten home dashboard mock feed |
| POST | `/process` | Process article from URL/text/PDF |
| POST | `/actions` | Generate 4 standard action cards |
| POST | `/query` | Ask a custom question (RAG) |
| POST | `/story-arc` | Generate story arc analysis |
| DELETE | `/session/{id}` | Clean up session |
| GET | `/health` | Health check |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Google Gemini API key (in `backend/.env`) |

Get your free API key at: https://aistudio.google.com/apikey

## License

MIT — Built for ET AI Hackathon 2026
