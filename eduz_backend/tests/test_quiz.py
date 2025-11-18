# tests/test_quiz.py

import pytest
from fastapi.testclient import TestClient
from app.models import User, Subject

@pytest.fixture
def student_token(client: TestClient, db_session):
    client.post("/users/register", json={
        "email": "quizstud@example.com",
        "name": "QuizStud",
        "role": "student",
        "password": "Secret123!"
    })
    login = client.post("/users/login", data={
        "username": "quizstud@example.com",
        "password": "Secret123!"
    })
    return login.json()["access_token"]

@pytest.fixture(autouse=True)
def prepare_subject(db_session):
    sub = Subject(name="History", level="Grade 1")
    db_session.add(sub)
    db_session.commit()

def test_start_quiz_unauthenticated(client):
    resp = client.post("/quiz/start", json={"subject_id": 1})
    assert resp.status_code == 401

def test_forbidden_non_student(client, db_session):
    # create a teacher user
    client.post("/users/register", json={
        "email": "quizteach@example.com",
        "name": "QuizTeach",
        "role": "student",
        "password": "Secret123!"
    })
    user = db_session.query(User).filter_by(email="quizteach@example.com").first()
    user.role = "teacher"
    db_session.commit()

    login = client.post("/users/login", data={
        "username": "quizteach@example.com",
        "password": "Secret123!"
    })
    token = login.json()["access_token"]

    resp = client.post(
        "/quiz/start",
        json={"subject_id": 1},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert resp.status_code == 403

def test_start_and_complete_quiz(client, student_token):
    # start quiz
    resp = client.post(
        "/quiz/start",
        json={"subject_id": 1},
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert resp.status_code == 200
    session = resp.json()
    assert session["subject_id"] == 1
    assert session["score"] is None

    # you’d add test for /quiz/submit here once implemented
    # e.g. resp2 = client.post("/quiz/submit", ...)
