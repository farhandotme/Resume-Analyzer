import json
import re
import os
import logging

from dotenv import load_dotenv
from concurrent.futures import ThreadPoolExecutor

load_dotenv()
from json_repair import repair_json
from config.celery_app import celery_app
from langchain_community.document_loaders import PyMuPDFLoader
from tavily import TavilyClient
from config.ai_models import llm
from prompts.prompt import scoring_resume

logger = logging.getLogger(__name__)

tavily_client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))


@celery_app.task(bind=True, time_limit=120)
def analyze_resume_task(self, pdf_url: str, job_title: str):

    # Step 1 — extract PDF (never retry this)
    try:
        loader = PyMuPDFLoader(pdf_url)
        data = loader.load()
        resume_text = "\n".join([page.page_content for page in data])

        if not resume_text.strip():
            return {
                "success": False,
                "error": "PDF has no readable text. It might be a scanned image.",
            }

    except Exception as e:
        logger.error(f"PDF extraction failed: {e}")
        return {
            "success": False,
            "error": "Could not load PDF. Check the URL and try again.",
        }

    # Step 2 — search Tavily (retry on failure — network issues are temporary)
    try:
        queries = [
            f"{job_title} required skills certifications experience 2026 hiring",
            f"{job_title} resume ATS keywords format tips to get hired 2026",
            f"{job_title} job market demand salary growth opportunities 2026",
        ]

        def search_one(query):
            return tavily_client.search(query=query, max_results=2)

        with ThreadPoolExecutor(max_workers=3) as executor:
            results = list(executor.map(search_one, queries))

        all_text = ""
        for response in results:
            for result in response.get("results", []):
                all_text += (
                    f"{result.get('title', '')}\n{result.get('content', '')}\n\n"
                )

    except Exception as e:
        logger.error(f"Tavily search failed: {e}")
        raise self.retry(exc=e, countdown=5, max_retries=2)

    # Step 3 — call LLM (retry on failure — LLM can have temporary timeouts)
    try:
        final_prompt = scoring_resume(
            internet_data=all_text, resume_content=resume_text, job_title=job_title
        )
        response = llm.invoke(final_prompt)

    except Exception as e:
        logger.error(f"LLM call failed: {e}")
        raise self.retry(exc=e, countdown=5, max_retries=2)

    # Step 4 — parse JSON (never retry this — if LLM returned bad JSON, retrying won't help)
    try:
        cleaned = re.sub(r"```json|```", "", response.content).strip()
        repaired = repair_json(cleaned)
        result = json.loads(repaired)
        logger.info(f"Analyze task completed for job_title: {job_title}")
        return {"success": True, "data": result}

    except Exception as e:
        logger.error(f"JSON parsing failed. Raw response: {response.content}")
        return {
            "success": False,
            "error": "AI returned an invalid response. Try again.",
        }
