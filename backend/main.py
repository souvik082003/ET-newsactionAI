"""
main.py — FastAPI application for ET NewsAction AI.
"""

import uuid
import logging
from typing import Optional

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models import (
    QueryRequest, ActionRequest, StoryArcRequest, TranslateRequest,
    RankActionsRequest, DefineTermRequest, CredibilityRequest, SuggestQuestionsRequest, SessionOnlyRequest,
    ActionResponse, ProcessResponse,
)
from scraper import scrape_url, extract_pdf
from rag import RAGEngine
from llm import LLMEngine

# ── Logging ──────────────────────────────────────────────────────────────────

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# ── App Setup ────────────────────────────────────────────────────────────────

app = FastAPI(
    title="ET NewsAction AI",
    description="Turn Economic Times news into personalized action",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Engines (singletons) ────────────────────────────────────────────────────

rag = RAGEngine()
llm = LLMEngine()

# Store article data per session for summary/story-arc
session_data: dict[str, dict] = {}

# ── Endpoints ────────────────────────────────────────────────────────────────


@app.post("/process", response_model=ProcessResponse)
async def process_article(
    url: Optional[str] = Form(None),
    text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    role: str = Form("general_reader"),
):
    """Process an article from URL, pasted text, or uploaded PDF."""
    logger.info("POST /process — url=%s text_len=%s file=%s role=%s",
                url, len(text) if text else 0, file.filename if file else None, role)

    try:
        if url and url.strip():
            article = scrape_url(url.strip())
        elif file:
            file_bytes = await file.read()
            article = extract_pdf(file_bytes)
        elif text and text.strip():
            article = {"title": "Pasted Article", "text": text.strip(), "source": "paste"}
        else:
            raise HTTPException(status_code=400, detail="Provide one of: url, text, or file.")

        article_text = article["text"]
        if len(article_text.split()) < 30:
            raise HTTPException(status_code=400, detail="Article too short (need at least 30 words).")

        # Create session
        session_id = str(uuid.uuid4())
        chunk_count = rag.create_session(session_id, article)
        logger.info("Session %s created with %d chunks", session_id, chunk_count)

        # Generate summary
        summary_chunks = rag.query_session(session_id, "summary overview key points", top_k=3)
        summary = llm.generate_summary(summary_chunks, article["title"])

        word_count = len(article_text.split())
        preview = article_text[:300] + ("…" if len(article_text) > 300 else "")

        session_data[session_id] = {
            "title": article["title"],
            "word_count": word_count,
            "summary": summary,
        }

        return ProcessResponse(
            status="ready",
            title=article["title"],
            word_count=word_count,
            session_id=session_id,
            article_preview=preview,
            summary=summary,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error processing article")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/actions")
async def generate_actions(req: ActionRequest):
    """Generate all 4 standard action responses."""
    logger.info("POST /actions — session=%s role=%s", req.session_id, req.role)

    try:
        questions_for_retrieval = {
            "affected": "Who is affected by this news and how?",
            "meaning": "What does this news mean in simple terms?",
            "actions": "What actions should I take because of this news?",
            "risks": "What are the risks if I ignore this news?",
        }

        chunks_per_question = {}
        for key, q in questions_for_retrieval.items():
            chunks_per_question[key] = rag.query_session(req.session_id, q, top_k=4)

        results = llm.generate_all_actions(req.role, chunks_per_question)
        return results

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.exception("Error generating actions")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/query", response_model=ActionResponse)
async def query(req: QueryRequest):
    """Answer a custom question using RAG."""
    logger.info("POST /query — session=%s question=%s", req.session_id, req.question[:50])

    try:
        chunks = rag.query_session(req.session_id, req.question, top_k=4)
        answer = llm.generate_action(req.question, req.role, chunks)
        return ActionResponse(
            question=req.question,
            answer=answer,
            role=req.role,
            based_on_article=True,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.exception("Error querying")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/story-arc")
async def story_arc(req: StoryArcRequest):
    """Generate a story arc analysis."""
    logger.info("POST /story-arc — session=%s", req.session_id)

    try:
        chunks = rag.query_session(req.session_id, "key events players timeline background", top_k=6)
        info = session_data.get(req.session_id, {})
        title = info.get("title", "Article")
        arc = llm.generate_story_arc(chunks, title)
        return arc
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.exception("Error generating story arc")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/translate")
async def translate(req: TranslateRequest):
    """Translate text into an Indian regional language (Vernacular Engine)."""
    logger.info("POST /translate — language=%s len=%d", req.language, len(req.text))

    try:
        translated = llm.translate(req.text, req.language)
        return {"translated_text": translated, "language": req.language}
    except Exception as e:
        logger.exception("Error translating")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/briefing")
async def briefing(req: ActionRequest):
    """Generate an intelligence briefing (News Navigator)."""
    logger.info("POST /briefing — session=%s role=%s", req.session_id, req.role)

    try:
        chunks = rag.query_session(req.session_id, "key facts impact market actions", top_k=6)
        info = session_data.get(req.session_id, {})
        title = info.get("title", "Article")
        brief = llm.generate_briefing(chunks, title, req.role)
        return {"briefing": brief, "title": title}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.exception("Error generating briefing")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/sentiment")
async def sentiment(req: ActionRequest):
    logger.info("POST /sentiment — session=%s role=%s", req.session_id, req.role)
    try:
        chunks = rag.query_session(req.session_id, "sentiment market impact outlook", top_k=4)
        return llm.analyze_sentiment(chunks, req.role)
    except Exception as e:
        logger.exception("Error analyzing sentiment")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/rank-actions")
async def rank_actions(req: RankActionsRequest):
    logger.info("POST /rank-actions — session=%s role=%s", req.session_id, req.role)
    try:
        return llm.rank_actions(req.actions_text, req.role)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/cognitive-load/{session_id}")
async def cognitive_load(session_id: str):
    logger.info("GET /cognitive-load — session=%s", session_id)
    try:
        info = session_data.get(session_id)
        if not info:
            raise HTTPException(status_code=404, detail="Session not found")
        text = info.get("text", "") 
        if not text:
            # Fallback to querying chunks if original text not stored
            chunks = rag.query_session(session_id, "", top_k=5)
            text = " ".join(chunks)
        return llm.calculate_cognitive_load(text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/define-term")
async def define_term(req: DefineTermRequest):
    logger.info("POST /define-term — term=%s", req.term[:20])
    try:
        return {"definition": llm.define_term(req.term, req.context)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/bias-detect")
async def bias_detect(req: SessionOnlyRequest):
    logger.info("POST /bias-detect — session=%s", req.session_id)
    try:
        chunks = rag.query_session(req.session_id, "perspective opinion tone language framing", top_k=6)
        return llm.detect_bias(chunks)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/credibility")
async def credibility(req: CredibilityRequest):
    logger.info("POST /credibility — session=%s", req.session_id)
    try:
        chunks = rag.query_session(req.session_id, "facts statistics sources quotes evidence claims", top_k=6)
        return llm.check_credibility(chunks, req.source_url)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/suggest-questions")
async def suggest_questions(req: SuggestQuestionsRequest):
    logger.info("POST /suggest-questions — session=%s role=%s", req.session_id, req.role)
    try:
        chunks = rag.query_session(req.session_id, "implications future risk opportunity context background", top_k=5)
        questions = llm.suggest_questions(chunks, req.role, req.existing_answers)
        return {"questions": questions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/impact-scores")
async def impact_scores(req: ActionRequest):
    logger.info("POST /impact-scores — session=%s role=%s", req.session_id, req.role)
    try:
        chunks = rag.query_session(req.session_id, "impact risk urgency financial opportunity timeline", top_k=6)
        return llm.generate_impact_scores(chunks, req.role)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/newsroom/{role}")
async def get_newsroom_feed(role: str):
    logger.info("GET /newsroom — populating personalized feed for %s", role)
    try:
        articles = llm.generate_personalized_newsroom(role)
        return {"articles": articles}
    except Exception as e:
        logger.exception("Error generating personalized newsroom")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/session/{session_id}")
async def delete_session(session_id: str):
    """Clean up a session."""
    rag.delete_session(session_id)
    session_data.pop(session_id, None)
    return {"status": "deleted"}


@app.get("/health")
async def health():
    return {"status": "ok", "model": "gemini-2.5-flash", "app": "ET NewsAction AI"}
