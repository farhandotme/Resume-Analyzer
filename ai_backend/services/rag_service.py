import logging
import os
import re

from langchain_community.document_loaders import PyMuPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
from config.ai_models import embeddings
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")


def rag_storing_pdf(session_id: str, pdf_url: str):
    # Step 1 — load PDF
    try:
        loader = PyMuPDFLoader(pdf_url)
        data = loader.load()

        if data == "" or data is None or not data:
            return {"success": False, "error": "data not found"}

        full_text = " ".join([doc.page_content for doc in data]).strip()

        if not full_text:
            return {
                "success": False,
                "error": "PDF contains no extractable text. It might be a scanned image.",
            }

        text_lower = full_text.lower()
        resume_sections = [
            "experience",
            "work experience",
            "professional experience",
            "education",
            "skills",
            "summary",
            "objective",
            "projects",
            "certifications",
            "achievements",
            "employment history",
            "work history",
        ]

        has_section = any(section in text_lower for section in resume_sections)
        email_pattern = r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b"
        phone_pattern = r"(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}"

        has_email = bool(re.search(email_pattern, full_text))
        has_phone = bool(re.search(phone_pattern, full_text))

        if not has_section and not (has_email or has_phone):
            return {
                "success": False,
                "error": "This document does not appear to be a resume.",
            }

        word_count = len(full_text.split())
        if word_count < 50:
            return {
                "success": False,
                "error": "This document does not appear to be a resume. Content is too short.",
            }

    except Exception as e:
        logger.error(f"PDF loading failed for url {pdf_url}: {e}")
        return {
            "success": False,
            "error": "Could not load PDF. Check the URL and try again.",
        }

    # Step 2 — split into chunks
    try:
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500, chunk_overlap=100
        )
        texts = text_splitter.split_documents(data)

        if len(texts) == 0:
            return {"success": False, "error": "PDF has no readable text."}
    except Exception as e:
        logger.error(f"Text splitting failed: {e}")
        return {"success": False, "error": "Could not process PDF content."}

    # Step 3 — store in Qdrant
    try:
        collection_name = f"resume_{session_id}"
        client = QdrantClient(url=QDRANT_URL)
        collections = client.get_collections().collections
        existing_collections = [c.name for c in collections]

        if collection_name in existing_collections:
            client.delete_collection(collection_name=collection_name)

        QdrantVectorStore.from_documents(
            documents=texts,
            embedding=embeddings,
            url=QDRANT_URL,
            collection_name=collection_name,
        )

        return {
            "success": True,
            "message": "Resume stored successfully",
            "collection": collection_name,
        }

    except Exception as e:
        logger.error(f"Qdrant storage failed: {e}")
        return {
            "success": False,
            "error": "Could not store resume. Database might be down.",
        }


def retrive_resume_chanks(session_id: str, user_query: str):
    try:
        collection_name = f"resume_{session_id}"
        vector_store = QdrantVectorStore.from_existing_collection(
            embedding=embeddings,
            url=QDRANT_URL,
            collection_name=collection_name,
        )
    except Exception as e:
        logger.error(f"Qdrant connection failed: {e}")
        return {
            "success": False,
            "error": "Could not connect to database. Upload your resume first.",
        }

    try:
        docs = vector_store.similarity_search(query=user_query, k=4)
    except Exception as e:
        logger.error(f"Similarity search failed: {e}")
        return {"success": False, "error": "Could not search resume. Try again."}

    if not docs or len(docs) == 0:
        return {
            "success": False,
            "error": "No relevant content found. Try rephrasing your question.",
        }

    return {"success": True, "chunks": [doc.page_content for doc in docs]}
