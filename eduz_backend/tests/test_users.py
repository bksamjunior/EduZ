import pytest
from app import models
from app.core.security import verify_password

def test_register_and_role_default_student(client):
    resp = client.post("/users/register", json={
        "email":"alice@example.com",
        "name":"Alice",
        "role":"student",  # Allowed to register as student
        "password":"Secret123!"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["email"] == "alice@example.com"
    assert data["role"] == "student"

def test_register_cannot_self_promote(client):
    # Trying to register directly as teacher (should fail)
    resp = client.post("/users/register", json={
        "email":"bob@example.com",
        "name":"Bob",
        "role":"teacher",
        "password":"Secret123!"
    })
    assert resp.status_code == 403

def test_login_and_me(client):
    # Register a student first
    client.post("/users/register", json={
        "email":"carol@example.com",
        "name":"Carol",
        "role":"student",
        "password":"Secret123!"
    })

    # Login as that student
    resp = client.post("/users/login",
                       data={"username":"carol@example.com","password":"Secret123!"})
    assert resp.status_code == 200
    token = resp.json()["access_token"]

    # Call /users/me with token
    me_resp = client.get("/users/me", headers={"Authorization": f"Bearer {token}"})
    assert me_resp.status_code == 200
    me_data = me_resp.json()
    assert me_data["email"] == "carol@example.com"

@pytest.fixture
def admin_token(client, db_session):
    # Register a student user
    resp = client.post("/users/register", json={
        "email": "admin@ex.com",
        "name": "Admin",
        "role": "student",
        "password": "Secret123!"
    })
    assert resp.status_code == 200

    # Promote to admin directly in DB
    user = db_session.query(models.User).filter_by(email="admin@ex.com").first()
    user.role = "admin"
    db_session.commit()

    # Login as admin
    login_resp = client.post("/users/login", data={"username":"admin@ex.com", "password":"Secret123!"})
    token = login_resp.json()["access_token"]
    return token

def test_admin_promote_flow(client, admin_token):
    # Register a new student user to promote
    resp = client.post("/users/register", json={
        "email": "dave@ex.com",
        "name": "Dave",
        "role": "student",
        "password": "Secret123!"
    })
    assert resp.status_code == 200
    dave_id = resp.json()["id"]  # FIXED: dynamically fetch ID

    # Promote Dave using the actual ID
    promote_resp = client.post(
        f"/users/{dave_id}/promote?new_role=teacher",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert promote_resp.status_code == 200