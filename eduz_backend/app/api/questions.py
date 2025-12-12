import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.schemas import QuestionCreate, QuestionOut, BranchOut, TopicOut
from app.schemas import TopicCreate, BranchCreate
from app.schemas import SubjectCreate, SubjectOut
from app.schemas import TeacherDashboardStats, QuestionSummary
from app.models import Question, Topic, Branch, Subject, Quiz_session
from app.core.database import get_db
from app.core.auth import require_role
from typing import List

router = APIRouter()

# Get all unique systems from questions
@router.get("/systems", response_model=list)
def get_systems(db: Session = Depends(get_db)):
    systems = db.query(Question.systems).filter(Question.systems != None).filter(Question.systems != '').distinct().all()
    return [s[0] for s in systems if s[0]]

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

    # Options are now stored as JSONB, no need to serialize
    q = Question(
        question_text=payload.question_text,
        options=payload.options,
        correct_option=payload.correct_option,
        topic_id=payload.topic_id,
        branch_id=payload.branch_id,
        systems=payload.systems,
        created_by=current_user.id,
        approved=False,
        difficulty=payload.difficulty 
    )
    db.add(q)
    db.commit()
    db.refresh(q)

    # Options are already in the correct format (JSONB)
    return q

# List all approved questions for students and teachers and Admins
@router.get(
    "/",
    response_model=List[QuestionOut],
    dependencies=[Depends(require_role("student", "teacher", "admin"))]
)
def list_questions(db: Session = Depends(get_db)):
    questions = db.query(Question).filter(Question.approved == True).all()
    return questions

# List all subjects
@router.get("/subjects", response_model=List[SubjectOut])
def list_subjects(db: Session = Depends(get_db)):
    # Query only the columns we expect to exist in older schemas (id, name, level)
    rows = db.query(Subject.id, Subject.name, Subject.level).all()
    # Convert to list of dicts compatible with SubjectOut
    return [
        {"id": r[0], "name": r[1], "level": r[2]}
        for r in rows
    ]

# List all topics
@router.get("/topics", response_model=List[TopicOut])
def list_topics(db: Session = Depends(get_db)):
    return db.query(Topic).all()

# List all branches
@router.get("/branches", response_model=List[BranchOut])
def list_branches(db: Session = Depends(get_db)):
    return db.query(Branch).all()


# Add new subject
@router.post("/subjects", response_model=SubjectOut, dependencies=[Depends(require_role("teacher", "admin"))])
def create_subject(payload: SubjectCreate, db: Session = Depends(get_db)):
    subject = Subject(name=payload.name, level=payload.level)
    db.add(subject)
    db.commit()
    db.refresh(subject)
    return subject

# Add new topic
@router.post("/topics", response_model=TopicOut, dependencies=[Depends(require_role("teacher", "admin"))])
def create_topic(payload: TopicCreate, db: Session = Depends(get_db)):
    topic = Topic(name=payload.name, subject_id=payload.subject_id, branch_id=payload.branch_id)
    # Optionally store level in the topic if your Topic model supports it, or just accept it for filtering/logic
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

@router.get("/subjects/by_level/{level}", response_model=List[SubjectOut])
def get_subjects_by_level(level: str, db: Session = Depends(get_db)):
    rows = db.query(Subject.id, Subject.name, Subject.level).filter(Subject.level == level).all()
    return [{"id": r[0], "name": r[1], "level": r[2]} for r in rows]

@router.get("/topics/by_level/{level}", response_model=List[TopicOut])
def get_topics_by_level(level: str, db: Session = Depends(get_db)):
    return db.query(Topic).join(Subject).filter(Subject.level == level).all()

@router.get("/branches/by_level/{level}", response_model=List[BranchOut])
def get_branches_by_level(level: str, db: Session = Depends(get_db)):
    return db.query(Branch).join(Subject).filter(Subject.level == level).all()

@router.get("/teacher/dashboard", response_model=TeacherDashboardStats, dependencies=[Depends(require_role("teacher", "admin"))])
def get_teacher_dashboard(db: Session = Depends(get_db), current_user=Depends(require_role("teacher", "admin"))):
    """
    Returns dashboard statistics for a teacher.
    Includes questions created, difficulty distribution, and student usage stats.
    """
    # Get all questions created by the teacher
    questions = db.query(Question).filter(Question.created_by == current_user.id).all()
    
    # Build question summary
    question_summaries = []
    total_difficulty_score = 0
    
    for q in questions:
        # Count how many quiz sessions used this question
        usage_count = db.query(Quiz_session).filter(
            Quiz_session.questions.ilike(f'%{q.id}%')  # Rough count, assumes questions stored as list
        ).count()
        
        question_summaries.append(
            QuestionSummary(
                question_id=q.id,
                question_text=q.question_text,
                difficulty=q.difficulty,
                approved=q.approved,
                usage_count=usage_count,
                created_at=q.created_at
            )
        )
        # Accumulate difficulty score for averaging (difficulty is already 1-6 integer)
        total_difficulty_score += q.difficulty
    
    # Calculate statistics
    total_questions = len(questions)
    approved_count = sum(1 for q in questions if q.approved)
    pending_count = total_questions - approved_count
    
    # Count difficulty distribution (1-6 scale: 1-2=easy, 3-4=medium, 5-6=hard)
    easy_count = sum(1 for q in questions if q.difficulty in [1, 2])
    medium_count = sum(1 for q in questions if q.difficulty in [3, 4])
    hard_count = sum(1 for q in questions if q.difficulty in [5, 6])
    
    # Calculate average difficulty (1-6 scale)
    avg_difficulty = round(total_difficulty_score / total_questions, 2) if total_questions > 0 else 0.0
    
    # Total times students have used teacher's questions
    total_student_usage = sum(q.usage_count for q in question_summaries)
    
    return TeacherDashboardStats(
        user_id=current_user.id,
        total_questions=total_questions,
        approved_count=approved_count,
        pending_count=pending_count,
        easy_count=easy_count,
        medium_count=medium_count,
        hard_count=hard_count,
        average_difficulty=avg_difficulty,
        total_student_usage=total_student_usage,
        questions=question_summaries
    )
