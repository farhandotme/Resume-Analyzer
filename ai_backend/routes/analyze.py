# this will be call the tavily function and get all the result
from tavily import TavilyClient
from pydantic import BaseModel
from dotenv import load_dotenv
from fastapi import APIRouter

from testing.alltext import alltext

from config.ai_models import llm

from prompts.prompt import scoring_resume

from langchain_community.document_loaders import PyMuPDFLoader

router = APIRouter()

load_dotenv()
import os

tavily_client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))


def extract_search_text(tavily_response: dict) -> str:
    results = tavily_response.get("results", [])

    combined = ""
    for result in results:
        title = result.get("title", "")
        content = result.get("content", "")
        combined += f"Source: {title}\n{content}\n\n"

    return combined.strip()


def extract_pdf_data(pdf_url: str) -> str:
    loader = PyMuPDFLoader(pdf_url)
    data = loader.load()
    return "\n".join([page.page_content for page in data])


class analize(BaseModel):
    job_title: str
    pdf_url: str


@router.post("/analize")
async def analize_resume(req: analize):
    job_title = req.job_title
    pdf_url = req.pdf_url

    resume_text = extract_pdf_data(pdf_url=pdf_url)

    # for now it is closed because it is for testing purpose--------->
    # queries = [
    #     f"{job_title} required skills certifications experience 2026 hiring",
    #     f"{job_title} resume ATS keywords format tips to get hired 2026",
    #     f"{job_title} job market demand salary growth opportunities 2026",
    # ]

    all_text = alltext
    # for query in queries:
    #     response = tavily_client.search(query=query, max_results=2)
    #     all_text += extract_search_text(response) + "\n"
    finalPrompt = scoring_resume(
        internet_data=all_text, resume_content=resume_text, job_title=job_title
    )

    response = llm.invoke(finalPrompt)

    return response
