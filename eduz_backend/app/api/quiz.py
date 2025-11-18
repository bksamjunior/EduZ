from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
import json
import random
from datetime import datetime

from app.core.database import get_db
from app.core.auth import require_role
from app.models import Quiz_session, Question, Subject, Topic, Branch, User,UserProgress
from app.schemas import (
    QuizStartRequest,
    QuizQuestionResponse,
    QuizSubmissionRequest,
    QuizResultOut,
    QuizSessionOut,
    QuizStartResponse
    )
from typing import List, Optional



router = APIRouter()

@router.post(
    "/start",
    response_model=QuizStartResponse, # Return questions and session id
    dependencies=[Depends(require_role("student","teacher","admin"))]
)
def start_quiz(
    payload: QuizStartRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("student","teacher","admin")) # Ensure current_user is typed
):
    """
    Starts a new quiz session for the logged-in student.
    Fetches questions based on subject, topic, or branch.
    """
    questions_query = db.query(Question).filter(Question.approved == True)

    # Join to Subject for level filtering
    questions_query = questions_query.join(Topic).join(Subject)

    if payload.level:
        questions_query = questions_query.filter(Subject.level == payload.level)

    if payload.subject_id:
        # Filter by subject and ensure the subject exists
        subject = db.query(Subject).filter(Subject.id == payload.subject_id).first()
        if not subject:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found.")
        questions_query = questions_query.filter(Subject.id == payload.subject_id)
    elif payload.topic_id:
        # Filter by topic and ensure the topic exists
        topic = db.query(Topic).filter(Topic.id == payload.topic_id).first()
        if not topic:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Topic not found.")
        questions_query = questions_query.filter(Question.topic_id == payload.topic_id)
    elif payload.branch_id:
        # Filter by branch and ensure the branch exists
        branch = db.query(Branch).filter(Branch.id == payload.branch_id).first()
        if not branch:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Branch not found.")
        questions_query = questions_query.filter(Question.branch_id == payload.branch_id)
    else:
        # This case should ideally be caught by the Pydantic validator, but as a fallback
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Please specify a subject_id, topic_id, or branch_id.")

    # Get all matching questions and shuffle them
    # difficulty allowed range: 1..6
    questions_by_difficulty = {d: get_question_for_difficulty(db, questions_query, d) for d in range(1,7)}

    selected_questions = []
    difficulty = 3

    while len(selected_questions) < payload.num_questions:
        available = questions_by_difficulty.get(difficulty, [])
        if available:
            q = random.choice(available)
            selected_questions.append(q)
            questions_by_difficulty[difficulty].remove(q)
        else:
            # Fallback: try easier, then harder
            fallback = [d for d in range(1,6) if questions_by_difficulty.get(d)]
            if not fallback:
                break  # no questions left
            difficulty = min(fallback, key=lambda d: abs(d - difficulty))


    if not selected_questions:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Could not retrieve enough questions for the requested number.")

    # Create a new quiz session record
    quiz_session = Quiz_session(
        user_id=current_user.id,
        subject_id=payload.subject_id,
        topic_id=payload.topic_id,
        branch_id=payload.branch_id,
        started_at=datetime.utcnow(),
        total_questions=len(selected_questions),
        score=0, # Initialize score to 0
        correct_answers=0 # Initialize correct answers to 0

    )

    # Always reset at the beginning of a new quiz
    user_progress = db.query(UserProgress).filter_by(user_id=current_user.id).first()
    if not user_progress:
        user_progress = UserProgress(user_id=current_user.id, current_difficulty=3)
    else:
        user_progress.current_difficulty = 3   # ✅ reset difficulty each new quiz
        user_progress.incorrect_streak = 0

    db.add(quiz_session)
    db.commit()
    db.refresh(quiz_session)

    # Prepare questions for response, deserializing options and omitting correct_option
    quiz_questions_response = []
    for q in selected_questions:
        # Options are now stored as JSONB, so they're already in the correct format
        q_options = q.options if q.options else []

        quiz_questions_response.append(
            QuizQuestionResponse(
                id=q.id,
                question_text=q.question_text,
                options=q_options
            )
        )
    
    # Store the question IDs and options in the session (or a temporary cache if stateful)
    # For a stateless API, the frontend must manage the questions.
    # We could theoretically store a JSON of question IDs and their correct answers in the quiz session,
    # but that's a security risk if the frontend can easily access it.
    # The safest is to re-fetch/re-verify answers on submission.

    return QuizStartResponse(
            questions=quiz_questions_response,
            quiz_session_id=quiz_session.id
        )
# Filter questions based on current difficulty
def get_question_for_difficulty(db, base_query, difficulty):
    q = base_query.filter(Question.difficulty == difficulty).all()
    return q

