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

class Subject(Base):
    __tablename__ = "subjects"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    level = Column(String)

class Topic(Base):
    __tablename__ = "topics"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    subject_id = Column(Integer, ForeignKey("subjects.id"))

class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True)
    question_text = Column(String)
    options = Column(String)  # Store as JSON string  #Column("options", String, nullable=False)
    correct_option = Column(String)
    topic_id = Column(Integer, ForeignKey("topics.id"))
    created_by = Column(Integer, ForeignKey("users.id"))
    approved = Column(Boolean, default=False)
    
    #TO DO:To be added later
    # @property
    # def options(self):
    #     return json.loads(self._options)

    # @options.setter
    # def options(self, value):
    #     self._options = json.dumps(value)

class Quiz_session(Base):
    __tablename__ = "quiz_sessions"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    score = Column(Integer)
    started_at = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime)