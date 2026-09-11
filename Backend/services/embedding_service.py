import os
import requests
import numpy as np
import logging
from typing import List, Union
import config

logger = logging.getLogger(__name__)

import socket


def _is_ollama_online(host: str = None) -> bool:
    try:
        h = host or config.OLLAMA_HOST
        # parse port and host
        clean_host = h.replace("http://", "").replace("https://", "").split("/")[0]
        if ":" in clean_host:
            hostname, port = clean_host.split(":")
            port = int(port)
        else:
            hostname, port = clean_host, 11434
        with socket.create_connection((hostname, port), timeout=0.2):
            return True
    except Exception:
        return False


def get_embeddings(texts: Union[str, List[str]], model_name: str = None) -> List[List[float]]:
    """
    Step 4: Generate Embeddings using nomic-embed-text via Ollama.
    Returns embedding vector for single string or list of strings.
    """
    model = model_name or config.EMBEDDING_MODEL_NAME
    if isinstance(texts, str):
        input_list = [texts]
    else:
        input_list = texts

    embeddings = []

    if not _is_ollama_online(config.OLLAMA_HOST):
        logger.info("Ollama service offline/not reachable. Using deterministic hash vector generator.")
        return [_generate_fallback_embedding(t) for t in input_list]


    # Attempt direct REST call to Ollama http://localhost:11434/api/embeddings
    try:
        ollama_url = f"{config.OLLAMA_HOST.rstrip('/')}/api/embeddings"
        for t in input_list:
            resp = requests.post(ollama_url, json={"model": model, "prompt": t}, timeout=2)
            if resp.status_code == 200:
                data = resp.json()
                embeddings.append(data["embedding"])
            else:
                raise RuntimeError(f"Ollama API returned HTTP {resp.status_code}: {resp.text}")
        return embeddings
    except Exception as e2:
        logger.warning(f"Ollama embedding failed ({e2}). Using lightweight deterministic hash vector fallback for demonstration.")
        return [_generate_fallback_embedding(t) for t in input_list]

def _generate_fallback_embedding(text: str, dim: int = 768) -> List[float]:
    """
    Fallback deterministic feature vector (768-dim) for testing when Ollama is offline.
    Uses SHA-256 seed hashing to produce normalized float vectors.
    """
    import hashlib
    vec = np.zeros(dim, dtype=np.float32)
    words = text.lower().split()
    for w in words:
        h = int(hashlib.md5(w.encode('utf-8')).hexdigest(), 16)
        idx = h % dim
        val = ((h >> 8) % 100) / 100.0
        vec[idx] += val
    
    norm = np.linalg.norm(vec)
    if norm > 0:
        vec = vec / norm
    else:
        vec[0] = 1.0
    return vec.tolist()
