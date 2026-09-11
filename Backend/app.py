import os
import json
import logging
from pathlib import Path

import streamlit as st
import pandas as pd

# Import Configuration and Services
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

# Streamlit Page Configuration
st.set_page_config(
    page_title="EduGen AI – Teacher Workflow",
    page_icon="🎓",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Load Custom CSS
css_path = config.ASSETS_DIR / "style.css"
if css_path.exists():
    with open(css_path, "r", encoding="utf-8") as f:
        st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)

# Session State Initialization
if "current_step" not in st.session_state:
    st.session_state.current_step = 1
if "course_details" not in st.session_state:
    st.session_state.course_details = {
        "name": "Computer Science & AI", 
        "subject": "", 
        "semester": "Fall 2026", 
        "department": "", 
        "description": "",
        "objectives": ""
    }
if "syllabus_loaded" not in st.session_state:
    st.session_state.syllabus_loaded = False
if "processing_complete" not in st.session_state:
    st.session_state.processing_complete = False

# Navigation Steps
STEPS = [
    "1. Teacher Dashboard",
    "2. Create Course",
    "3. Upload Syllabus",
    "4. Document Processing",
    "5. Knowledge Base",
    "6. AI Course Builder",
    "7. Content Review",
    "8. Publish Course",
    "9. Student Management",
    "10. Student Performance",
    "11. AI Analytics"
]

def go_next():
    if st.session_state.current_step < len(STEPS):
        st.session_state.current_step += 1

def go_prev():
    if st.session_state.current_step > 1:
        st.session_state.current_step -= 1

def set_step(step_idx):
    st.session_state.current_step = step_idx

# --- SIDEBAR ---
with st.sidebar:
    st.markdown("### 🎓 EduGen AI")
    st.markdown("*Teacher Workflow Dashboard*")
    st.divider()
    
    st.markdown("#### Workflow Navigation")
    for i, step_name in enumerate(STEPS, 1):
        if i == st.session_state.current_step:
            st.markdown(f"**➡️ {step_name}**")
        else:
            if st.button(step_name, key=f"nav_{i}", help="Jump to this step"):
                set_step(i)
                st.rerun()
                
    st.divider()
    st.markdown("#### ⚙️ Service Configuration")
    gemini_key_input = st.text_input(
        "Gemini API Key",
        value=config.GEMINI_API_KEY,
        type="password"
    )
    if gemini_key_input:
        config.GEMINI_API_KEY = gemini_key_input

    ollama_host_input = st.text_input(
        "Ollama Host",
        value=config.OLLAMA_HOST
    )
    if ollama_host_input:
        config.OLLAMA_HOST = ollama_host_input

# --- MAIN CONTENT ---
st.markdown(f"## {STEPS[st.session_state.current_step - 1]}")
st.divider()

# STEP 1: Teacher Dashboard
if st.session_state.current_step == 1:
    st.markdown("#### Overview")
    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Total Courses", "5")
    c2.metric("Total Students", "124")
    c3.metric("Generated Content", "42 items")
    c4.metric("Active Courses", "3")
    
    st.markdown("### Recent Activity")
    st.info("🕒 Generated Quiz for 'Data Structures'")
    st.info("🕒 Published 'Machine Learning Basics' course")
    st.info("🕒 Processed Syllabus for 'Operating Systems'")
    
    st.markdown("<br><br>", unsafe_allow_html=True)
    c1, c2, c3 = st.columns([1, 2, 1])
    c2.button("🚀 Start New Course Creation", on_click=go_next, type="primary", use_container_width=True)

# STEP 2: Create Course
elif st.session_state.current_step == 2:
    with st.form("course_creation_form"):
        st.session_state.course_details["name"] = st.text_input("Course Name", value=st.session_state.course_details["name"])
        st.session_state.course_details["description"] = st.text_area("Description", value=st.session_state.course_details["description"])
        
        c1, c2 = st.columns(2)
        with c1:
            st.session_state.course_details["subject"] = st.text_input("Subject", value=st.session_state.course_details["subject"])
            st.session_state.course_details["department"] = st.text_input("Department", value=st.session_state.course_details["department"])
        with c2:
            st.session_state.course_details["semester"] = st.selectbox("Semester", ["Fall 2026", "Spring 2027", "Summer 2027"])
            
        st.session_state.course_details["objectives"] = st.text_area("Learning Objectives", value=st.session_state.course_details["objectives"])
        
        submitted = st.form_submit_button("Save Course Details")
        if submitted:
            st.success("Course details saved successfully!")
            
    st.markdown("<br>", unsafe_allow_html=True)
    c1, c2 = st.columns(2)
    c1.button("⬅️ Previous", on_click=go_prev)
    c2.button("Next: Upload Syllabus ➡️", on_click=go_next, type="primary")

