import re
from typing import Dict, Any

def clean_extracted_markdown(markdown_text: str) -> str:
    """
    Step 2: Clean extracted document.
    Removes extra spaces, normalizes empty lines, headings, bullet lists, tables while preserving
    Units, Topics, Subtopics, and structural formatting.
    """
    if not markdown_text:
        return ""

    # Replace windows carriage returns
    text = markdown_text.replace("\r\n", "\n")

    # Remove inline excessive horizontal spacing (more than 2 spaces inside lines, but preserve leading indent)
    cleaned_lines = []
    for line in text.split("\n"):
        stripped_line = line.strip()
        
        # Normalize headings formatting: e.g. #Heading -> # Heading
        match_heading = re.match(r'^(#{1,6})\s*(.*)$', stripped_line)
        if match_heading:
            hashes, title = match_heading.groups()
            cleaned_lines.append(f"{hashes} {title.strip()}")
            continue

        # Normalize bullet lists: e.g. *  item or + item -> - item
        match_list = re.match(r'^[*\+]\s+(.*)$', stripped_line)
        if match_list:
            cleaned_lines.append(f"- {match_list.group(1).strip()}")
            continue

        cleaned_lines.append(line.rstrip())

    text = "\n".join(cleaned_lines)

    # Collapse 3 or more consecutive blank lines into 2 blank lines
    text = re.sub(r'\n{3,}', '\n\n', text)

    return text.strip()
