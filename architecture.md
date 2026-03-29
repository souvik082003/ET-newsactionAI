# Architecture — ET NewsAction AI

## System Overview

```
┌───────────────────────────────────────────────────────────┐
│                    React PWA Frontend                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐ │
│  │ Article   │ │ Action   │ │ Custom   │ │ Accessibility│ │
│  │ Input     │ │ Cards    │ │ Query    │ │ Bar          │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────────────┘ │
│       └──────────┬──┴───────────┘                         │
│                  ↓ REST API (Axios)                        │
└──────────────────┬────────────────────────────────────────┘
                   ↓
┌──────────────────┴────────────────────────────────────────┐
│                  FastAPI Backend (Python)                   │
│                                                            │
│  ┌────────────────┐   ┌───────────────────────────────┐   │
│  │  Scraper Agent  │   │        RAG Engine              │   │
│  │                 │   │  ┌─────────┐ ┌─────────────┐  │   │
│  │ newspaper3k     │   │  │ Chunker │ │ Embeddings  │  │   │
│  │ BeautifulSoup   │──→│  │300-word │ │(MiniLM-L6)  │  │   │
│  │ PyMuPDF (PDF)   │   │  │ overlap │ │             │  │   │
│  └────────────────┘   │  └────┬────┘ └──────┬──────┘  │   │
│                        │       ↓             ↓         │   │
│                        │  ┌──────────────────────────┐ │   │
│                        │  │   ChromaDB (in-memory)   │ │   │
│                        │  │   Cosine similarity      │ │   │
│                        │  └──────────┬───────────────┘ │   │
│                        └─────────────┼─────────────────┘   │
│                                      ↓                      │
│  ┌───────────────────────────────────┴──────────────────┐  │
│  │                LLM Engine                             │  │
│  │  Gemini 2.5 Flash via google-genai SDK                │  │
│  │  System prompt: role-personalized, article-only       │  │
│  │  Output: structured bullet points, max 150 words      │  │
│  └───────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

## Agent Roles

### 1. Scraper Agent
- Extracts article content from URLs (newspaper3k + BS4 fallback)
- Parses uploaded PDFs (PyMuPDF)
- Cleans text: removes ads, "Read more:", navigation elements
- Handles ET paywall gracefully (returns available content)

### 2. RAG Agent
- **Chunking**: 300-word chunks with 50-word overlap
- **Embedding**: sentence-transformers `all-MiniLM-L6-v2` (384-dim)
- **Storage**: ChromaDB in-memory, one collection per session
- **Retrieval**: Top-4 cosine similarity results per query

### 3. LLM Agent
- Model: Gemini 2.5 Flash
- Strict grounding: Only answers from retrieved chunks
- Role personalization: 5 user personas
- Standard 4-question framework + custom queries
- Story Arc generation (structured JSON output)

### 4. Accessibility Agent (Frontend)
- TTS: Web Speech API with Chrome long-text workaround
- STT: SpeechRecognition API (en-IN locale)
- Visual: 6 toggleable accessibility modes (localStorage-persisted)
- Navigation: Skip-to-content, ARIA labels, keyboard nav, focus rings

## Error Handling

| Scenario | Response |
|----------|----------|
| Scraping fails | User shown error with retry option |
| Article <30 words | 400 error: "Article too short" |
| LLM insufficient context | "The article does not provide enough information" |
| Session not found | 404 with clear message |
| API key missing | 500 at startup with message |
| Story arc parse fails | Graceful JSON fallback |

## Data Flow

```
1. User Input → Article text extracted (scraper)
2. Article text → 300-word chunks (RAG chunker)
3. Chunks → 384-dim embeddings (sentence-transformers)
4. Embeddings → ChromaDB collection (per session)
5. User question → embedding → cosine similarity search
6. Top 4 chunks → LLM prompt (role-specific system prompt)
7. LLM → structured response → React cards
```

## Session Management

- Each article upload creates a UUID-based session
- Session maps to a ChromaDB collection
- Sessions are cleaned up via `DELETE /session/{id}`
- No persistent storage (demo mode)

## Security Notes

- API key stored in `.env` (never committed)
- CORS restricted to development ports
- No user data persisted beyond session
- All processing is per-session, isolated
