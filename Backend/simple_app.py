import os
import json
import logging
from pathlib import Path

import streamlit as st

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

# Streamlit Page Configuration
st.set_page_config(
    page_title="EduGen AI – Simple App",
    page_icon="🎓",
    layout="wide",
)

# Load Custom CSS
css_path = config.ASSETS_DIR / "style.css"
if css_path.exists():
    with open(css_path, "r", encoding="utf-8") as f:
        st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)

# Session State Initialization
if "syllabus_loaded" not in st.session_state:
    st.session_state.syllabus_loaded = False
if "processing_complete" not in st.session_state:
    st.session_state.processing_complete = False

# Sidebar Configuration
with st.sidebar:
    st.markdown("### 🎓 EduGen AI")
    st.markdown("*Simple Content Generator*")
    st.divider()
    
    st.markdown("#### ⚙️ Settings")
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

# Main App Tabs
st.title("🎓 EduGen AI: Course Content Generator")
tab1, tab2 = st.tabs(["📄 1. Upload & Process Syllabus", "✨ 2. Generate Content"])

# --- TAB 1: UPLOAD & PROCESS SYLLABUS ---
with tab1:
    st.header("Upload Syllabus")
    st.write("Upload a PDF syllabus to extract the course structure and topics.")
    
    uploaded_file = st.file_uploader("Upload Course Syllabus PDF", type=["pdf"])
    
    if uploaded_file is not None:
        save_path = config.UPLOADED_DIR / uploaded_file.name
        with open(save_path, "wb") as f:
            f.write(uploaded_file.getbuffer())
        
        st.success(f"Successfully uploaded: {uploaded_file.name}")
        st.session_state.uploaded_file_path = save_path
        st.session_state.uploaded_file_name = uploaded_file.name
        
        if st.button("🚀 Process Syllabus", type="primary"):
            try:
                with st.spinner("Step 1: Extracting text using Gemini..."):
                    res = extract_markdown_from_pdf(str(st.session_state.uploaded_file_path), api_key=config.GEMINI_API_KEY)
                    raw_md = res["markdown"]
                
                with st.spinner("Step 2: Cleaning & chunking document..."):
                    cleaned_md = clean_extracted_markdown(raw_md)
                    st.session_state.extracted_markdown = cleaned_md
                    chunks = chunk_markdown_document(
                        markdown_text=cleaned_md,
                        source_file=st.session_state.uploaded_file_name,
                        course_name="General Course"
                    )
                    
                    # Extract Unit/Topic hierarchy
                    unit_topics = {}
                    for c in chunks:
                        u = c["metadata"].get("unit", "General Unit")
                        t = c["metadata"].get("topic", "General Topic")
                        if u not in unit_topics:
                            unit_topics[u] = set()
                        if t and t != "General Syllabus" and not t.lower().startswith("page"):
                            unit_topics[u].add(t)
                    st.session_state.unit_topics = {u: sorted(list(ts)) for u, ts in unit_topics.items()}
                
                with st.spinner("Step 3: Storing in vector database..."):
                    clear_vector_database()
                    stored_cnt = store_chunks_in_vectordb(chunks)
                
                st.session_state.syllabus_loaded = True
                st.session_state.processing_complete = True
                st.success(f"✅ Indexed {stored_cnt} syllabus chunks successfully! You can now switch to the 'Generate Content' tab.")
            except Exception as e:
                st.error(f"Error processing syllabus: {e}")

