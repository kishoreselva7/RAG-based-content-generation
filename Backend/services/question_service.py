import os
import re
import json
import logging
from pathlib import Path
from typing import Dict, Any, List
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

import config
from services.retrieval_service import retrieve_top_chunks
from services.generation_service import generate_llm_response

logger = logging.getLogger(__name__)

QUESTION_PAPER_PROMPT = """
You are an expert University Controller of Examinations.
Using ONLY the retrieved syllabus context below, generate a formal University End-Semester Examination Question Paper for: "{course_or_topic}".

Total Marks: 100
Duration: 3 Hours

Required Paper Pattern:
PART A (10 Short Answer Questions x 2 Marks = 20 Marks) - Test basic recall & concepts.
PART B (5 Long Answer Questions with Either/Or Choice x 10 Marks = 50 Marks) - Detailed explanation & evaluation.
PART C (2 Comprehensive Case Study / Application Questions x 15 Marks = 30 Marks) - Higher order analysis.

Return valid JSON with schema:
{{
  "university_name": "UNIVERSITY END SEMESTER EXAMINATION",
  "course_name": "{course_or_topic}",
  "total_marks": 100,
  "duration": "3 Hours",
  "part_a": [
    {{"num": 1, "question": "Question text...", "marks": 2}},
    {{"num": 2, "question": "Question text...", "marks": 2}},
    {{"num": 3, "question": "Question text...", "marks": 2}},
    {{"num": 4, "question": "Question text...", "marks": 2}},
    {{"num": 5, "question": "Question text...", "marks": 2}},
    {{"num": 6, "question": "Question text...", "marks": 2}},
    {{"num": 7, "question": "Question text...", "marks": 2}},
    {{"num": 8, "question": "Question text...", "marks": 2}},
    {{"num": 9, "question": "Question text...", "marks": 2}},
    {{"num": 10, "question": "Question text...", "marks": 2}}
  ],
  "part_b": [
    {{
      "num": 11,
      "option_a": "Detailed 10-mark Question A...",
      "option_b": "OR: Alternative 10-mark Question B...",
      "marks": 10
    }},
    {{
      "num": 12,
      "option_a": "Detailed 10-mark Question A...",
      "option_b": "OR: Alternative 10-mark Question B...",
      "marks": 10
    }},
    {{
      "num": 13,
      "option_a": "Detailed 10-mark Question A...",
      "option_b": "OR: Alternative 10-mark Question B...",
      "marks": 10
    }},
    {{
      "num": 14,
      "option_a": "Detailed 10-mark Question A...",
      "option_b": "OR: Alternative 10-mark Question B...",
      "marks": 10
    }},
    {{
      "num": 15,
      "option_a": "Detailed 10-mark Question A...",
      "option_b": "OR: Alternative 10-mark Question B...",
      "marks": 10
    }}
  ],
  "part_c": [
    {{"num": 16, "question": "Case study analysis / design problem 1...", "marks": 15}},
    {{"num": 17, "question": "Case study analysis / design problem 2...", "marks": 15}}
  ]
}}

Return ONLY raw valid JSON. Use ONLY syllabus context.
"""

def generate_question_paper(course_or_topic: str) -> Dict[str, Any]:
    """Feature 4: University Question Paper Generation (DOCX via python-docx)."""
    chunks, context = retrieve_top_chunks(course_or_topic, top_k=config.TOP_K_RETRIEVAL)
    prompt = QUESTION_PAPER_PROMPT.format(course_or_topic=course_or_topic)

    json_str = generate_llm_response(prompt=prompt, retrieved_context=context, json_mode=True)
    paper_data = _parse_paper_json(json_str, course_or_topic)

    course_slug = re.sub(r'[^a-zA-Z0-9_]', '_', course_or_topic.lower())[:40]
    filename = f"question_paper_{course_slug}.docx"
    file_path = config.QUESTION_PAPERS_DIR / filename

    _create_question_paper_docx(paper_data, str(file_path))

    return {
        "course_or_topic": course_or_topic,
        "paper_data": paper_data,
        "file_path": str(file_path),
        "filename": filename,
        "retrieved_chunks": len(chunks)
    }

def _parse_paper_json(json_str: str, course_or_topic: str) -> Dict[str, Any]:
    """Parses Question Paper JSON."""
    try:
        match = re.search(r'\{.*\}', json_str, re.DOTALL)
        if match:
            return json.loads(match.group(0))
        return json.loads(json_str)
    except Exception as e:
        logger.warning(f"Question Paper JSON parse error: {e}. Building structured paper data.")

    # Fallback university question paper
    part_a = [{"num": i, "question": f"Define and explain the significance of core syllabus term #{i} in {course_or_topic}.", "marks": 2} for i in range(1, 11)]
    part_b = [
        {
            "num": 10 + i,
            "option_a": f"(a) Explain in detail the theoretical architectural model and principles of topic area #{i}.",
            "option_b": f"(b) OR: Compare and contrast key components and operational workflows in topic area #{i}.",
            "marks": 10
        } for i in range(1, 6)
    ]
    part_c = [
        {"num": 16, "question": f"Design and analyze a comprehensive end-to-end framework applying principles of {course_or_topic} to a real-world enterprise problem.", "marks": 15},
        {"num": 17, "question": f"Critically evaluate performance bottlenecks, optimization strategies, and future enhancements for {course_or_topic}.", "marks": 15}
    ]

    return {
        "university_name": "UNIVERSITY EXAMINATIONS",
        "course_name": course_or_topic,
        "total_marks": 100,
        "duration": "3 Hours",
        "part_a": part_a,
        "part_b": part_b,
        "part_c": part_c
    }

