"""
llm.py — LLM engine using Google Gemini API for ET NewsAction AI.
"""

import os
import json
from google import genai
from dotenv import load_dotenv

load_dotenv()

ROLE_LABELS = {
    "student": "Student",
    "investor": "Investor",
    "job_seeker": "Job Seeker",
    "business_owner": "Small Business Owner",
    "general_reader": "General Reader",
}

SYSTEM_PROMPT = (
    "You are ET NewsAction AI — an intelligent assistant built for "
    "Economic Times that helps people understand business news and take "
    "real, practical action. You ONLY answer based on the article "
    "content provided. The user's role is: {role}.\n"
    "Rules:\n"
    "1. Answer ONLY from provided article context\n"
    "2. If insufficient info: say 'The article does not provide enough "
    "information on this topic.'\n"
    "3. Use bullet points, max 5 points\n"
    "4. Simple English, no jargon\n"
    "5. For action steps: use numbered format\n"
    "6. End EVERY response with: 'Based on the article provided.'\n"
    "7. Never make up statistics or facts"
)

USER_PROMPT = (
    "ARTICLE CONTEXT:\n{context}\nEND CONTEXT\n\n"
    "User Role: {role}\n"
    "Question: {question}\n\n"
    "Respond in bullet points. Keep it under 150 words."
)

STANDARD_QUESTIONS = [
    "Who is affected by this news and how?",
    "What does this news mean in simple terms? Explain like I'm a {role} with no prior knowledge.",
    "As a {role}, what are the specific step-by-step actions I should take RIGHT NOW because of this news?",
    "What are the risks or consequences if I as a {role} ignore this news completely?",
]


