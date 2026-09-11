import os
import re
import json
import logging
from pathlib import Path
from typing import Dict, Any, List
import config
from services.retrieval_service import retrieve_top_chunks
from services.generation_service import generate_llm_response

logger = logging.getLogger(__name__)

FLASHCARD_PROMPT_TEMPLATE = """
Using ONLY the retrieved syllabus context below, generate a deck of 10 educational flashcards for topic: "{topic}".

Return valid JSON with schema:
{{
  "topic": "{topic}",
  "total_cards": 10,
  "flashcards": [
    {{
      "card_id": 1,
      "front": "Question or Core Concept on Front of Card",
      "back": "Clear concise answer or explanation on Back of Card",
      "keyword": "Key Term",
      "definition": "Official definition based on syllabus context"
    }}
  ]
}}

Generate 10 flashcards. Return ONLY raw valid JSON.
"""

def generate_flashcards(topic: str) -> Dict[str, Any]:
    """Feature 5: Flashcards Generation (JSON)."""
    chunks, context = retrieve_top_chunks(topic, top_k=config.TOP_K_RETRIEVAL)
    prompt = FLASHCARD_PROMPT_TEMPLATE.format(topic=topic)

    json_str = generate_llm_response(prompt=prompt, retrieved_context=context, json_mode=True)
    card_data = _parse_flashcard_json(json_str, topic)

    topic_slug = re.sub(r'[^a-zA-Z0-9_]', '_', topic.lower())[:40]
    filename = f"flashcards_{topic_slug}.json"
    file_path = config.FLASHCARDS_DIR / filename

    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(card_data, f, indent=2)

    return {
        "topic": topic,
        "flashcard_data": card_data,
        "file_path": str(file_path),
        "filename": filename,
        "card_count": len(card_data.get("flashcards", [])),
        "retrieved_chunks": len(chunks)
    }

def _parse_flashcard_json(json_str: str, topic: str) -> Dict[str, Any]:
    """Parses Flashcards JSON."""
    try:
        match = re.search(r'\{.*\}', json_str, re.DOTALL)
        if match:
            return json.loads(match.group(0))
        return json.loads(json_str)
    except Exception as e:
        logger.warning(f"Flashcard JSON parse error: {e}. Building fallback deck.")

    cards = [
        {
            "card_id": i,
            "front": f"What is the key principle of {topic} (Card #{i})?",
            "back": f"Core concept specified in syllabus context regarding {topic}.",
            "keyword": f"Concept-{i}",
            "definition": f"Standard academic definition derived from curriculum for {topic}."
        } for i in range(1, 11)
    ]
    return {
        "topic": topic,
        "total_cards": 10,
        "flashcards": cards
    }
