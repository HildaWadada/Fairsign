"""
FairSign — Contract Text Parser
Handles PDF, DOCX, and TXT file extraction.
"""

import io
from typing import Union


async def extract_text_from_file(filename: str, content: bytes) -> str:
    """
    Extract raw text from a contract file.
    Supports: .pdf, .docx, .txt
    """
    ext = filename.lower().split(".")[-1]

    if ext == "txt":
        return content.decode("utf-8", errors="ignore")

    elif ext == "pdf":
        return _extract_from_pdf(content)

    elif ext == "docx":
        return _extract_from_docx(content)

    else:
        raise ValueError(f"Unsupported file type: .{ext}. Please upload a PDF, DOCX, or TXT file.")


def _extract_from_pdf(content: bytes) -> str:
    try:
        import PyPDF2
        reader = PyPDF2.PdfReader(io.BytesIO(content))
        text_parts = []
        for page in reader.pages:
            text = page.extract_text()
            if text:
                text_parts.append(text.strip())
        full_text = "\n\n".join(text_parts)
        if not full_text.strip():
            raise ValueError("The PDF appears to be image-based (scanned). Please upload a text-based PDF or copy the contract text into a .txt file.")
        return full_text
    except ImportError:
        raise ValueError("PDF parsing library not installed. Run: pip install PyPDF2")
    except Exception as e:
        raise ValueError(f"Could not read PDF: {str(e)}")


def _extract_from_docx(content: bytes) -> str:
    try:
        from docx import Document
        doc = Document(io.BytesIO(content))
        paragraphs = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
        full_text = "\n\n".join(paragraphs)
        if not full_text.strip():
            raise ValueError("The DOCX file appears to be empty or contains only images.")
        return full_text
    except ImportError:
        raise ValueError("DOCX parsing library not installed. Run: pip install python-docx")
    except Exception as e:
        raise ValueError(f"Could not read DOCX: {str(e)}")


def validate_contract_text(text: str) -> None:
    """Basic validation that the text looks like a contract."""
    if len(text.strip()) < 200:
        raise ValueError("The document is too short to be a contract. Please upload a complete contract.")

    # Check for some contract-like keywords
    contract_keywords = ["agreement", "artist", "label", "royalt", "record", "term", "clause", "shall", "hereby"]
    text_lower = text.lower()
    matches = sum(1 for kw in contract_keywords if kw in text_lower)

    if matches < 3:
        raise ValueError(
            "This document doesn't appear to be a music contract. "
            "Please upload a recording agreement, licensing deal, or similar contract."
        )