# STEP 3: Upload Syllabus
elif st.session_state.current_step == 3:
    st.markdown("Upload a PDF syllabus to extract the course structure and topics.")
    uploaded_file = st.file_uploader("Upload Course Syllabus PDF", type=["pdf"])
    
    if uploaded_file is not None:
        save_path = config.UPLOADED_DIR / uploaded_file.name
        with open(save_path, "wb") as f:
            f.write(uploaded_file.getbuffer())
        st.success(f"Successfully uploaded: {uploaded_file.name}")
        st.session_state.uploaded_file_path = save_path
        st.session_state.uploaded_file_name = uploaded_file.name
        
    st.markdown("<br>", unsafe_allow_html=True)
    c1, c2 = st.columns(2)
    c1.button("⬅️ Previous", on_click=go_prev)
    c2.button("Next: Process Document ➡️", on_click=go_next, type="primary")

# STEP 4: Document Processing
elif st.session_state.current_step == 4:
    if "uploaded_file_path" in st.session_state:
        st.info(f"Ready to process: **{st.session_state.uploaded_file_name}**")
        
        if st.button("🚀 Start AI Processing", type="primary", use_container_width=True):
            try:
                with st.spinner("Step 1: Extracting text using Gemini 2.5 Flash..."):
                    res = extract_markdown_from_pdf(str(st.session_state.uploaded_file_path), api_key=config.GEMINI_API_KEY)
                    raw_md = res["markdown"]
                    st.success("✅ Text Extracted!")
                    
                with st.spinner("Step 2: Cleaning & chunking document..."):
                    cleaned_md = clean_extracted_markdown(raw_md)
                    st.session_state.extracted_markdown = cleaned_md
                    chunks = chunk_markdown_document(
                        markdown_text=cleaned_md,
                        source_file=st.session_state.uploaded_file_name,
                        course_name=st.session_state.course_details["name"]
                    )
                    st.success("✅ Document Chunked!")
                    
                with st.spinner("Step 3: Generating embeddings & storing in vector database..."):
                    clear_vector_database()
                    stored_cnt = store_chunks_in_vectordb(chunks)
                    st.success(f"✅ Indexed {stored_cnt} syllabus chunks into ChromaDB!")
                
                st.session_state.syllabus_loaded = True
                st.session_state.processing_complete = True
                st.balloons()
            except Exception as e:
                st.error(f"Error processing syllabus: {e}")
    else:
        st.warning("Please go back and upload a syllabus PDF first.")
        
    st.markdown("<br>", unsafe_allow_html=True)
    c1, c2 = st.columns(2)
    c1.button("⬅️ Previous", on_click=go_prev)
    c2.button("Next: Knowledge Base ➡️", on_click=go_next, type="primary", disabled=not st.session_state.processing_complete)

# STEP 5: Knowledge Base
elif st.session_state.current_step == 5:
    st.markdown("### Processed Knowledge Repository")
    db_stats = get_vector_db_stats()
    
    st.metric("Indexed Vector Chunks", db_stats.get("count", 0))
    st.metric("Course Name Context", st.session_state.course_details["name"])
    
    with st.expander("Preview Extracted Syllabus Markdown", expanded=True):
        st.markdown(st.session_state.get("extracted_markdown", "*No syllabus content available. Process a document in Step 4.*"))
        
    st.markdown("<br>", unsafe_allow_html=True)
    c1, c2 = st.columns(2)
    c1.button("⬅️ Previous", on_click=go_prev)
    c2.button("Next: AI Course Builder ➡️", on_click=go_next, type="primary")

