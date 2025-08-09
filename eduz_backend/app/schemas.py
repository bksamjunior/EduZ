from datetime import datetime
from pydantic import BaseModel, EmailStr, validator
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
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class QuestionCreate(BaseModel):
    question_text: str
    options: List[str]             # e.g. ["A) …", "B) …", "C) …", "D) …"]
    correct_option: str 
    branch_id: Optional[int] = None           # must exactly match one entry in `options`
    topic_id: int
    systems:  Optional[str] = None

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
        orm_mode = True

class QuizSessionCreate(BaseModel):
    subject_id: int  # which subject the student is quizzing on

class QuizSessionOut(BaseModel):
    id: int
    user_id: int
    subject_id: int
    score: Optional[int]        # may be None until quiz is finished
    started_at: datetime
    ended_at: Optional[datetime]

    class Config:
        orm_mode = True