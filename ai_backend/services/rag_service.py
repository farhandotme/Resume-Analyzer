from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
import requests
from pydantic import BaseModel
from fastapi import APIRouter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient

router = APIRouter()

from dotenv import load_dotenv

load_dotenv()


# this is the pdf storing function that used to first load the pdf , then split it , generate the embedding and then store ot into the qdrant db


def rag_storing_pdf(user_id: str, pdf_url: str):

    print("url :", pdf_url)
    # loading the pdf---->

    loader = PyPDFLoader(pdf_url)
    data = loader.load()

    collection_name = f"resume_{user_id}"

    # text splitter--->

    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    texts = text_splitter.split_documents(data)

    # embedding Model -------
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    client = QdrantClient(url="http://localhost:6333")
    collections = client.get_collections().collections

    existing_collections = [c.name for c in collections]

    if collection_name in existing_collections:
        client.delete_collection(collection_name=collection_name)

    vector_store = QdrantVectorStore.from_documents(
        documents=texts,
        embedding=embeddings,
        url="http://localhost:6333",
        collection_name=collection_name,
    )
    return {"message": "Resume stored successfully", "collection": f"resume_{user_id}"}


def retrive_resume_chanks(user_id: str, user_query: str):

    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    vector_store = QdrantVectorStore.from_existing_collection(
        embedding=embeddings,
        url="http://localhost:6333",
        collection_name=f"resume_{user_id}",
    )
    docs = vector_store.similarity_search(query=user_query, k=3)

    retrieved_chunks = []

    for doc in docs:
        retrieved_chunks.append(doc.page_content)

    return {
        "message": "Relevant chunks retrieved successfully",
        "chunks": retrieved_chunks,
    }
