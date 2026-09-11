from typing import List, Dict, Any, Tuple
from services.vectordb_service import query_vector_database
import config

def retrieve_top_chunks(query: str, top_k: int = None) -> Tuple[List[Dict[str, Any]], str]:
    """
    RAG Semantic Search Step:
    Queries ChromaDB and retrieves top K (default 5) most relevant chunks.
    Formats them into a consolidated context string.
    """
    k = top_k or config.TOP_K_RETRIEVAL
    chunks = query_vector_database(query_text=query, top_k=k)
    
    if not chunks:
        return [], "No retrieved context available in vector database."

    formatted_context_blocks = []
    for idx, c in enumerate(chunks, 1):
        meta = c.get("metadata", {})
        unit = meta.get("unit", "General Unit")
        topic = meta.get("topic", "General Topic")
        source = meta.get("source_file", "syllabus.pdf")
        
        block = (
            f"--- CONTEXT CHUNK {idx} [{unit} | {topic} | Source: {source}] ---\n"
            f"{c['text']}\n"
        )
        formatted_context_blocks.append(block)

    consolidated_context = "\n".join(formatted_context_blocks)
    return chunks, consolidated_context