# --- TAB 2: GENERATE CONTENT ---
with tab2:
    st.header("Generate Content")
    
    if not st.session_state.processing_complete:
        st.warning("⚠️ Please upload and process a syllabus in Tab 1 first.")
    else:
        st.write("Leverage AI to generate tailored content based on your syllabus.")
        
        content_type = st.selectbox(
            "Content Type", 
            ["Lecture Notes", "PowerPoint Presentation", "MCQ Quiz", "Question Paper", "Flashcards", "Study Guide"]
        )

        unit_topics = st.session_state.get("unit_topics", {})
        
        selected_unit = "General Unit"
        selected_topic = "Overview"
        generate_single = False
        generate_all = False
        topics_in_unit = []
        
        if unit_topics:
            selected_unit = st.selectbox("Select Unit", list(unit_topics.keys()))
            topics_in_unit = unit_topics[selected_unit]
            
            if topics_in_unit:
                selected_topic = st.selectbox("Select Topic", topics_in_unit)
                
                c1, c2 = st.columns(2)
                with c1:
                    generate_single = st.button(f"✨ Generate for Topic: {selected_topic}", type="primary")
                with c2:
                    generate_all = st.button(f"📚 Bulk Generate for ALL {len(topics_in_unit)} Topics in {selected_unit}")
            else:
                st.warning("No specific topics found in this unit. You can manually enter one.")
                selected_topic = st.text_input("Enter Topic", value="Overview")
                generate_single = st.button(f"✨ Generate for Topic: {selected_topic}", type="primary")
        else:
            selected_topic = st.text_input("Enter Topic (e.g., 'Introduction')", value="Overview")
            generate_single = st.button(f"✨ Generate {content_type}", type="primary")

        def generate_content_for_topic(t: str):
            res = None
            if content_type == "Lecture Notes":
                res = generate_lecture_notes(topic=t)
            elif content_type == "PowerPoint Presentation":
                res = generate_powerpoint(topic=t)
            elif content_type == "MCQ Quiz":
                res = generate_quiz(topic=t)
            elif content_type == "Question Paper":
                res = generate_question_paper(course_or_topic=t)
            elif content_type == "Flashcards":
                res = generate_flashcards(topic=t)
            elif content_type == "Study Guide":
                res = generate_study_guide(topic=t)
            return res
            
        if generate_single:
            with st.spinner(f"Generating {content_type} for '{selected_topic}'..."):
                try:
                    res = generate_content_for_topic(selected_topic)
                    st.session_state["last_generated"] = {
                        "type": content_type,
                        "res": res,
                        "bulk": False
                    }
                    st.success(f"✅ {content_type} generated successfully for {selected_topic}!")
                except Exception as e:
                    st.error(f"Failed to generate content: {e}")

        if generate_all:
            with st.spinner(f"Bulk Generating {content_type} for all topics in {selected_unit}..."):
                try:
                    bulk_results = []
                    for t in topics_in_unit:
                        res = generate_content_for_topic(t)
                        bulk_results.append(res)
                    
                    st.session_state["last_generated"] = {
                        "type": content_type,
                        "res": bulk_results,
                        "bulk": True
                    }
                    st.success(f"✅ Successfully generated {content_type} for {len(topics_in_unit)} topics!")
                except Exception as e:
                    st.error(f"Failed during bulk generation: {e}")
                    
        # Display generated content if available
        if "last_generated" in st.session_state:
            st.divider()
            last_gen = st.session_state["last_generated"]
            ctype = last_gen["type"]
            is_bulk = last_gen.get("bulk", False)
            
            if not is_bulk:
                res = last_gen["res"]
                st.subheader(f"Preview: {ctype}")
                
                # Download button
                with open(res["file_path"], "rb") as f:
                    file_bytes = f.read()
                    
                    mime_type = "text/plain"
                    if res["file_path"].endswith(".md"): mime_type = "text/markdown"
                    elif res["file_path"].endswith(".json"): mime_type = "application/json"
                    elif res["file_path"].endswith(".pptx"): mime_type = "application/vnd.openxmlformats-officedocument.presentationml.presentation"
                    elif res["file_path"].endswith(".docx"): mime_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

                    st.download_button(
                        label=f"📥 Download {res['filename']}", 
                        data=file_bytes, 
                        file_name=res["filename"], 
                        mime=mime_type,
                        type="primary",
                        key="dl_single"
                    )
                
                st.markdown("<br>", unsafe_allow_html=True)
                
                # Previews
                if ctype in ["Lecture Notes", "Study Guide"]:
                    st.markdown(res.get("content", ""))
                elif ctype == "PowerPoint Presentation":
                    st.json(res.get("ppt_data", {}))
                elif ctype == "Question Paper":
                    st.json(res.get("paper_data", {}))
                elif ctype == "MCQ Quiz":
                    for q in res.get("quiz_data", {}).get("questions", []):
                        st.markdown(f"**Q: {q.get('question')}**")
                        for opt in q.get("options", []):
                            st.markdown(f"- {opt}")
                        st.info(f"Answer: {q.get('correct_answer')}")
                elif ctype == "Flashcards":
                    for card in res.get("flashcard_data", {}).get("flashcards", []):
                        with st.expander(f"Front: {card.get('front', '')}"):
                            st.markdown(f"**Back:** {card.get('back', '')}")
            
            else: # is_bulk == True
                bulk_results = last_gen["res"]
                st.subheader(f"Bulk Generation Complete: {len(bulk_results)} files created")
                
                for idx, res in enumerate(bulk_results):
                    with st.expander(f"{res['topic']} - {res['filename']}"):
                        # Download button
                        with open(res["file_path"], "rb") as f:
                            file_bytes = f.read()
                            st.download_button(
                                label=f"📥 Download {res['filename']}", 
                                data=file_bytes, 
                                file_name=res["filename"], 
                                key=f"dl_bulk_{idx}"
                            )
                        
                        # Short preview
                        if ctype in ["Lecture Notes", "Study Guide"]:
                            st.markdown(res.get("content", "")[:500] + "...\n\n*(Preview truncated)*")
                        elif ctype == "MCQ Quiz":
                            questions = res.get("quiz_data", {}).get("questions", [])
                            st.write(f"{len(questions)} questions generated.")
                        elif ctype == "Flashcards":
                            cards = res.get("flashcard_data", {}).get("flashcards", [])
                            st.write(f"{len(cards)} flashcards generated.")
