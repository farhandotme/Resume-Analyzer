import logging

from fastapi import APIRouter
from pydantic import BaseModel
from dotenv import load_dotenv

from services.tasks import analyze_resume_task

load_dotenv()

router = APIRouter()
logger = logging.getLogger(__name__)


class AnalyzeRequest(BaseModel):
    job_title: str
    pdf_url: str


@router.post("/analyze")
async def analyze_resume(req: AnalyzeRequest):
    # push job to queue and return job_id immediately
    task = analyze_resume_task.delay(pdf_url=req.pdf_url, job_title=req.job_title)
    logger.info(f"Analyze job queued: {task.id} for job_title: {req.job_title}")
    return {"success": True, "job_id": task.id}


@router.get("/analyze/status/{job_id}")
async def get_status(job_id: str):
    task = analyze_resume_task.AsyncResult(job_id)

    if task.state == "PENDING":
        return {"success": True, "status": "processing", "data": None}

    elif task.state == "SUCCESS":
        return {"success": True, "status": "done", "data": task.result}

    elif task.state == "FAILURE":
        return {
            "success": False,
            "status": "failed",
            "error": "Analysis failed. Try again.",
        }

    else:
        return {"success": True, "status": task.state.lower(), "data": None}
