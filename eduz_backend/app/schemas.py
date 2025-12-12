from datetime import datetime
from pydantic import BaseModel, EmailStr, validator, model_validator
from typing import List, Optional
import re

# User schemas
class UserCreate(BaseModel):
    email: EmailStr
    name: str
    role: str
    password: str

    @validator('password')
    def validate_password(cls, value):
        password_pattern = re.compile(
            r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$'
        )
        if not password_pattern.match(value):
            raise ValueError(
                'Password must be at least 8 characters long and include an uppercase letter, '
                'a lowercase letter, a number, and a special character.'
            )
        return value

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

# Subject, Branch, Topic
class SubjectCreate(BaseModel):
    name: str
    level: str

class SubjectOut(BaseModel):
    id: int
    name: str
    level: str
    class Config:
        from_attributes = True

class BranchCreate(BaseModel):
    name: str
    subject_id: int

class BranchOut(BaseModel):
    id: int
    name: str
    subject_id: int
    class Config:
        from_attributes = True

class TopicCreate(BaseModel):
    name: str
    subject_id: int
    branch_id: Optional[int] = None
    level: str

class TopicOut(BaseModel):
    id: int
    name: str
    subject_id: int
    branch_id: Optional[int] = None
    class Config:
        from_attributes = True

# Question
class QuestionCreate(BaseModel):
    question_text: str
    options: List[str]
    correct_option: str
    branch_id: Optional[int] = None
    topic_id: int
    systems: Optional[str] = None
    difficulty: int = 3

    @validator('correct_option')
    def correct_option_must_be_in_options(cls, v, values):
        options = values.get('options')
        if options and v not in options:
            raise ValueError('correct_option must be one of the options')
        return v

class QuestionOut(BaseModel):
    id: int
    question_text: str
    options: List[str]
    correct_option: str
    topic_id: int
    branch_id: Optional[int] = None
    created_by: int
    approved: bool
    difficulty: int
    class Config:
        from_attributes = True

# Quiz schemas
class QuizQuestionResponse(BaseModel):
    id: int
    question_text: str
    options: List[str]
    class Config:
        from_attributes = True

class QuizStartRequest(BaseModel):
    subject_id: Optional[int] = None
    topic_id: Optional[int] = None
    branch_id: Optional[int] = None
    num_questions: int = 3
    level: Optional[str] = None

    @validator('num_questions')
    def num_questions_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError('Number of questions must be positive.')
        return v

    @model_validator(mode='after')
    def check_at_least_one_filter(self):
        if not any([self.subject_id, self.topic_id, self.branch_id]):
            raise ValueError('At least one of subject_id, topic_id, or branch_id must be provided.')
        return self

class UserAnswer(BaseModel):
    question_id: int
    selected_option: str

class QuizSubmissionRequest(BaseModel):
    quiz_session_id: int
    answers: List[UserAnswer]

class QuizSessionOut(BaseModel):
    id: int
    user_id: int
    subject_id: Optional[int]
    topic_id: Optional[int]
    branch_id: Optional[int]
    score: Optional[int]
    total_questions: Optional[int]
    correct_answers: Optional[int]
    started_at: datetime
    ended_at: Optional[datetime]
    class Config:
        from_attributes = True

class QuizStartResponse(BaseModel):
    questions: List[QuizQuestionResponse]
    quiz_session_id: int

class QuizResultOut(BaseModel):
    quiz_session: QuizSessionOut
    message: str

# Dashboard schemas
class QuizHistoryItem(BaseModel):
    """Individual quiz history entry"""
    quiz_id: int
    score: float
    total_questions: int
    correct_answers: int
    difficulty: str
    completed_at: datetime
    class Config:
        from_attributes = True

class StudentDashboardStats(BaseModel):
    """Student dashboard summary stats"""
    user_id: int
    total_quizzes: int
    average_score: float
    highest_score: float
    lowest_score: float
    total_attempts: int
    easy_count: int
    medium_count: int
    hard_count: int
    quiz_history: List[QuizHistoryItem]
    class Config:
        from_attributes = True

class QuestionSummary(BaseModel):
    """Summary of a question created by teacher"""
    question_id: int
    question_text: str
    difficulty: str
    approved: bool
    usage_count: int
    created_at: datetime
    class Config:
        from_attributes = True

class TeacherDashboardStats(BaseModel):
    """Teacher dashboard summary stats"""
    user_id: int
    total_questions: int
    approved_count: int
    pending_count: int
    easy_count: int
    medium_count: int
    hard_count: int
    average_difficulty: float
    total_student_usage: int
    questions: List[QuestionSummary]
    class Config:
        from_attributes = True

class AdminDashboardStats(BaseModel):
    """Admin dashboard summary stats"""
    total_users: int
    student_count: int
    teacher_count: int
    admin_count: int
    total_questions: int
    approved_questions: int
    pending_questions: int
    easy_questions: int
    medium_questions: int
    hard_questions: int
    total_quiz_sessions: int
    completed_sessions: int
    class Config:
        from_attributes = True