@router.post(
    "/submit",
    response_model=QuizResultOut,
    dependencies=[Depends(require_role("student","teacher","admin"))]
)
def submit_quiz(
    payload: QuizSubmissionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("student", "teacher", "admin"))
):
    """
    Submits a completed quiz session, calculates the score, and records results.
    """
    quiz_session = db.query(Quiz_session).filter(
        Quiz_session.id == payload.quiz_session_id,
        Quiz_session.user_id == current_user.id
    ).first()

    if not quiz_session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz session not found or not belonging to user.")
    
    if quiz_session.ended_at:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This quiz session has already been submitted.")

    # Initialize counters
    correct_answers_count = 0
    submitted_question_ids = {answer.question_id for answer in payload.answers}

    # Fetch all questions that were part of this quiz session
    # This requires knowing which questions were presented in the start_quiz response.
    # A safer approach is to include `question_ids` in `Quiz_session` model or `QuizSubmissionRequest`.
    # For now, let's assume we fetch all questions from the database and match them.
    # A more robust solution for tracking quiz questions would be a many-to-many relationship
    # between Quiz_session and Question, or storing the selected question IDs in the session.

    # For simplicity, let's fetch questions by the submitted IDs.
    questions_in_quiz = db.query(Question).filter(Question.id.in_(list(submitted_question_ids))).all()
    questions_map = {q.id: q for q in questions_in_quiz}

    for user_answer in payload.answers:
        question = questions_map.get(user_answer.question_id)

        if question:
            # Normalize both stored correct_option and submitted selected_option
            def _normalize(val):
                """Return dict with:
                - raw: normalized single-string (lowercased, whitespace/csv/newline collapsed)
                - tokens: list of token strings (split by whitespace)
                - multi: True if multiple tokens present
                This helper will attempt to decode JSON-encoded string values (e.g. '"a\\nb"')
                and will strip surrounding quotes if present.
                """
                import re, json
                if val is None:
                    return {"raw": "", "tokens": [], "multi": False}
                # If it's not a string, coerce to string
                if not isinstance(val, str):
                    val = str(val)

                s = val.strip()
                # If value looks like a JSON string literal (starts/ends with quotes), try to decode it
                if (len(s) >= 2 and ((s[0] == '"' and s[-1] == '"') or (s[0] == "'" and s[-1] == "'"))):
                    try:
                        decoded = json.loads(s)
                        # json.loads may return a list/number; coerce to string
                        if not isinstance(decoded, str):
                            decoded = str(decoded)
                        val = decoded
                    except Exception:
                        # Fall back to stripping surrounding quotes
                        val = s[1:-1]
                else:
                    val = s

                # Replace escaped newlines (literal backslash-n) and real newlines with spaces
                val = val.replace('\\n', ' ').replace('\n', ' ')
                # Replace commas with spaces to treat them as separators
                val = val.replace(',', ' ')
                # collapse whitespace
                v = re.sub(r"\s+", ' ', val).strip()
                tokens = [t.strip() for t in v.split(' ') if t.strip()]
                return {"raw": v.lower(), "tokens": [t.lower() for t in tokens], "multi": len(tokens) > 1}

            nq = _normalize(question.correct_option)
            nu = _normalize(user_answer.selected_option)
            print(f"Debug: Question correct option: {question.correct_option!r} -> {nq}, User selected option: {user_answer.selected_option!r} -> {nu}")

            # If either side is multi-select, compare as sets (order-insensitive)
            if nq["multi"] or nu["multi"]:
                if set(nq["tokens"]) == set(nu["tokens"]):
                    print("Debug: Correct (multi-select) submitted")
                    correct_answers_count += 1
            else:
                # Single-value compare using normalized raw strings
                if nq["raw"] == nu["raw"]:
                    print("Debug: Correct answer submitted")
                    correct_answers_count += 1
        else:
            # This indicates an invalid question ID was submitted.
            # You might want to log this or handle it differently.
            print(f"Warning: Question ID {user_answer.question_id} not found in database for submission.")


    total_questions_answered = len(payload.answers) if payload.answers else 0 # Number of questions the user answered

    # Avoid division by zero
    score = (correct_answers_count/total_questions_answered) * 100 if total_questions_answered > 0 else 0

    quiz_session.score = score
    quiz_session.correct_answers = correct_answers_count
    quiz_session.ended_at = datetime.utcnow()
    quiz_session.total_questions = total_questions_answered

    # persist quiz session updates
    db.add(quiz_session)

    # Update or create user progress now that we can compute performance
    user_progress = db.query(UserProgress).filter_by(user_id=current_user.id).first()
    if not user_progress:
        user_progress = UserProgress(user_id=current_user.id, current_difficulty=3)
    # If user answered at least one question, update difficulty based on performance
    if total_questions_answered > 0:
        if (correct_answers_count / total_questions_answered) >= 0.6:
            user_progress.current_difficulty = min(user_progress.current_difficulty + 1, 6)
            user_progress.incorrect_streak = 0
        else:
            user_progress.current_difficulty = max(user_progress.current_difficulty - 1, 1)
            user_progress.incorrect_streak = user_progress.incorrect_streak + 1 if user_progress.incorrect_streak is not None else 1
    db.add(user_progress)

    db.commit()
    db.refresh(quiz_session)
    return build_quiz_result_out(quiz_session)
    # Prepare response using helper

def build_quiz_result_out(quiz_session):
    score = quiz_session.score
    message = f"Quiz completed! You scored is {score}."
    if quiz_session.total_questions == 0:
        message = "Quiz submitted, but no questions were answered."
    return QuizResultOut(
        quiz_session=quiz_session,
        message=message
    )

@router.get(
    "/result/{session_id}",
    response_model=QuizResultOut,
    dependencies=[Depends(require_role("student","teacher","admin"))]
)
def get_quiz_result(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("student", "teacher", "admin"))
):
    """
    Returns the result of a quiz session for the given session_id.
    """
    quiz_session = db.query(Quiz_session).filter(
        Quiz_session.id == session_id,
        Quiz_session.user_id == current_user.id
    ).first()
    if not quiz_session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz session not found or not belonging to user.")
    if not quiz_session.ended_at:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Quiz session is not yet completed.")
    return build_quiz_result_out(quiz_session)
