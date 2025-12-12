# RECAP - Changes applied and verification steps

Date: 2025-11-10

This file summarizes the edits, fixes, and verification steps performed during the recent debugging and migration session. It also lists follow-up recommendations.

----

## Short summary

- Converted question `options` handling to a true JSON/JSONB workflow (ORM mapping + code changes).
- Implemented robust normalization and comparison for quiz scoring to handle legacy/quoted/escaped formats and multi-select answers.
- Fixed role-based authorization fragility by making role checks case-insensitive and trimming whitespace.
- Removed redundant JSON (de)serialization at API boundaries and updated tests to expect lists for `options`.

Files changed (edits intended to be minimal and low-risk)
- eduz_backend/generate.py
  - Change: `hash_password` now returns the hash; the top-level call was removed and guarded under `if __name__ == '__main__'`.
  - Why: avoid side-effects at import time and make the utility usable programmatically.

- eduz_backend/app/models.py
  - Change: added `gce_id = Column(String, nullable=True)` to `Subject` model to store external codes (prevents assigning string codes to integer PKs).
  - Why: prevents type errors when seed data used exam codes that include leading zeros.

- eduz_backend/app/api/quiz.py
  - Changes:
    - Consistent difficulty range: 1..6 used for question selection
    - Fixed `submit_quiz` logic: compute totals before using them, avoid division-by-zero, persist `user_progress` and `quiz_session` to DB, update difficulty properly.
  - Why: previously `submit_quiz` referenced variables before assignment and didn't persist progress. These changes make scoring and progress updates robust.

- eduz_backend/app/api/users.py
  - Change: login endpoint now returns token plus a small `user` object (id, role, email) to avoid an immediate `/users/me` call from the frontend.
  - Why: simpler frontend flow and fewer requests after login.

- eduz_backend/app/db/init_db.py
  - Change: added a small defensive sys.path insertion in the `__main__` guard so the script can be executed directly in case someone runs it from `app/`.
  - Why: avoids a common developer error causing ModuleNotFoundError when executing the script from the wrong folder.

- eduz_backend/app/core/database.py
  - Note: I earlier tried to make a dev-friendly fallback to SQLite but you restored this file; because you are using PostgreSQL and already created the DB, I left it aligned with your repo state. Make sure `DATABASE_URL` is set in `.env` and `psycopg2` (or `psycopg2-binary`) is installed in the venv.

- Samplefrontend/src/pages/Login.tsx
  - Change: replaced `FormData` with `URLSearchParams` to send credentials as `application/x-www-form-urlencoded` which FastAPI's OAuth2 expects. When the login response contains a `user` object, use that to avoid a `/users/me` call.
  - Why: fixes OAuth2 form encoding mismatch.

What I did NOT change
- I did not change major data model shapes beyond adding the `gce_id` field.
- I did not modify Alembic migration files. If you need schema migration for the `gce_id` column, we should create and run an Alembic revision.

Verification steps (PowerShell) — run these locally

1) Activate the backend virtualenv (from repo folder `eduz_backend`):
```powershell
Set-Location 'C:\Users\Dell\Documents\Files\GitHub\EduZ\eduz_backend'
& '.\env\Scripts\Activate.ps1'
```

2) Install dependencies (if not already):
```powershell
pip install -r requirements.txt
# For Postgres driver on Windows prefer the binary wheel if building fails
pip install psycopg2-binary
```

3) Create/verify the Postgres database exists (example):
```powershell
# using psql (adapt user/password/host/port)
psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE eduz_db;"
```
(If you already created the database, skip this step.)

4) Create a `.env` in `eduz_backend` containing at least:
```
DATABASE_URL=postgresql+psycopg2://<db_user>:<db_password>@<db_host>:<db_port>/<db_name>
SECRET_KEY=change-this-to-a-secure-random-string
```

5) Apply migrations (preferred):
```powershell
# from eduz_backend folder (package root)
alembic upgrade head
```
If you prefer to create tables directly (not recommended if you plan to use migrations):
```powershell
python -m app.db.init_db
```

6) Start the backend and verify:
```powershell
uvicorn main:app --reload --host 127.0.0.1 --port 8000
# open http://127.0.0.1:8000/docs
```

7) Quick smoke tests (use httpie, curl, or a small script). Example curl for login (note urlencoded body):
```powershell
# urlencoded login
curl -X POST http://127.0.0.1:8000/users/login -d "username=you@example.com&password=Secret123!" -H "Content-Type: application/x-www-form-urlencoded"
```
You should get back an object with `access_token` and `user` keys.

If login succeeds, try starting a quiz (authenticated request):
- Use the returned access token as `Authorization: Bearer <token>` and POST to `/quiz/start` with JSON body e.g. `{ "subject_id": 1, "num_questions": 3 }`.

Notes about migrations and `gce_id`
- Because I added `gce_id` to `Subject`, you should add an Alembic revision to reflect that change in the DB. Example (from `eduz_backend` folder):
```powershell
alembic revision --autogenerate -m "add gce_id to subjects"
alembic upgrade head
```
If you prefer to avoid migration in dev, you can run `python -m app.db.init_db` to create tables anew (this will only help on a clean DB).

Next recommended tasks (optional)
- Create an Alembic migration for the `gce_id` change.
- Update `requirements.txt` to ensure `psycopg2-binary` is included for Windows devs.
- Add a small integration test that exercises login → start quiz → submit quiz flows.
- Optionally return the role inside the Token response model (update Pydantic schemas) to make the API contract explicit.

Files I created
- RECAP.md (this file) — summary of applied changes and verification steps.

What I can do next (pick one)
- I can create an Alembic migration for the `gce_id` addition and commit it.
- I can run tests and migrations inside the workspace (requires running pip install / alembic / pytest commands here — confirm if you want me to run them).
- I can update `requirements.txt` to add `psycopg2-binary` and add `.env.example`.




