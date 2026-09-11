import os
import uuid
import shutil
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional, List

from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

import config
from services.gemini_service import extract_markdown_from_pdf
from services.pdf_service import clean_extracted_markdown
from services.chunk_service import chunk_markdown_document
from services.vectordb_service import store_chunks_in_vectordb, get_vector_db_stats, clear_vector_database
from services.notes_service import generate_lecture_notes
from services.ppt_service import generate_powerpoint
from services.quiz_service import generate_quiz
from services.question_service import generate_question_paper
from services.flashcard_service import generate_flashcards
from services.studyguide_service import generate_study_guide
from services.chat_service import answer_tutor_question
from services.youtube_service import search_lecture_videos

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("EduGenAI-API")

app = FastAPI(
    title="EduGen AI API Platform",
    description="Backend API for EduGen AI React Frontend",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- IN-MEMORY DATA STORE (For Demo/Hackathon purposes) ---
COURSES_DB = {}
UNITS_DB = {}
CONTENT_DB = {}

# Seed initial course to test
init_course_id = f"c_{int(datetime.now().timestamp())}"
COURSES_DB[init_course_id] = {
    "id": init_course_id,
    "title": "Computer Science Basics",
    "code": "CS-101",
    "subject": "CS",
    "department": "Engineering",
    "semester": "Fall 2026",
    "description": "Introduction to computer science.",
    "learningObjectives": ["Understand programming basics"],
    "workflowStatus": {
        "create": "completed",
        "knowledge": "pending",
        "builder": "pending",
        "review": "pending",
        "publish": "pending",
        "students": "pending",
        "analytics": "pending",
        "improve": "pending"
    },
    "overallProgress": 10,
    "studentsCount": 0,
    "contentCount": 0,
    "createdAt": datetime.now().isoformat(),
    "updatedAt": datetime.now().isoformat(),
}

# --- Pydantic Models ---
class CourseCreate(BaseModel):
    title: str
    code: Optional[str] = ""
    subject: Optional[str] = ""
    department: Optional[str] = ""
    semester: Optional[str] = ""
    description: Optional[str] = ""
    learningObjectives: Optional[List[str]] = []

class WorkflowStatusUpdate(BaseModel):
    workflowStatus: Dict[str, str]

class GenerateContentRequest(BaseModel):
    courseId: str
    unitId: Optional[str] = None
    topicId: Optional[str] = None
    contentType: str # 'lecture_notes', 'ppt', 'quiz', 'question_bank', 'flashcards', 'study_material', 'assignment'
    difficulty: Optional[str] = "medium"

class UpdateContentRequest(BaseModel):
    status: Optional[str] = None
    contentBody: Optional[str] = None

class PublishRequest(BaseModel):
    selectedContentIds: List[str]

# --- COURSES API ---

@app.get("/api/courses")
def get_courses():
    return list(COURSES_DB.values())

@app.post("/api/courses")
def create_course(req: CourseCreate):
    course_id = f"c_{int(datetime.now().timestamp())}"
    new_course = {
        "id": course_id,
        "title": req.title,
        "code": req.code,
        "subject": req.subject,
        "department": req.department,
        "semester": req.semester,
        "description": req.description,
        "learningObjectives": req.learningObjectives,
        "workflowStatus": {
            "create": "completed",
            "knowledge": "pending",
            "builder": "pending",
            "review": "pending",
            "publish": "pending",
            "students": "pending",
            "analytics": "pending",
            "improve": "pending"
        },
        "overallProgress": 15,
        "studentsCount": 0,
        "contentCount": 0,
        "createdAt": datetime.now().isoformat(),
        "updatedAt": datetime.now().isoformat(),
    }
    COURSES_DB[course_id] = new_course
    return new_course

@app.get("/api/courses/{courseId}")
def get_course(courseId: str):
    if courseId not in COURSES_DB:
        raise HTTPException(status_code=404, detail="Course not found")
    return COURSES_DB[courseId]

@app.patch("/api/courses/{courseId}/workflow")
def update_course_workflow(courseId: str, req: WorkflowStatusUpdate):
    if courseId not in COURSES_DB:
        raise HTTPException(status_code=404, detail="Course not found")
    COURSES_DB[courseId]["workflowStatus"].update(req.workflowStatus)
    COURSES_DB[courseId]["updatedAt"] = datetime.now().isoformat()
    return COURSES_DB[courseId]

# --- KNOWLEDGE BASE / SYLLABUS UPLOAD ---
@app.post("/api/courses/{courseId}/upload-syllabus")
async def upload_syllabus(
    courseId: str,
    file: UploadFile = File(...),
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
        
    course = COURSES_DB.get(courseId, {})
    course_name = course.get("title", "General Course")

    file_path = config.UPLOADED_DIR / file.filename
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        # Step 1: Gemini 2.5 Flash Extraction
        extract_res = extract_markdown_from_pdf(str(file_path), api_key=config.GEMINI_API_KEY)
        raw_markdown = extract_res["markdown"]

        # Step 2: Clean Markdown
        cleaned_markdown = clean_extracted_markdown(raw_markdown)

        # Step 3: Chunking
        chunks = chunk_markdown_document(
            markdown_text=cleaned_markdown,
            source_file=file.filename,
            course_name=course_name
        )

        # Step 4 & 5: Clear previous vectors & Store new embeddings in ChromaDB
        clear_vector_database()
        stored_count = store_chunks_in_vectordb(chunks)
        
        if courseId in COURSES_DB:
             COURSES_DB[courseId]["workflowStatus"]["knowledge"] = "completed"

        return {
            "status": "success",
            "filename": file.filename,
            "extraction_method": extract_res["method"],
            "total_chunks": len(chunks),
            "stored_count": stored_count,
            "markdown_preview": cleaned_markdown[:500] + "..."
        }
    except Exception as e:
        logger.error(f"Syllabus upload error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

# --- CONTENT API ---

@app.get("/api/courses/{courseId}/units")
def get_units(courseId: str):
    # For now, return mock units if none exist
    return [
        {"id": "u1", "courseId": courseId, "title": "Unit 1: Introduction", "order": 1, "topics": [{"id": "t1", "title": "Overview"}]},
        {"id": "u2", "courseId": courseId, "title": "Unit 2: Core Concepts", "order": 2, "topics": [{"id": "t2", "title": "Fundamentals"}]}
    ]

@app.get("/api/courses/{courseId}/content")
def get_course_contents(courseId: str):
    return [c for c in CONTENT_DB.values() if c["courseId"] == courseId]

@app.get("/api/content/{contentId}")
def get_content_by_id(contentId: str):
    if contentId not in CONTENT_DB:
        raise HTTPException(status_code=404, detail="Content not found")
    return CONTENT_DB[contentId]

@app.post("/api/courses/{courseId}/generate")
def generate_ai_content(courseId: str, req: GenerateContentRequest):
    course = COURSES_DB.get(courseId, {})
    course_name = course.get("title", "General Course")
    topic = f"{course_name} Basics" # Simplified for demo
    
    # Map contentType to service function
    try:
        content_body = ""
        file_path = ""
        
        if req.contentType == "lecture_notes":
            res = generate_lecture_notes(topic=topic)
            content_body = res.get("content", "")
            file_path = res.get("file_path", "")
        elif req.contentType == "ppt":
            res = generate_powerpoint(topic=topic)
            content_body = str(res.get("ppt_data", {}))
            file_path = res.get("file_path", "")
        elif req.contentType == "quiz":
            res = generate_quiz(topic=topic)
            content_body = str(res.get("quiz_data", {}))
            file_path = res.get("file_path", "")
        elif req.contentType == "question_bank":
            res = generate_question_paper(course_or_topic=topic)
            content_body = str(res.get("paper_data", {}))
            file_path = res.get("file_path", "")
        elif req.contentType == "flashcards":
            res = generate_flashcards(topic=topic)
            content_body = str(res.get("flashcard_data", {}))
            file_path = res.get("file_path", "")
        elif req.contentType == "study_material":
            res = generate_study_guide(topic=topic)
            content_body = res.get("content", "")
            file_path = res.get("file_path", "")
        else:
            content_body = f"AI Generated {req.contentType} for {topic}"
            file_path = ""

        content_id = f"cnt_{int(datetime.now().timestamp())}"
        new_content = {
            "id": content_id,
            "courseId": courseId,
            "unitId": req.unitId,
            "topicId": req.topicId,
            "title": f"{req.contentType.replace('_', ' ').title()} - {topic}",
            "type": req.contentType,
            "difficulty": req.difficulty,
            "status": "needs_review",
            "contentBody": content_body,
            "filePath": str(file_path),
            "createdAt": datetime.now().isoformat(),
            "updatedAt": datetime.now().isoformat()
        }
        
        CONTENT_DB[content_id] = new_content
        return new_content

    except Exception as e:
        logger.error(f"Generation error: {e}")
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")

@app.patch("/api/content/{contentId}")
def update_content(contentId: str, req: UpdateContentRequest):
    if contentId not in CONTENT_DB:
        raise HTTPException(status_code=404, detail="Content not found")
    
    if req.status:
        CONTENT_DB[contentId]["status"] = req.status
    if req.contentBody:
        CONTENT_DB[contentId]["contentBody"] = req.contentBody
        
    CONTENT_DB[contentId]["updatedAt"] = datetime.now().isoformat()
    return CONTENT_DB[contentId]

@app.post("/api/courses/{courseId}/publish")
def publish_content(courseId: str, req: PublishRequest):
    published_count = 0
    for cid in req.selectedContentIds:
        if cid in CONTENT_DB:
            CONTENT_DB[cid]["status"] = "published"
            published_count += 1
            
    if courseId in COURSES_DB:
        COURSES_DB[courseId]["workflowStatus"]["publish"] = "completed"
        
    return {"success": True, "publishedCount": published_count}
