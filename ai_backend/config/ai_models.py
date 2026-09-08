import os

from dotenv import load_dotenv
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_openrouter import ChatOpenRouter

# Load environment variables from .env
load_dotenv()

# Make sure the API key exists
if not os.getenv("OPENROUTER_API_KEY"):
    raise ValueError(
        "OPENROUTER_API_KEY is not set. "
        "Add it to your .env file."
    )

# Embeddings
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

# LLM - OpenRouter FREE model
llm = ChatOpenRouter(
    model="openai/gpt-oss-20b",
    temperature=0,
)