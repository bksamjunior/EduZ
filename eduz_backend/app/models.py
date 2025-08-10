from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, DateTime
from sqlalchemy.dialects.sqlite import JSON 
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(String)  # student, teacher, admin
    created_at = Column(DateTime, default=datetime.utcnow)

class Branch(Base):
    __tablename__ = "branches"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    subject = relationship("Subject", back_populates="branches")
    topics = relationship("Topic", back_populates="branch") 
# Update Subject model
class Subject(Base):
    __tablename__ = "subjects"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    level = Column(String)
    branches = relationship("Branch", back_populates="subject")
    topics = relationship("Topic", back_populates="subject")

class Topic(Base):
    __tablename__ = "topics"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    subject_id = Column(Integer, ForeignKey("subjects.id"))

    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=True)  # new optional FK

    subject = relationship("Subject", back_populates="topics")
    branch = relationship("Branch", back_populates="topics")

class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True)
    question_text = Column(String)
    options = Column(String) 
    correct_option = Column(String)
    topic_id = Column(Integer, ForeignKey("topics.id"))
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=True)  # new
    created_by = Column(Integer, ForeignKey("users.id"))
    approved = Column(Boolean, default=False)
    systems = Column(String, nullable=True)

    topic = relationship("Topic")
    branch = relationship("Branch")

class Quiz_session(Base):
    __tablename__ = "quiz_sessions"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=True) # Made nullable
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=True) # New: Link to topic directly
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=True) # New: Link to branch directly
    score = Column(Integer, nullable=True) # Made nullable until quiz is finished
    total_questions = Column(Integer, nullable=True) # New: Store total questions in quiz
    correct_answers = Column(Integer, nullable=True) # New: Store correct answers
    started_at = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime, nullable=True) # Made nullable until quiz is finished

    # Optional: Add relationships for easier data retrieval
    user = relationship("User")
    subject = relationship("Subject")
    topic = relationship("Topic")
    branch = relationship("Branch")