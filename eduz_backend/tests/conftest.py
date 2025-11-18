import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from main import app
from app.core.database import Base, get_db
from app import models

import os

# Use a dedicated test database. Prefer TEST_DATABASE_URL or DATABASE_URL for Postgres in CI/local env.
TEST_DATABASE_URL = os.getenv("TEST_DATABASE_URL") or os.getenv("DATABASE_URL") or "sqlite:///./test.db"

# Only set sqlite-specific connect args when using sqlite
connect_args = {"check_same_thread": False} if TEST_DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(TEST_DATABASE_URL, connect_args=connect_args)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Override DB dependency
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="session", autouse=True)
def setup_db():
    # If a dedicated TEST_DATABASE_URL was provided, it's safe to reset the DB for tests.
    explicit_test_db = bool(os.getenv("TEST_DATABASE_URL"))

    if explicit_test_db:
        # Drop and recreate to ensure schema matches models (useful when Postgres has older schema)
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)
    else:
        # Non-explicit test DB (e.g. using DATABASE_URL) -- attempt to create missing tables if possible.
        # For sqlite this will create the file; for Postgres this will not alter existing tables.
        Base.metadata.create_all(bind=engine)

    yield

    # Properly close and remove database
    TestingSessionLocal().close_all()
    engine.dispose()
    if TEST_DATABASE_URL.startswith("sqlite") and os.path.exists("./test.db"):
        os.remove("./test.db")


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