# STEP 6: AI Course Builder
elif st.session_state.current_step == 6:
    st.markdown("### Generate Educational Content")
    st.caption("Leverage RAG and AI to generate tailored content based on your syllabus.")
    
    content_type = st.selectbox(
        "Select Content Type to Generate", 
        ["Lecture Notes", "PowerPoint Presentation", "MCQ Quiz", "Question Paper", "Flashcards", "Study Guide"]
    )
    topic = st.text_input("Enter Specific Topic or Unit", value=f"{st.session_state.course_details['name']} Overview")
    
    if st.button(f"✨ Generate {content_type}", type="primary"):
        with st.spinner(f"Generating {content_type} for '{topic}' using RAG context..."):
            try:
                if content_type == "Lecture Notes":
                    res = generate_lecture_notes(topic=topic)
                    st.session_state["review_notes"] = res
                elif content_type == "PowerPoint Presentation":
                    res = generate_powerpoint(topic=topic)
                    st.session_state["review_ppt"] = res
                elif content_type == "MCQ Quiz":
                    res = generate_quiz(topic=topic)
                    st.session_state["review_quiz"] = res
                elif content_type == "Question Paper":
                    res = generate_question_paper(course_or_topic=topic)
                    st.session_state["review_paper"] = res
                elif content_type == "Flashcards":
                    res = generate_flashcards(topic=topic)
                    st.session_state["review_cards"] = res
                elif content_type == "Study Guide":
                    res = generate_study_guide(topic=topic)
                    st.session_state["review_guide"] = res
                
                st.success(f"✅ {content_type} generated successfully! Proceed to 'Content Review' to view and edit.")
            except Exception as e:
                st.error(f"Failed to generate content: {e}")
            
    st.markdown("<br>", unsafe_allow_html=True)
    c1, c2 = st.columns(2)
    c1.button("⬅️ Previous", on_click=go_prev)
    c2.button("Next: Content Review ➡️", on_click=go_next, type="primary")

