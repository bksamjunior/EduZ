import json
import pytest
from app.models import Topic, Question
from typing import List

@pytest.fixture
def topic(db_session):
    # Create a topic so questions can reference it
    topic = Topic(name="Math", subject_id=1)
    db_session.add(topic)
    db_session.commit()
    db_session.refresh(topic)
    return topic


@pytest.fixture
def teacher_token(client, db_session):
    # Register as student
    client.post("/users/register", json={
        "email": "teach@example.com",
        "name": "Teacher",
        "role": "student",
        "password": "Secret123!"
    })

    # Promote to teacher
    from app import models
    user = db_session.query(models.User).filter_by(email="teach@example.com").first()
    user.role = "teacher"
    db_session.commit()

    # Login
    login_resp = client.post("/users/login", data={
        "username": "teach@example.com",
        "password": "Secret123!"
    })
    return login_resp.json()["access_token"]


def test_create_and_list_questions(client, teacher_token, topic, db_session):
    # Create question
    create_resp = client.post("/questions", json={
        "question_text": "What’s 2+2?",
        "options": ["1","2","3","4"],
        "correct_option": "4",
        "topic_id": topic.id
    }, headers={"Authorization": f"Bearer {teacher_token}"})
    assert create_resp.status_code == 200
    data = create_resp.json()

    # Approve question manually (since unapproved questions may be hidden)
    question = db_session.query(Question).get(data["id"])
    question.approved = True
    db_session.commit()

    # Fetch questions again
    list_resp = client.get("/questions", headers={"Authorization": f"Bearer {teacher_token}"})
    assert list_resp.status_code == 200

    # Options should now come back as proper lists by default
    questions = list_resp.json()
    assert any(q["question_text"] == "What's 2+2?" for q in questions)
    # Verify options format
    assert all(isinstance(q["options"], list) for q in questions)
