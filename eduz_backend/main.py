from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import users,questions,quiz

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(questions.router, prefix="/questions", tags=["Questions"])
app.include_router(quiz.router, prefix="/quiz", tags=["Quiz"])