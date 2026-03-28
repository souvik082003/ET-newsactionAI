"""
models.py — Pydantic request/response models for the ET NewsAction AI API.
"""

from pydantic import BaseModel
from typing import Optional


class ArticleRequest(BaseModel):
    url: Optional[str] = None
    text: Optional[str] = None
    role: str = "general_reader"


class QueryRequest(BaseModel):
    question: str
    role: str = "general_reader"
    session_id: str


class ActionRequest(BaseModel):
    session_id: str
    role: str = "general_reader"


class StoryArcRequest(BaseModel):
    session_id: str


class TranslateRequest(BaseModel):
    text: str
    language: str = "Hindi"


class ActionResponse(BaseModel):
    question: str
    answer: str
    role: str
    based_on_article: bool = True


class RankActionsRequest(BaseModel):
    session_id: str
    role: str
    actions_text: str


class DefineTermRequest(BaseModel):
    term: str
    context: str


class CredibilityRequest(BaseModel):
    session_id: str
    source_url: str


class SuggestQuestionsRequest(BaseModel):
    session_id: str
    role: str
    existing_answers: dict


class SessionOnlyRequest(BaseModel):
    session_id: str


class ProcessResponse(BaseModel):
    status: str
    title: str
    word_count: int
    session_id: str
    article_preview: str
    summary: str = ""