def _create_question_paper_docx(paper_data: Dict[str, Any], output_path: str):
    """Creates a beautifully styled DOCX university question paper using python-docx."""
    doc = Document()
    
    # Page setup - 1 inch margins
    sections = doc.sections
    for s in sections:
        s.top_margin = Inches(1.0)
        s.bottom_margin = Inches(1.0)
        s.left_margin = Inches(1.0)
        s.right_margin = Inches(1.0)

    # University Header
    p_header = doc.add_paragraph()
    p_header.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_univ = p_header.add_run(paper_data.get("university_name", "UNIVERSITY END SEMESTER EXAMINATION").upper() + "\n")
    run_univ.bold = True
    run_univ.font.size = Pt(14)
    run_univ.font.name = 'Times New Roman'

    run_degree = p_header.add_run("DEGREE END-SEMESTER EXAMINATIONS - MODEL QUESTION PAPER\n")
    run_degree.font.size = Pt(11)
    run_degree.font.name = 'Times New Roman'

    run_course = p_header.add_run(f"SUBJECT: {paper_data.get('course_name', 'COURSE SYLLABUS').upper()}\n")
    run_course.bold = True
    run_course.font.size = Pt(12)
    run_course.font.name = 'Times New Roman'

    # Meta Table (Duration, Max Marks)
    p_meta = doc.add_paragraph()
    p_meta.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    run_meta = p_meta.add_run(f"Time: {paper_data.get('duration', '3 Hours')}                      Max. Marks: {paper_data.get('total_marks', 100)}\n")
    run_meta.bold = True
    run_meta.font.size = Pt(11)

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # Divider line
    p_div = doc.add_paragraph("=" * 65)
    p_div.alignment = WD_ALIGN_PARAGRAPH.CENTER

    # --- PART A ---
    p_parta_head = doc.add_paragraph()
    run_pa = p_parta_head.add_run("PART A — (10 × 2 = 20 Marks)\nAnswer ALL Questions")
    run_pa.bold = True
    run_pa.font.size = Pt(12)
    p_parta_head.alignment = WD_ALIGN_PARAGRAPH.CENTER

    table_a = doc.add_table(rows=1, cols=3)
    table_a.alignment = WD_TABLE_ALIGNMENT.CENTER
    table_a.autofit = False
    
    # Set headers
    hdr_cells = table_a.rows[0].cells
    hdr_cells[0].text = "Q.No"
    hdr_cells[1].text = "Question Description"
    hdr_cells[2].text = "Marks"
    hdr_cells[0].width = Inches(0.8)
    hdr_cells[1].width = Inches(5.2)
    hdr_cells[2].width = Inches(0.8)

    for q in paper_data.get("part_a", []):
        row_cells = table_a.add_row().cells
        row_cells[0].text = str(q.get("num", ""))
        row_cells[1].text = q.get("question", "")
        row_cells[2].text = f"[{q.get('marks', 2)}]"

    doc.add_paragraph("\n")

    # --- PART B ---
    p_partb_head = doc.add_paragraph()
    run_pb = p_partb_head.add_run("PART B — (5 × 10 = 50 Marks)\nAnswer ALL Questions (Either / Or Choice)")
    run_pb.bold = True
    run_pb.font.size = Pt(12)
    p_partb_head.alignment = WD_ALIGN_PARAGRAPH.CENTER

    for q in paper_data.get("part_b", []):
        p_q = doc.add_paragraph()
        p_q.paragraph_format.space_before = Pt(8)
        p_q.add_run(f"Q{q.get('num', '')}. (a) {q.get('option_a', '')} ").font.name = 'Times New Roman'
        p_q.add_run(f"[{q.get('marks', 10)}]\n").bold = True
        
        p_or = doc.add_paragraph("(OR)")
        p_or.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_or.runs[0].bold = True

        p_qb = doc.add_paragraph()
        p_qb.add_run(f"    (b) {q.get('option_b', '')} ").font.name = 'Times New Roman'
        p_qb.add_run(f"[{q.get('marks', 10)}]\n").bold = True

    doc.add_paragraph("\n")

    # --- PART C ---
    p_partc_head = doc.add_paragraph()
    run_pc = p_partc_head.add_run("PART C — (2 × 15 = 30 Marks)\nApplication / Comprehensive Case Study Questions")
    run_pc.bold = True
    run_pc.font.size = Pt(12)
    p_partc_head.alignment = WD_ALIGN_PARAGRAPH.CENTER

    for q in paper_data.get("part_c", []):
        p_qc = doc.add_paragraph()
        p_qc.paragraph_format.space_before = Pt(8)
        p_qc.add_run(f"Q{q.get('num', '')}. {q.get('question', '')} ").font.name = 'Times New Roman'
        p_qc.add_run(f"[{q.get('marks', 15)}]").bold = True

    doc.save(output_path)
