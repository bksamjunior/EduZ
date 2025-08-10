from datetime import datetime
from pydantic import BaseModel, EmailStr, validator, model_validator # Import model_validator
from typing import List, Optional
import re
import json

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
        from_attributes = True # Changed from orm_mode to from_attributes for Pydantic V2

class Token(BaseModel):
    access_token: str
    token_type: str

class QuestionCreate(BaseModel):
    question_text: str
    options: List[str]
    correct_option: str
    branch_id: Optional[int] = None
    topic_id: int
    systems: Optional[str] = None

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

    class Config:
        from_attributes = True # Changed from orm_mode to from_attributes for Pydantic V2

class TopicOut(BaseModel):
    id: int
    name: str
    subject_id: int
    branch_id: Optional[int] = None
    class Config:
        from_attributes = True

class TopicCreate(BaseModel):
    name: str
    subject_id: int
    branch_id: Optional[int] = None

class BranchCreate(BaseModel):
    name: str
    subject_id: int

class BranchOut(BaseModel):
    id: int
    name: str
    subject_id: int
    class Config:
        from_attributes = True

# New schemas for Quiz mechanism

class QuizQuestionResponse(BaseModel):
    id: int
    question_text: str
    options: List[str]
    # correct_option is deliberately omitted for the client

    class Config:
        from_attributes = True # Changed from orm_mode to from_attributes for Pydantic V2

class QuizStartRequest(BaseModel):
    # User can specify subject, topic, or branch for the quiz
    subject_id: Optional[int] = None
    topic_id: Optional[int] = None
    branch_id: Optional[int] = None
    num_questions: int = 3 # Default number of questions

    @validator('num_questions')
    def num_questions_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError('Number of questions must be positive.')
        return v

    # Use model_validator for cross-field validation in Pydantic V2
    @model_validator(mode='after') # This validator runs after all fields are parsed
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
        from_attributes = True # Changed from orm_mode to from_attributes for Pydantic V2

class QuizResultOut(BaseModel):
    quiz_session: QuizSessionOut
    message: str