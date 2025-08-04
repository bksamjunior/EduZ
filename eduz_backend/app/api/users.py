# app/api/users.py
import os
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm

from app.schemas import UserCreate, UserOut, Token
from app.models import User
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
    return {"access_token": access_token, "token_type": "bearer", "role": user.role}

@router.get("/me", response_model=UserOut)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/{user_id}/promote", response_model=UserOut,
             dependencies=[Depends(require_role("admin"))])

def promote_user(
    user_id: int,
    new_role: str,
    db: Session = Depends(database.get_db),
    _admin: User = Depends(require_role("admin"))
):
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
