import logging

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

from services.rag_service import rag_storing_pdf, retrive_resume_chanks
from prompts.prompt import resume_prompt
from config.ai_models import llm

router = APIRouter()
logger = logging.getLogger(__name__)


chat_histories = {}


class ChatRequest(BaseModel):
    pdf_url: Optional[str] = None
    message: str
    user_id: str


@router.post("/chat")
async def chat(req: ChatRequest):

    # Step 1 — Store PDF if provided
    if req.pdf_url:
        store_result = rag_storing_pdf(user_id=req.user_id, pdf_url=req.pdf_url)

        if not store_result["success"]:
            return store_result

    # Step 2 — Retrieve Resume Chunks
    retrieve_result = retrive_resume_chanks(user_id=req.user_id, user_query=req.message)

    if not retrieve_result["success"]:
        return retrieve_result

    try:
        # Resume Context
        context = "\n\n".join(retrieve_result["chunks"])

        # System Prompt
        system_prompt = resume_prompt(context=context, question=req.message)

        # Get previous history
        history = chat_histories.get(req.user_id, [])

        # Build conversation
        messages = [
            SystemMessage(content=system_prompt),
            *history,
            HumanMessage(content=req.message),
        ]

        # Call LLM
        response = llm.invoke(messages)

        # Save conversation
        history.append(HumanMessage(content=req.message))
        history.append(AIMessage(content=response.content))

        # Keep only last 10 messages (5 conversations)
        chat_histories[req.user_id] = history[-10:]

    except Exception as e:
        logger.error(f"LLM call failed for user {req.user_id}: {e}")

        return {"success": False, "error": "AI response failed. Try again."}

    logger.info(f"Chat success for user {req.user_id}")

    return {
        "success": True,
        "answer": response.content,
        "retrieved_chunks": retrieve_result["chunks"],
    }
