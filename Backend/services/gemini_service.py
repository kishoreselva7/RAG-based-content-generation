import os
import logging
from pathlib import Path
from typing import Dict, Any, Optional

import config

logger = logging.getLogger(__name__)

EXTRACTION_PROMPT = """
You are an expert OCR and document structure analyst.
Your task is to analyze the attached syllabus PDF document and extract ALL content into clean, structured Markdown.

Strict Rules:
1. Preserve all headings (# Unit 1, ## Topic Name, ### Subtopic).
2. Identify Course Name, Code, Units, Modules, Topics, and Subtopics explicitly.
3. Extract all tables into standard Markdown table format.
4. Preserve all bullet lists, numbered lists, and inline formatting.
5. If images or diagrams are present, provide a descriptive caption inside `[Image: Description]`.
6. DO NOT summarize, compress, or generate new content.
7. DO NOT generate Quiz, PPT, Notes, Question Papers, or Tutor answers.
8. Output ONLY the raw Markdown document without outer conversational commentary.
"""

def extract_markdown_from_pdf(pdf_path: str, api_key: Optional[str] = None) -> Dict[str, Any]:
    """
    Extracts structured Markdown from a PDF using Gemini 2.5 Flash API.
    Falls back gracefully to pdfplumber/PyPDF2 text extraction if Gemini is unavailable.
    """
    path = Path(pdf_path)
    if not path.exists():
        raise FileNotFoundError(f"PDF file not found at {pdf_path}")

    active_api_key = api_key or config.GEMINI_API_KEY
    extracted_md = ""
    method_used = "Gemini 2.5 Flash API"

    if active_api_key:
        try:
            # Try new google-genai SDK first, then google.generativeai SDK
            try:
                from google import genai
                from google.genai import types

                client = genai.Client(api_key=active_api_key)
                # Upload PDF file or pass bytes
                with open(pdf_path, "rb") as f:
                    pdf_bytes = f.read()

                response = client.models.generate_content(
                    model=config.GEMINI_MODEL_NAME,
                    contents=[
                        types.Part.from_bytes(
                            data=pdf_bytes,
                            mime_type="application/pdf"
                        ),
                        EXTRACTION_PROMPT
                    ]
                )
                extracted_md = response.text or ""
            except Exception as e1:
                logger.warning(f"google-genai SDK failed or not found: {e1}, attempting google.generativeai...")
                import google.generativeai as genai
                genai.configure(api_key=active_api_key)
                
                # Upload file via genai.upload_file or inline
                pdf_file = genai.upload_file(path=str(path))
                model = genai.GenerativeModel(config.GEMINI_MODEL_NAME)
                response = model.generate_content([pdf_file, EXTRACTION_PROMPT])
                extracted_md = response.text or ""
                
        except Exception as e:
            logger.error(f"Gemini API extraction error: {e}. Falling back to local PDF extractor.")
            extracted_md = _fallback_pdf_extraction(str(path))
            method_used = f"Local PDF Extractor (Gemini Fallback: {str(e)[:60]}...)"
    else:
        logger.info("No Gemini API key provided. Using local PDF text extractor fallback.")
        extracted_md = _fallback_pdf_extraction(str(path))
        method_used = "Local PDF Extractor (No Gemini API Key)"

    return {
        "markdown": extracted_md,
        "method": method_used,
        "filename": path.name,
        "status": "success"
    }

def _fallback_pdf_extraction(pdf_path: str) -> str:
    """Fallback local PDF extraction formatting into structured Markdown."""
    lines = []
    lines.append(f"# Syllabus Document: {Path(pdf_path).stem.replace('_', ' ').title()}\n")

    try:
        import pdfplumber
        with pdfplumber.open(pdf_path) as pdf:
            for idx, page in enumerate(pdf.pages):
                lines.append(f"\n## Page {idx + 1}\n")
                text = page.extract_text()
                if text:
                    lines.append(text)
                tables = page.extract_tables()
                for table in tables:
                    if table:
                        lines.append("\n| " + " | ".join([str(c or '').replace('\n', ' ') for c in table[0]]) + " |")
                        lines.append("| " + " | ".join(['---'] * len(table[0])) + " |")
                        for row in table[1:]:
                            lines.append("| " + " | ".join([str(c or '').replace('\n', ' ') for c in row]) + " |")
                        lines.append("\n")
    except Exception as e:
        logger.warning(f"pdfplumber extraction failed ({e}), trying PyPDF2...")
        try:
            import PyPDF2
            reader = PyPDF2.PdfReader(pdf_path)
            for idx, page in enumerate(reader.pages):
                lines.append(f"\n## Page {idx + 1}\n")
                text = page.extract_text()
                if text:
                    lines.append(text)
        except Exception as e2:
            lines.append(f"\nError reading PDF content: {e2}")

    return "\n".join(lines)
