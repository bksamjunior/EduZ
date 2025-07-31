from pydantic import BaseModel, EmailStr, validator
from typing import Optional
import re
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
