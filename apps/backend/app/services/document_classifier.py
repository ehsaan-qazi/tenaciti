"""
Document Classifier Service — quickly scans a document to determine if it contains assessments or topics.
Used for UI pre-flight checks.
"""

import json
import logging

from app.services.groq_router import get_router

logger = logging.getLogger(__name__)

CLASSIFIER_SYSTEM_PROMPT = """You are an academic document classifier. Your job is to quickly analyze the text of an uploaded document (syllabus, slides, notes, etc.) and determine its contents.

Specifically, we want to know:
1. Does it contain graded assessment items (exams, assignments, quizzes, projects, labs, homework)? (has_assessments)
2. Does it contain academic topics, learning objectives, or structured curriculum modules? (has_topics)

Respond ONLY in strict JSON format. Example:
{"has_assessments": true, "has_topics": false}

If you are unsure, default to true."""

MAX_CLASSIFIER_CHARS = 5000  # We only need the first part of the document to get the gist

def classify_document_text(text: str) -> dict:
    """
    Sends the first few thousand characters of a document to Groq
    to classify if it contains assessments and/or topics.
    
    Returns a dictionary like {"has_assessments": bool, "has_topics": bool}
    """
    if len(text) > MAX_CLASSIFIER_CHARS:
        text = text[:MAX_CLASSIFIER_CHARS] + "\n\n[... truncated]"

    messages = [
        {"role": "system", "content": CLASSIFIER_SYSTEM_PROMPT},
        {"role": "user", "content": f"Classify this document:\n\n{text}"},
    ]

    router = get_router()
    # Use a fast model if possible, we pass small max_tokens since we just need JSON
    try:
        response_text, model_used = router.chat(messages=messages, temperature=0.0, max_tokens=150)
        
        # Clean up possible markdown fences
        text_clean = response_text.strip()
        if text_clean.startswith("```"):
            lines = text_clean.splitlines()
            text_clean = "\n".join(lines[1:-1]).strip()
            
        parsed = json.loads(text_clean)
        
        has_assessments = bool(parsed.get("has_assessments", True))
        has_topics = bool(parsed.get("has_topics", True))
        
        return {
            "has_assessments": has_assessments,
            "has_topics": has_topics
        }
        
    except Exception as e:
        logger.warning(f"Failed to classify document, defaulting to True: {e}")
        # Default to True so we don't accidentally block valid documents on AI failure
        return {
            "has_assessments": True,
            "has_topics": True
        }
