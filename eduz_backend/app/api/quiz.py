from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
import json
import random
from datetime import datetime

from app.core.database import get_db
from app.core.auth import require_role
from app.models import Quiz_session, Question, Subject, Topic, Branch, User
from app.schemas import (
    QuizStartRequest,
    QuizQuestionResponse,
    QuizSubmissionRequest,
    QuizResultOut,
    QuizSessionOut
)
from typing import List, Optional

router = APIRouter()

@router.post(
    "/start",
    response_model=List[QuizQuestionResponse], # Return a list of questions
    dependencies=[Depends(require_role("student","admin"))]
)
def start_quiz(
    payload: QuizStartRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("student","admin")) # Ensure current_user is typed
):
    """
    Starts a new quiz session for the logged-in student.
    Fetches questions based on subject, topic, or branch.
    """
    questions_query = db.query(Question).filter(Question.approved == True)

    if payload.subject_id:
        # Filter by subject and ensure the subject exists
        subject = db.query(Subject).filter(Subject.id == payload.subject_id).first()
        if not subject:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found.")
        questions_query = questions_query.join(Topic).join(Subject).filter(Subject.id == payload.subject_id)
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
    all_questions = questions_query.all()
    if not all_questions:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No approved questions found for the selected criteria.")

    random.shuffle(all_questions)

    # Select the requested number of questions
    selected_questions = all_questions[:payload.num_questions]

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
    db.add(quiz_session)
    db.commit()
    db.refresh(quiz_session)

    # Prepare questions for response, deserializing options and omitting correct_option
    quiz_questions_response = []
    for q in selected_questions:
        # Deserialize the options from JSON string back to a list
        q_options = json.loads(q.options)
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

    return quiz_questions_response

@router.post(
    "/submit",
    response_model=QuizResultOut,
    dependencies=[Depends(require_role("student","admin"))]
)
def submit_quiz(
    payload: QuizSubmissionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("student", "admin"))
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
            # Check if the submitted answer matches the correct_option
            if user_answer.selected_option == question.correct_option:
                correct_answers_count += 1
        else:
            # This indicates an invalid question ID was submitted.
            # You might want to log this or handle it differently.
            print(f"Warning: Question ID {user_answer.question_id} not found in database for submission.")


    total_questions_answered = len(payload.answers) # Number of questions the user answered
    
    score = (correct_answers_count/total_questions_answered) * 100

    quiz_session.score =  score # Score is number of correct answers
    quiz_session.correct_answers = correct_answers_count
    quiz_session.ended_at = datetime.utcnow()
    quiz_session.total_questions = total_questions_answered # Update total questions based on submission

    db.add(quiz_session) # Mark as dirty if already added, otherwise add
    db.commit()
    db.refresh(quiz_session)

    # Prepare response
    message = f"Quiz completed! You scored is {score}."
    if total_questions_answered == 0:
        message = "Quiz submitted, but no questions were answered."

    return QuizResultOut(
        quiz_session=quiz_session,
        message=message
    )
