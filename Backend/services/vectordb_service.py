import os
import logging
from typing import List, Dict, Any, Optional
import chromadb
from chromadb.config import Settings
import config
from services.embedding_service import get_embeddings

logger = logging.getLogger(__name__)

_chroma_client = None
_collection = None

def get_chroma_client():
    """Initializes and returns ChromaDB PersistentClient."""
    global _chroma_client
    if _chroma_client is None:
        db_path = str(config.VECTORDB_DIR)
        _chroma_client = chromadb.PersistentClient(path=db_path)
    return _chroma_client

def get_or_create_collection():
    """Gets or creates the ChromaDB collection `course_documents`."""
    global _collection
    client = get_chroma_client()
    _collection = client.get_or_create_collection(
        name=config.CHROMA_COLLECTION_NAME,
        metadata={"description": "EduGen AI Course Syllabus Vector Store"}
    )
    return _collection

def store_chunks_in_vectordb(chunks: List[Dict[str, Any]]) -> int:
    """
    Stores document chunks with embeddings and metadata into ChromaDB.
    Returns the count of inserted chunks.
    """
    if not chunks:
        return 0

    collection = get_or_create_collection()

    ids = [chunk["chunk_id"] for chunk in chunks]
    documents = [chunk["text"] for chunk in chunks]
    metadatas = [chunk["metadata"] for chunk in chunks]

    # Generate embeddings
    embeddings = get_embeddings(documents)

    # Insert/Upsert into ChromaDB
    collection.upsert(
        ids=ids,
        documents=documents,
        embeddings=embeddings,
        metadatas=metadatas
    )

    logger.info(f"Successfully stored {len(chunks)} chunks in ChromaDB collection '{config.CHROMA_COLLECTION_NAME}'")
    return len(chunks)

def query_vector_database(query_text: str, top_k: int = None, filter_metadata: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
    """
    Performs semantic similarity search on ChromaDB.
    Retrieves top_k (default 5) most relevant chunks.
    """
    k = top_k or config.TOP_K_RETRIEVAL
    collection = get_or_create_collection()

    if collection.count() == 0:
        logger.warning("ChromaDB collection is empty.")
        return []

    # Get query embedding
    query_embeddings = get_embeddings([query_text])

    query_params = {
        "query_embeddings": query_embeddings,
        "n_results": min(k, collection.count())
    }

    if filter_metadata:
        query_params["where"] = filter_metadata

    results = collection.query(**query_params)

    retrieved_chunks = []
    if results and results.get("documents"):
        docs = results["documents"][0]
        metas = results["metadatas"][0] if results.get("metadatas") else [{}] * len(docs)
        ids = results["ids"][0] if results.get("ids") else [""] * len(docs)
        distances = results["distances"][0] if results.get("distances") else [0.0] * len(docs)

        for doc, meta, cid, dist in zip(docs, metas, ids, distances):
            retrieved_chunks.append({
                "chunk_id": cid,
                "text": doc,
                "metadata": meta,
                "distance": dist
            })

    return retrieved_chunks

def clear_vector_database():
    """Clears all records in the ChromaDB collection."""
    global _chroma_client, _collection
    client = get_chroma_client()
    try:
        client.delete_collection(name=config.CHROMA_COLLECTION_NAME)
    except Exception as e:
        logger.debug(f"Collection deletion notice: {e}")
    _collection = client.get_or_create_collection(name=config.CHROMA_COLLECTION_NAME)

def get_vector_db_stats() -> Dict[str, Any]:
    """Returns count and statistics of stored chunks."""
    try:
        collection = get_or_create_collection()
        return {
            "count": collection.count(),
            "collection_name": config.CHROMA_COLLECTION_NAME,
            "status": "ready"
        }
    except Exception as e:
        return {
            "count": 0,
            "collection_name": config.CHROMA_COLLECTION_NAME,
            "status": f"error: {e}"
        }
