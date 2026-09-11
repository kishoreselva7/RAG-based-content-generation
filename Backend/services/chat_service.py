from typing import Dict, Any, List
import config
from services.retrieval_service import retrieve_top_chunks
from services.generation_service import generate_llm_response

TUTOR_SYSTEM_PROMPT = """
You are an expert university AI tutor and professor.
Answer the student's question ONLY using the retrieved syllabus context provided below.

RULES:
1. Base your explanation strictly on the retrieved chunks.
2. If the answer cannot be found in the provided syllabus context, reply EXACTLY:
   "The requested information is not available in the uploaded syllabus."
3. Do not assume or use outside information beyond what is retrieved.
4. Provide structured, easy-to-understand academic explanations.
"""

def answer_tutor_question(student_question: str, history: List[Dict[str, str]] = None) -> Dict[str, Any]:
    """
    Feature 7: AI Tutor Chat Service with Strict RAG Fallback Enforcement.
    """
    if not student_question.strip():
        return {
            "answer": "Please ask a specific question related to your uploaded syllabus.",
            "sources": []
        }

    # Step: Semantic Search Top 5 Chunks
    chunks, context = retrieve_top_chunks(student_question, top_k=config.TOP_K_RETRIEVAL)

    if not chunks:
        return {
            "answer": "The requested information is not available in the uploaded syllabus.",
            "sources": []
        }

    # Include recent context from chat history if available
    history_str = ""
    if history:
        recent = history[-4:] # Last 2 turns
        history_str = "\nRecent Conversation:\n" + "\n".join([f"{h['role'].title()}: {h['content']}" for h in recent])

    prompt = f"{history_str}\n\nStudent Question: {student_question}"

    answer = generate_llm_response(
        prompt=prompt,
        retrieved_context=context,
        system_prompt_override=TUTOR_SYSTEM_PROMPT
    )

    sources = []
    for c in chunks:
        meta = c.get("metadata", {})
        sources.append({
            "chunk_id": c.get("chunk_id"),
            "unit": meta.get("unit", "Unit"),
            "topic": meta.get("topic", "Topic"),
            "source_file": meta.get("source_file", "Syllabus.pdf"),
            "page": meta.get("page", 1),
            "snippet": c.get("text", "")[:120] + "..."
        })

    return {
        "question": student_question,
        "answer": answer,
        "sources": sources,
        "retrieved_count": len(chunks)
    }
