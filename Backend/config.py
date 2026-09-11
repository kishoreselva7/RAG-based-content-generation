import os
from pathlib import Path
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    def load_dotenv():
        pass



# Base Paths
BASE_DIR = Path(__file__).resolve().parent
DOCUMENTS_DIR = BASE_DIR / "documents"
UPLOADED_DIR = DOCUMENTS_DIR / "uploaded"
GENERATED_DIR = DOCUMENTS_DIR / "generated"

PPT_DIR = GENERATED_DIR / "ppt"
NOTES_DIR = GENERATED_DIR / "notes"
QUIZ_DIR = GENERATED_DIR / "quiz"
QUESTION_PAPERS_DIR = GENERATED_DIR / "question_papers"
FLASHCARDS_DIR = GENERATED_DIR / "flashcards"
STUDY_GUIDES_DIR = GENERATED_DIR / "study_guides"

DATABASE_DIR = BASE_DIR / "database"
VECTORDB_DIR = BASE_DIR / "vectordb"
ASSETS_DIR = BASE_DIR / "assets"
TEMPLATES_DIR = BASE_DIR / "templates"

# Ensure all directories exist
for directory in [
    DOCUMENTS_DIR, UPLOADED_DIR, GENERATED_DIR, PPT_DIR, NOTES_DIR,
    QUIZ_DIR, QUESTION_PAPERS_DIR, FLASHCARDS_DIR, STUDY_GUIDES_DIR,
    DATABASE_DIR, VECTORDB_DIR, ASSETS_DIR, TEMPLATES_DIR
]:
    directory.mkdir(parents=True, exist_ok=True)

# API Keys & Services Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY", "")

# AI Models
GEMINI_MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
EMBEDDING_MODEL_NAME = os.getenv("EMBEDDING_MODEL", "nomic-embed-text")
LLM_MODEL_NAME = os.getenv("LLM_MODEL", "qwen3:8b")

# RAG & Chunking Parameters
CHUNK_SIZE = 700
CHUNK_OVERLAP = 150
TOP_K_RETRIEVAL = 5
CHROMA_COLLECTION_NAME = "course_documents"

# SQLite Database
SQLITE_DB_PATH = DATABASE_DIR / "edugen.db"
