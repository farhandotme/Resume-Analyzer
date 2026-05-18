from celery import Celery

celery_app = Celery(
    "ai_resume",
    # Redis holds the jobs
    broker="redis://localhost:6379/0",
    # Redis stores the results
    backend="redis://localhost:6379/0",
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
)
