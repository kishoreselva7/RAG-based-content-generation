import re
from typing import List, Dict, Any
import config

try:
    from langchain_text_splitters import RecursiveCharacterTextSplitter
except ImportError:
    try:
        from langchain.text_splitter import RecursiveCharacterTextSplitter
    except ImportError:
        # Fallback simple text splitter if langchain is missing
        class RecursiveCharacterTextSplitter:
            def __init__(self, chunk_size=700, chunk_overlap=150, separators=None):
                self.chunk_size = chunk_size
                self.chunk_overlap = chunk_overlap

            def create_documents(self, texts, metadatas=None):
                class Doc:
                    def __init__(self, page_content, metadata):
                        self.page_content = page_content
                        self.metadata = metadata or {}
                
                docs = []
                for text, meta in zip(texts, metadatas or [{}] * len(texts)):
                    chunks = self.split_text(text)
                    for c in chunks:
                        docs.append(Doc(c, meta))
                return docs

            def split_text(self, text):
                chunks = []
                start = 0
                while start < len(text):
                    end = start + self.chunk_size
                    chunk = text[start:end]
                    chunks.append(chunk)
                    start += (self.chunk_size - self.chunk_overlap)
                return chunks

def chunk_markdown_document(
    markdown_text: str,
    source_file: str = "syllabus.pdf",
    course_name: str = "General Course"
) -> List[Dict[str, Any]]:
    """
    Step 3: Chunk Document
    Uses RecursiveCharacterTextSplitter (chunk_size=700, chunk_overlap=150).
    Attaches metadata: {course, unit, topic, page, chunk_id, source_file}.
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=config.CHUNK_SIZE,
        chunk_overlap=config.CHUNK_OVERLAP,
        separators=["\n# ", "\n## ", "\n### ", "\n\n", "\n", " ", ""]
    )

    # Pre-parse sections to tag Unit and Topic metadata dynamically
    units_and_topics = _parse_units_and_topics(markdown_text)
    
    raw_chunks = splitter.create_documents([markdown_text])
    
    processed_chunks = []
    current_unit = "General Unit"
    current_topic = "General Syllabus"
    current_page = 1

    for idx, doc in enumerate(raw_chunks):
        content = doc.page_content.strip()
        if not content:
            continue

        # Check for page markers
        page_match = re.search(r'## Page (\d+)', content)
        if page_match:
            current_page = int(page_match.group(1))

        # Check for Unit markers
        unit_match = re.search(r'\b(Unit\s+[IVX\d]+|Module\s+\d+|Chapter\s+\d+)\b', content, re.IGNORECASE)
        if unit_match:
            current_unit = unit_match.group(1).upper()

        # Check for Headings as Topic
        heading_match = re.search(r'^#{1,3}\s+(.+)$', content, re.MULTILINE)
        if heading_match:
            candidate_topic = heading_match.group(1).strip()
            if not candidate_topic.lower().startswith("page"):
                # Avoid setting unit names as topics
                if not re.search(r'^(Unit|Module|Chapter)\s+', candidate_topic, re.IGNORECASE):
                    current_topic = candidate_topic

        chunk_data = {
            "chunk_id": f"chunk_{idx+1:04d}",
            "text": content,
            "metadata": {
                "course": course_name,
                "unit": current_unit,
                "topic": current_topic,
                "page": current_page,
                "chunk_id": f"chunk_{idx+1:04d}",
                "source_file": source_file
            }
        }
        processed_chunks.append(chunk_data)

    return processed_chunks

def _parse_units_and_topics(text: str) -> List[Dict[str, str]]:
    """Helper to detect unit and topic boundaries in markdown."""
    structures = []
    lines = text.split("\n")
    cur_unit = "Unit 1"
    for line in lines:
        if line.startswith("# ") or line.startswith("## "):
            clean_title = line.lstrip("#").strip()
            if "unit" in clean_title.lower() or "module" in clean_title.lower():
                cur_unit = clean_title
            structures.append({"unit": cur_unit, "topic": clean_title})
    return structures
