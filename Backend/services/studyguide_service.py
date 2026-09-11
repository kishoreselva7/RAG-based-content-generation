import os
import re
from pathlib import Path
from typing import Dict, Any
import config
from services.retrieval_service import retrieve_top_chunks
from services.generation_service import generate_llm_response

STUDY_GUIDE_PROMPT = """
You are an expert university academic advisor.
Using ONLY the retrieved syllabus context below, generate an extensive, highly structured Study Guide for: "{topic}".

Include the following sections:
# Study & Exam Guide: {topic}

## 🎯 Learning Objectives
- Clear measurable outcomes expected from studying this topic.

## 📝 Rapid Revision Notes
- Concise summary notes of key formulas, rules, and core concepts.

## 🔥 High-Yield Important Topics
- Priority areas heavily weighted in university examinations.

## ❓ Frequently Asked Questions (FAQs)
- 5 Common exam questions with detailed model answers.

## 💡 Pro Exam Tips & Strategy
- Practical guidelines to score maximum marks in tests.

Return clean Markdown format ONLY using retrieved syllabus context.
"""

def generate_study_guide(topic: str) -> Dict[str, Any]:
    """Feature 6: Study Guide Generation (Markdown)."""
    chunks, context = retrieve_top_chunks(topic, top_k=config.TOP_K_RETRIEVAL)
    prompt = STUDY_GUIDE_PROMPT.format(topic=topic)

    markdown_content = generate_llm_response(prompt=prompt, retrieved_context=context)

    topic_slug = re.sub(r'[^a-zA-Z0-9_]', '_', topic.lower())[:40]
    filename = f"study_guide_{topic_slug}.md"
    file_path = config.STUDY_GUIDES_DIR / filename

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(markdown_content)

    return {
        "topic": topic,
        "content": markdown_content,
        "file_path": str(file_path),
        "filename": filename,
        "retrieved_chunks": len(chunks)
    }
