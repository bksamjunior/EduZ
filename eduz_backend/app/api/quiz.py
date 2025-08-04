# app/api/quiz.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth import require_role
from app.models import Quiz_session
from app.schemas import QuizSessionCreate, QuizSessionOut  # define these schemas

router = APIRouter()

@router.post(
    "/start",
    response_model=QuizSessionOut,
    dependencies=[Depends(require_role("student"))]
)
def start_quiz(
    payload: QuizSessionCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_role("student"))
):
    # implementation...
    session = Quiz_session(user_id=current_user.id, subject_id=payload.subject_id)
    db.add(session); db.commit(); db.refresh(session)
    return session

# similarly protect /submit, /results, etc.
