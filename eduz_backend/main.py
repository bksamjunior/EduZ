from fastapi import FastAPI
from app.api import users,questions,quiz

app = FastAPI()

app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(questions.router, prefix="/questions", tags=["Questions"])
app.include_router(quiz.router, prefix="/quiz", tags=["Quiz"])