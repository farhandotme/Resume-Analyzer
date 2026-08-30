from fastapi import FastAPI
from routes.chat import router as chatRouter
from routes.analyze import router as analizeRouter

app = FastAPI()

app.include_router(chatRouter)
app.include_router(analizeRouter)


@app.get("/")
def read_root():
    return {"message": "Hello, this is AI RESUME CHECKER"}
