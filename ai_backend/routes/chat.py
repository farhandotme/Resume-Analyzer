from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from services.rag_service import rag_storing_pdf, retrive_resume_chanks

router = APIRouter()


class ChatRequest(BaseModel):
    pdf_url: Optional[str] = None
    message: str
    user_id: str


@router.post("/chat")
async def chat(req: ChatRequest):
    pdf_url = req.pdf_url
    user_query = req.message
    user_id = req.user_id
    if pdf_url:
        rag_storing_pdf(user_id=user_id, pdf_url=pdf_url)

    chunks = retrive_resume_chanks(user_id=user_id, user_query=user_query)

    return {"message": "Relevant chunks retrieved successfully", "chunks": chunks}
