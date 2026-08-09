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

# defined once at top — works locally and in Docker
QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")


def rag_storing_pdf(user_id: str, pdf_url: str):

    # Step 1 — load PDF
    try:
        loader = PyMuPDFLoader(pdf_url)
        data = loader.load()

        # Check if data is empty
        if data == "" or data == None or not data:
            return {
                "success": False,
                "error": "data not found",
            }

        # NEW: Check if pages have content BEFORE splitting
        full_text = " ".join([doc.page_content for doc in data]).strip()

        if not full_text:
            return {
                "success": False,
                "error": "PDF contains no extractable text. It might be a scanned image.",
            }

        # Resume validation (your existing code)
        text_lower = full_text.lower()

        # Common resume sections
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

        # Check for resume sections
        has_section = any(section in text_lower for section in resume_sections)

        # Check for contact info (email or phone)
        email_pattern = r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b"
        phone_pattern = r"(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}"

        has_email = bool(re.search(email_pattern, full_text))
        has_phone = bool(re.search(phone_pattern, full_text))

        # If no resume sections AND no contact info, reject
        if not has_section and not (has_email or has_phone):
            return {
                "success": False,
                "error": "This document does not appear to be a resume. Please upload a valid resume with sections like Experience, Education, or Skills.",
            }

        # Optional: Check minimum word count
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
            return {
                "success": False,
                "error": "PDF has no readable text. It might be a scanned image.",
            }

        logger.info(f"Total chunks created: {len(texts)}")
    except Exception as e:
        logger.error(f"Text splitting failed: {e}")
        return {"success": False, "error": "Could not process PDF content."}

    # Step 3 — store in Qdrant
    try:
        collection_name = f"resume_{user_id}"
        client = QdrantClient(url=QDRANT_URL)
        collections = client.get_collections().collections
        existing_collections = [c.name for c in collections]

        if collection_name in existing_collections:
            logger.info(f"Deleting old collection: {collection_name}")
            client.delete_collection(collection_name=collection_name)

        QdrantVectorStore.from_documents(
            documents=texts,
            embedding=embeddings,
            url=QDRANT_URL,
            collection_name=collection_name,
        )

        logger.info("Resume stored successfully!")
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


def retrive_resume_chanks(user_id: str, user_query: str):

    # Step 1 — connect to collection
    try:
        vector_store = QdrantVectorStore.from_existing_collection(
            embedding=embeddings,
            url=QDRANT_URL,
            collection_name=f"resume_{user_id}",
        )
    except Exception as e:
        logger.error(f"Qdrant connection failed for user {user_id}: {e}")
        return {
            "success": False,
            "error": "Could not connect to database. Upload your resume first.",
        }

    # Step 2 — search chunks
    try:
        docs = vector_store.similarity_search(query=user_query, k=4)
    except Exception as e:
        logger.error(f"Similarity search failed for user {user_id}: {e}")
        return {"success": False, "error": "Could not search resume. Try again."}

    # Step 3 — check if anything came back
    if not docs or len(docs) == 0:
        logger.warning(f"No chunks found for user {user_id} query: '{user_query}'")
        return {
            "success": False,
            "error": "No relevant content found. Try rephrasing your question.",
        }

    logger.info(f"Retrieved {len(docs)} chunks for user {user_id}")
    return {"success": True, "chunks": [doc.page_content for doc in docs]}
