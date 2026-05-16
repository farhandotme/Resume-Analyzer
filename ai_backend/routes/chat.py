from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

from services.rag_service import rag_storing_pdf, retrive_resume_chanks

from ai_backend.prompts.prompt import resume_prompt

from config.ai_models import llm

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

    # upload/update resume
    if pdf_url:

        rag_storing_pdf(user_id=user_id, pdf_url=pdf_url)

    # retrieve chunks
    chunks = retrive_resume_chanks(user_id=user_id, user_query=user_query)

    context = "\n\n".join(chunks)

    final_prompt = resume_prompt(context=context, question=user_query)

    response = llm.invoke(final_prompt)

    return {"answer": response.content, "retrieved_chunks": chunks}
