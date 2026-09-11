import os
import re
from pathlib import Path
from typing import Dict, Any
import config
from services.retrieval_service import retrieve_top_chunks
from services.generation_service import generate_llm_response

NOTES_PROMPT_TEMPLATE = """
You are an experienced university professor.
Using ONLY the retrieved syllabus context provided below, generate comprehensive, detailed lecture notes for the topic: "{topic}".

Include the following structured sections:
1. # Lecture Notes: {topic}
2. ## Detailed Explanation
3. ## Important Points (Bullet list of critical concepts)
4. ## Real World Examples (Practical applications)
5. ## Key Terms & Definitions
6. ## Summary & Takeaways

Strictly return clean Markdown format.
"""

def generate_lecture_notes(topic: str, custom_prompt: str = None) -> Dict[str, Any]:
    """Feature 1: Lecture Notes Generation (Markdown)."""
    chunks, context = retrieve_top_chunks(topic, top_k=config.TOP_K_RETRIEVAL)
    
    prompt = custom_prompt or NOTES_PROMPT_TEMPLATE.format(topic=topic)
    notes_markdown = generate_llm_response(prompt=prompt, retrieved_context=context)

    # Save to generated directory
    topic_slug = re.sub(r'[^a-zA-Z0-9_]', '_', topic.lower())[:40]
    filename = f"notes_{topic_slug}.md"
    file_path = config.NOTES_DIR / filename
    
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(notes_markdown)

    return {
        "topic": topic,
        "content": notes_markdown,
        "file_path": str(file_path),
        "filename": filename,
        "retrieved_chunks": len(chunks)
    }
