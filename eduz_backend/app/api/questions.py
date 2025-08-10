# app/api/questions.py
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.schemas import QuestionCreate, QuestionOut,BranchOut, TopicOut
from app.schemas import TopicCreate, BranchCreate
from app.models import Question, Topic,Branch
from app.core.database import get_db
from app.core.auth import require_role
from typing import List

router = APIRouter()

@router.post(
    "/",
    response_model=QuestionOut,
    dependencies=[Depends(require_role("teacher", "admin"))]
)
def create_question(
    payload: QuestionCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("teacher", "admin"))
):
    # Verify topic exists (TO DO: Uncomment when Topic model is available)
    # topic = db.query(Topic).filter(Topic.id == payload.topic_id).first()
    # if not topic:
    #     raise HTTPException(status_code=404, detail="Topic not found")

    # Serialize options list to JSON string for storage
    options_json = json.dumps(payload.options)

    q = Question(
        question_text=payload.question_text,
        options=options_json,
        correct_option=payload.correct_option,
        topic_id=payload.topic_id,
        created_by=current_user.id,
        approved=False,
    )
    db.add(q)
    db.commit()
    db.refresh(q)

    # Deserialize JSON string back into list for the response
    q.options = json.loads(q.options)
    return q

# List all approved questions for students and teachers and Admins
@router.get(
    "/",
    response_model=List[QuestionOut],
    dependencies=[Depends(require_role("student", "teacher", "admin"))]
)
def list_questions(db: Session = Depends(get_db)):
    questions = db.query(Question).filter(Question.approved == True).all()
    for q in questions:
        q.options = json.loads(q.options)  # Convert string to list
    return questions

# List all topics
@router.get("/topics", response_model=List[TopicOut])
def list_topics(db: Session = Depends(get_db)):
    return db.query(Topic).all()

# List all branches
@router.get("/branches", response_model=List[BranchOut])
def list_branches(db: Session = Depends(get_db)):
    return db.query(Branch).all()

# Add new topic
@router.post("/topics", response_model=TopicOut, dependencies=[Depends(require_role("teacher", "admin"))])
def create_topic(payload: TopicCreate, db: Session = Depends(get_db)):
    topic = Topic(name=payload.name, subject_id=payload.subject_id, branch_id=payload.branch_id)
    db.add(topic)
    db.commit()
    db.refresh(topic)
    return topic

# Add new branch
@router.post("/branches", response_model=BranchOut, dependencies=[Depends(require_role("teacher", "admin"))])
def create_branch(payload: BranchCreate, db: Session = Depends(get_db)):
    branch = Branch(name=payload.name, subject_id=payload.subject_id)
    db.add(branch)
    db.commit()
    db.refresh(branch)
    return branch
# Teacher and Admin can see all questions, including unapproved ones
@router.get(
    "/unapproved",
    response_model=List[QuestionOut],
    dependencies=[Depends(require_role("teacher", "admin"))]
)
def list_unapproved(db: Session = Depends(get_db)):
    questions = db.query(Question).filter(Question.approved == False).all()
    for q in questions:
        q.options = json.loads(q.options)
    return questions