# STEP 7: Content Review
elif st.session_state.current_step == 7:
    st.markdown("### Review & Edit Generated Content")
    
    tabs = st.tabs(["Lecture Notes", "PowerPoint", "Quiz", "Question Paper", "Flashcards", "Study Guide"])
    
    with tabs[0]:
        if "review_notes" in st.session_state:
            res = st.session_state["review_notes"]
            st.markdown(res.get("content", ""))
            with open(res["file_path"], "rb") as f:
                st.download_button("📥 Download (.md)", f.read(), res["filename"], "text/markdown")
        else:
            st.info("No Lecture Notes generated yet.")
            
    with tabs[1]:
        if "review_ppt" in st.session_state:
            res = st.session_state["review_ppt"]
            st.json(res.get("ppt_data", {}))
            with open(res["file_path"], "rb") as f:
                st.download_button("📥 Download (.pptx)", f.read(), res["filename"], "application/vnd.openxmlformats-officedocument.presentationml.presentation")
        else:
            st.info("No PowerPoint generated yet.")
            
    with tabs[2]:
        if "review_quiz" in st.session_state:
            res = st.session_state["review_quiz"]
            for q in res.get("quiz_data", {}).get("questions", []):
                st.markdown(f"**Q: {q.get('question')}**")
                for opt in q.get("options", []):
                    st.markdown(f"- {opt}")
                st.success(f"Answer: {q.get('correct_answer')}")
            with open(res["file_path"], "rb") as f:
                st.download_button("📥 Download (.json)", f.read(), res["filename"], "application/json")
        else:
            st.info("No Quiz generated yet.")
            
    with tabs[3]:
        if "review_paper" in st.session_state:
            res = st.session_state["review_paper"]
            st.json(res.get("paper_data", {}))
            with open(res["file_path"], "rb") as f:
                st.download_button("📥 Download (.docx)", f.read(), res["filename"], "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
        else:
            st.info("No Question Paper generated yet.")
            
    with tabs[4]:
        if "review_cards" in st.session_state:
            res = st.session_state["review_cards"]
            for card in res.get("flashcard_data", {}).get("flashcards", []):
                with st.expander(f"Front: {card.get('front', '')}"):
                    st.markdown(f"**Back:** {card.get('back', '')}")
            with open(res["file_path"], "rb") as f:
                st.download_button("📥 Download (.json)", f.read(), res["filename"], "application/json")
        else:
            st.info("No Flashcards generated yet.")
            
    with tabs[5]:
        if "review_guide" in st.session_state:
            res = st.session_state["review_guide"]
            st.markdown(res.get("content", ""))
            with open(res["file_path"], "rb") as f:
                st.download_button("📥 Download (.md)", f.read(), res["filename"], "text/markdown")
        else:
            st.info("No Study Guide generated yet.")
            
    st.markdown("<br>", unsafe_allow_html=True)
    c1, c2 = st.columns(2)
    c1.button("⬅️ Previous", on_click=go_prev)
    c2.button("Next: Publish Course ➡️", on_click=go_next, type="primary")

# STEP 8: Publish Course
elif st.session_state.current_step == 8:
    st.markdown("### Availability Settings")
    st.checkbox("Make Syllabus available to students", value=True)
    st.checkbox("Publish Lecture Notes", value=True)
    st.checkbox("Publish Quizzes", value=False)
    st.checkbox("Notify Enrolled Students", value=True)
    
    if st.button("🚀 Publish Course", type="primary"):
        st.success(f"🎉 Course '{st.session_state.course_details['name']}' Published Successfully!")
        st.balloons()
        
    st.markdown("<br>", unsafe_allow_html=True)
    c1, c2 = st.columns(2)
    c1.button("⬅️ Previous", on_click=go_prev)
    c2.button("Next: Student Management ➡️", on_click=go_next)

# STEP 9: Student Management
elif st.session_state.current_step == 9:
    st.markdown("### Enrolled Students")
    mock_students = pd.DataFrame({
        "Student ID": ["S101", "S102", "S103", "S104"],
        "Name": ["Alice Johnson", "Bob Smith", "Charlie Davis", "Diana Evans"],
        "Group": ["Group A", "Group A", "Group B", "Group B"],
        "Status": ["Active", "Active", "Inactive", "Active"]
    })
    st.dataframe(mock_students, use_container_width=True)
    
    st.button("➕ Add New Student")
    
    st.markdown("<br>", unsafe_allow_html=True)
    c1, c2 = st.columns(2)
    c1.button("⬅️ Previous", on_click=go_prev)
    c2.button("Next: Student Performance ➡️", on_click=go_next, type="primary")

# STEP 10: Student Performance
elif st.session_state.current_step == 10:
    st.markdown("### Performance Overview")
    c1, c2, c3 = st.columns(3)
    c1.metric("Average Quiz Score", "78%", "2.1%")
    c2.metric("Course Completion", "45%", "5%")
    c3.metric("Active Learners", "3/4", "-1")
    
    st.markdown("#### Recent Quiz Scores")
    mock_scores = pd.DataFrame({
        "Student": ["Alice", "Bob", "Diana"],
        "Quiz 1": [85, 90, 70],
        "Quiz 2": [88, 75, 65]
    })
    st.bar_chart(mock_scores.set_index("Student"))
    
    st.markdown("<br>", unsafe_allow_html=True)
    c1, c2 = st.columns(2)
    c1.button("⬅️ Previous", on_click=go_prev)
    c2.button("Next: AI Analytics ➡️", on_click=go_next, type="primary")

# STEP 11: AI Analytics
elif st.session_state.current_step == 11:
    st.markdown("### AI Insights & Recommendations")
    
    st.warning("⚠️ **Weak Topic Identified:** Data Structures and Algorithms")
    st.markdown("Based on recent quiz performance, 60% of students struggled with questions related to sorting algorithms.")
    
    if st.button("✨ Generate Remedial Flashcards for 'Sorting Algorithms'", type="primary"):
        with st.spinner("Generating remedial content..."):
            try:
                res = generate_flashcards(topic="Sorting Algorithms")
                st.session_state["review_cards"] = res
                st.success("Remedial Flashcards generated and assigned to struggling students!")
            except Exception as e:
                st.error("RAG Context or model error (no syllabus uploaded for this topic?). Details: " + str(e))
        
    st.info("💡 **Recommendation:** Schedule a revision session for next week and emphasize Big-O notation.")
    
    st.markdown("<br>", unsafe_allow_html=True)
    c1, c2 = st.columns(2)
    c1.button("⬅️ Previous", on_click=go_prev)
    c2.button("Finish Workflow ✅", on_click=lambda: set_step(1))