class LLMEngine:
    """Handles all LLM calls via Gemini API."""

    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY is not set in .env")
        self._client = genai.Client(api_key=api_key)
        self._model = "gemini-2.5-flash"

    def _call(self, system: str, user: str) -> str:
        """Make a single Gemini API call."""
        response = self._client.models.generate_content(
            model=self._model,
            contents=user,
            config=genai.types.GenerateContentConfig(
                system_instruction=system,
                max_output_tokens=1024,
            ),
        )
        return response.text

    def generate_action(self, question: str, role: str, chunks: list[str]) -> str:
        """Generate a single action response from retrieved chunks."""
        role_label = ROLE_LABELS.get(role, role)
        context = "\n\n".join(chunks)
        system = SYSTEM_PROMPT.format(role=role_label)
        user = USER_PROMPT.format(context=context, role=role_label, question=question)
        return self._call(system, user)

    def generate_all_actions(self, role: str, chunks_per_question: dict[str, list[str]]) -> dict:
        """Generate answers for all 4 standard questions."""
        role_label = ROLE_LABELS.get(role, role)
        keys = ["affected", "meaning", "actions", "risks"]
        results = {}

        for key, q_template in zip(keys, STANDARD_QUESTIONS):
            question = q_template.format(role=role_label)
            chunks = chunks_per_question.get(key, [])
            results[key] = self.generate_action(question, role, chunks)

        return results

    def generate_summary(self, chunks: list[str], title: str) -> str:
        """Generate a 2-sentence plain English summary of the article."""
        context = "\n\n".join(chunks[:3])  # first few chunks for summary
        system = (
            "You are a concise news summarizer. Summarize the article in exactly "
            "2 clear sentences. Do not add opinions. Use simple English."
        )
        user = f"Article title: {title}\n\nArticle content:\n{context}\n\nProvide a 2-sentence summary."
        return self._call(system, user)

    def generate_story_arc(self, chunks: list[str], title: str) -> dict:
        """Generate a story arc analysis as a structured dict."""
        context = "\n\n".join(chunks)
        system = (
            "You are a news analyst. Analyze the story arc of this article. "
            "Return ONLY valid JSON with these exact keys: "
            '"background" (1-2 sentences on what led to this), '
            '"current" (1-2 sentences on what is happening now), '
            '"players" (list of key people/organizations mentioned), '
            '"sentiment" (exactly one of: "Positive", "Negative", "Mixed"), '
            '"watch_next" (1 sentence on what to watch for). '
            "Do not include any text outside the JSON object."
        )
        user = f"Article: {title}\n\nContent:\n{context}\n\nReturn JSON only."
        raw = self._call(system, user)

        # Parse JSON from response (handle markdown code blocks)
        raw = raw.strip()
        if raw.startswith("```"):
            raw = raw.split("\n", 1)[-1].rsplit("```", 1)[0]

        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            return {
                "background": "Unable to parse story arc.",
                "current": raw[:200],
                "players": [],
                "sentiment": "Mixed",
                "watch_next": "Follow up on this story for more details.",
            }

    def translate(self, text: str, language: str) -> str:
        """Translate text into a regional Indian language with cultural adaptation."""
        system = (
            f"You are a professional translator specialized in Indian languages. "
            f"Translate the following text into {language}. "
            f"Rules:\n"
            f"1. Use culturally adapted explanations, not literal translation.\n"
            f"2. Keep financial/technical terms in English with {language} explanation in parentheses.\n"
            f"3. Maintain bullet point formatting.\n"
            f"4. Keep it natural and easy to understand for a native {language} speaker.\n"
            f"5. Preserve the meaning and tone of the original text."
        )
        return self._call(system, text)

    def generate_briefing(self, chunks: list[str], title: str, role: str) -> str:
        """Generate a comprehensive intelligence briefing from the article."""
        role_label = ROLE_LABELS.get(role, role)
        context = "\n\n".join(chunks)
        system = (
            f"You are an intelligence analyst at Economic Times creating a deep briefing for a {role_label}. "
            "Create a structured briefing with these sections:\n"
            "1. **HEADLINE SUMMARY** (1 line)\n"
            "2. **KEY FACTS** (3-4 bullet points)\n"
            "3. **MARKET IMPACT** (2-3 bullet points)\n"
            "4. **WHAT IT MEANS FOR YOU** as a {role} (2-3 personalized bullet points)\n"
            "5. **RECOMMENDED ACTIONS** (numbered, 3 steps)\n"
            "6. **WATCH LIST** (2-3 things to monitor going forward)\n"
            "Keep it under 250 words. Simple English. Based only on the article."
        )
        user = f"Article: {title}\n\nContent:\n{context}"
        return self._call(system, user)

    def _parse_json(self, raw: str) -> any:
        raw = raw.strip()
        if raw.startswith("```"):
            raw = raw.split("\n", 1)[-1].rsplit("```", 1)[0]
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            return {}

    def analyze_sentiment(self, chunks: list[str], role: str) -> dict:
        context = "\n\n".join(chunks)
        system = "You are a financial sentiment analyzer for Economic Times India. Analyze news strictly from the provided article context."
        user = (
            f"Analyze the sentiment of this article for a {role}. Return ONLY a JSON object:\n"
            "{\n"
            "  \"overall\": \"Bullish|Bearish|Neutral|Mixed\",\n"
            "  \"score\": <integer -100 to +100>,\n"
            "  \"role_impact\": \"Positive|Negative|Neutral\",\n"
            "  \"confidence\": \"High|Medium|Low\",\n"
            "  \"reason\": \"<one sentence max 15 words>\"\n"
            "}\n"
            f"Article: {context}"
        )
        return self._parse_json(self._call(system, user))

    def rank_actions(self, actions_text: str, role: str) -> dict:
        system = f"You are an urgency analyzer helping {role} prioritize actions from a news article."
        user = (
            "Take these action items and categorize each by urgency. Return ONLY JSON:\n"
            "{\n"
            "  \"do_today\": [{ \"action\": \"...\", \"reason\": \"...\", \"effort\": \"Low|Medium|High\" }],\n"
            "  \"this_week\": [{ \"action\": \"...\", \"reason\": \"...\", \"effort\": \"Low|Medium|High\" }],\n"
            "  \"this_month\": [{ \"action\": \"...\", \"reason\": \"...\", \"effort\": \"Low|Medium|High\" }],\n"
            "  \"watch_and_wait\": [{ \"action\": \"...\", \"reason\": \"...\" }]\n"
            "}\n"
            f"Actions to rank: {actions_text}\nRole: {role}\nRules:\n"
            "- Do Today: time-sensitive, market moves fast\n- This Week: important but not urgent\n"
            "- This Month: strategic, longer-term\n- Watch & Wait: monitor only\n"
            "- Max 2 items per category\n- Keep each action under 10 words"
        )
        return self._parse_json(self._call(system, user))

    def calculate_cognitive_load(self, text: str) -> dict:
        system = "You are a readability and cognitive load analyzer for news articles."
        user = (
            "Analyze this article's cognitive complexity. Return ONLY JSON:\n"
            "{\n"
            "  \"score\": <1-10 integer>,\n"
            "  \"level\": \"Easy|Moderate|Complex|Expert\",\n"
            "  \"reading_time_mins\": <integer>,\n"
            "  \"jargon_count\": <integer>,\n"
            "  \"avg_sentence_length\": <integer words>,\n"
            "  \"recommended_for\": [\"investors\", \"professionals\"],\n"
            "  \"simplification_needed\": true|false,\n"
            "  \"key_jargon_terms\": [\"term1\", \"term2\"]\n"
            "}\n"
            f"Article (first 500 words): {text[:2000]}"
        )
        return self._parse_json(self._call(system, user))

    def define_term(self, term: str, context: str) -> str:
        system = "You are a simple language explainer."
        user = f"Define this term in simple English (max 2 sentences) based on context:\nTerm: {term}\nContext: {context}"
        return self._call(system, user)

    def detect_bias(self, chunks: list[str]) -> dict:
        context = "\n\n".join(chunks)
        system = "You are an objective media bias analyzer. Analyze news articles fairly without political preference. Your job is journalistic analysis only."
        user = (
            "Analyze this article for bias indicators. Return ONLY JSON:\n"
            "{\n"
            "  \"perspective_lean\": \"Pro-Business|Pro-Government|Pro-Consumer|Balanced|Anti-Establishment\",\n"
            "  \"confidence\": \"High|Medium|Low\",\n"
            "  \"tone\": \"Positive|Negative|Neutral|Critical\",\n"
            "  \"missing_perspectives\": [\"perspective 1 not covered\"],\n"
            "  \"language_indicators\": [{ \"phrase\": \"...\", \"suggests\": \"...\" }],\n"
            "  \"recommended_counter_reads\": [\"Search suggestion 1\"],\n"
            "  \"objectivity_score\": <1-10>,\n"
            "  \"disclaimer\": \"This is an AI analysis of language patterns, not a political judgment.\"\n"
            "}\n"
            f"Article: {context}"
        )
        return self._parse_json(self._call(system, user))

    def check_credibility(self, chunks: list[str], source_url: str) -> dict:
        context = "\n\n".join(chunks)
        system = "You are a fact-checking assistant that analyzes internal consistency of news articles. You ONLY analyze what's in the provided text."
        user = (
            "Analyze this article for credibility indicators. Return ONLY JSON:\n"
            "{\n"
            "  \"credibility_score\": <1-100 integer>,\n"
            "  \"credibility_label\": \"High|Moderate|Low|Unverifiable\",\n"
            "  \"source_cited\": true|false,\n"
            "  \"numbers_present\": true|false,\n"
            "  \"expert_quotes\": true|false,\n"
            "  \"internal_consistency\": \"Consistent|Inconsistent|Partially Consistent\",\n"
            "  \"red_flags\": [\"red flag 1 if any\"],\n"
            "  \"green_flags\": [\"credibility indicator 1\"],\n"
            "  \"claims_to_verify\": [{ \"claim\": \"...\", \"how_to_verify\": \"...\" }],\n"
            "  \"verdict\": \"one sentence overall assessment\",\n"
            "  \"disclaimer\": \"This analysis is based only on internal text patterns. Always verify with primary sources.\"\n"
            "}\n"
            "Note: Empty red_flags list means no red flags found.\n"
            f"Article: {context}"
        )
        return self._parse_json(self._call(system, user))

    def suggest_questions(self, chunks: list[str], role: str, existing_answers: dict) -> list:
        context = "\n\n".join(chunks)
        system = f"You are a smart reading companion that helps {role} think deeper about business news."
        user = (
            "Based on this article and these initial insights already provided, suggest 5 smart follow-up questions the user should ask.\n"
            f"Article context: {context}\nAlready answered: {json.dumps(existing_answers)}\nUser role: {role}\n"
            "Return ONLY a JSON array:\n"
            "[\n  {\n"
            "    \"question\": \"specific question text\",\n"
            "    \"category\": \"Risk|Opportunity|Context|Action|Timeline\",\n"
            "    \"difficulty\": \"Basic|Intermediate|Advanced\",\n"
            "    \"why_important\": \"one sentence reason\"\n"
            "  }\n]\n"
            "Rules:\n- Answerable from article\n- Don't repeat what's answered\n- Progressively deeper"
        )
        res = self._parse_json(self._call(system, user))
        return res if isinstance(res, list) else []

    def generate_impact_scores(self, chunks: list[str], role: str) -> dict:
        context = "\n\n".join(chunks)
        system = "You are an expert analyst scoring the impact of business news for Economic Times readers."
        user = (
            f"Score the impact of this news article across 6 dimensions for a {role}. Return ONLY JSON:\n"
            "{\n"
            "  \"urgency\": { \"score\": <1-10>, \"label\": \"Act Now|Soon|Eventually|Monitor\", \"reason\": \"<10 words max>\" },\n"
            "  \"financial_impact\": { \"score\": <1-10>, \"direction\": \"Positive|Negative|Neutral\", \"magnitude\": \"High|Medium|Low\", \"reason\": \"<10 words max>\" },\n"
            "  \"risk_level\": { \"score\": <1-10>, \"label\": \"Critical|High|Medium|Low\", \"type\": \"Market|Regulatory|Operational|Reputational\", \"reason\": \"<10 words max>\" },\n"
            "  \"opportunity_score\": { \"score\": <1-10>, \"window\": \"Immediate|Short-term|Long-term|None\", \"reason\": \"<10 words max>\" },\n"
            "  \"relevance_to_role\": { \"score\": <1-10>, \"direct_impact\": true|false, \"reason\": \"<10 words max>\" },\n"
            "  \"time_sensitivity\": { \"score\": <1-10>, \"deadline\": \"Today|This Week|This Month|No Deadline\", \"reason\": \"<10 words max>\" },\n"
            "  \"overall_action_score\": <1-100>,\n"
            "  \"headline\": \"<one punchy 8-word summary>\"\n"
            "}\n"
            f"Article: {context}\nRole: {role}"
        )
        return self._parse_json(self._call(system, user))
