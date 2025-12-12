# app/api/users.py
import os
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from typing import List
from pydantic import BaseModel

from app.schemas import UserCreate, UserOut, Token, AdminDashboardStats
from app.models import User, Question, Quiz_session
from app.core import security, database
from app.core.auth import get_current_user, require_role

router = APIRouter()

@router.post("/register", response_model=UserOut)
def register(user: UserCreate, db: Session = Depends(database.get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    # Only allow self-registration as student by default
    if user.role not in ["student"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot register as teacher or admin. Contact an admin."
        )
    new_user = User(
        email=user.email,
        name=user.name,
        role=user.role,
        password_hash=security.hash_password(user.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(database.get_db)
):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token = security.create_access_token(
        data={"sub": user.email, "role": user.role}
    )
    # Return token plus small user object to avoid extra /me call from front-end
    return {"access_token": access_token, "token_type": "bearer", "user": {"id": user.id, "role": user.role, "email": user.email}}

@router.get("/me", response_model=UserOut)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user

class PromotionRequest(BaseModel):
    new_role: str

@router.post("/{user_id}/promote", response_model=UserOut,
             dependencies=[Depends(require_role("admin"))])

def promote_user(
    user_id: int,
    req: PromotionRequest,
    db: Session = Depends(database.get_db),
    _admin: User = Depends(require_role("admin"))
):
    new_role = req.new_role
    """
    Promote a user to a new role. Only admins can call this.
    Allowed promotions: student -> teacher, teacher -> admin.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # Define valid promotion paths
    valid_promotions = {
        "student": ["teacher"],
        "teacher": ["admin"],
    }
    current_role = user.role
    if current_role not in valid_promotions or new_role not in valid_promotions[current_role]:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot promote from '{current_role}' to '{new_role}'."
        )
    user.role = new_role
    db.commit()
    db.refresh(user)
    return user

@router.get("/", response_model=List[UserOut], dependencies=[Depends(require_role("admin"))])
def list_users(db: Session = Depends(database.get_db)):
    return db.query(User).all()

@router.get("/admin/dashboard", response_model=AdminDashboardStats, dependencies=[Depends(require_role("admin"))])
def get_admin_dashboard(
    db: Session = Depends(database.get_db),
    _admin: User = Depends(require_role("admin"))
):
    """
    Returns system-wide dashboard statistics for administrators.
    Includes user counts by role, total questions, and total quiz sessions.
    """
    # Count users by role
    total_users = db.query(User).count()
    student_count = db.query(User).filter(User.role == "student").count()
    teacher_count = db.query(User).filter(User.role == "teacher").count()
    admin_count = db.query(User).filter(User.role == "admin").count()
    
    # Count questions
    total_questions = db.query(Question).count()
    approved_questions = db.query(Question).filter(Question.approved == True).count()
    pending_questions = total_questions - approved_questions
    
    # Count quizzes
    total_quiz_sessions = db.query(Quiz_session).count()
    completed_sessions = db.query(Quiz_session).filter(Quiz_session.ended_at.isnot(None)).count()
    
    # Calculate difficulty distribution (1-6 scale: 1-2=easy, 3-4=medium, 5-6=hard)
    from sqlalchemy import or_
    easy_questions = db.query(Question).filter(or_(Question.difficulty == 1, Question.difficulty == 2)).count()
    medium_questions = db.query(Question).filter(or_(Question.difficulty == 3, Question.difficulty == 4)).count()
    hard_questions = db.query(Question).filter(or_(Question.difficulty == 5, Question.difficulty == 6)).count()
    
    return AdminDashboardStats(
        total_users=total_users,
        student_count=student_count,
        teacher_count=teacher_count,
        admin_count=admin_count,
        total_questions=total_questions,
        approved_questions=approved_questions,
        pending_questions=pending_questions,
        easy_questions=easy_questions,
        medium_questions=medium_questions,
        hard_questions=hard_questions,
        total_quiz_sessions=total_quiz_sessions,
        completed_sessions=completed_sessions
    )

