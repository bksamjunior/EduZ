EduZ — Context Snapshot

Purpose
-------
This file explains the current state of the EduZ repository so you can paste it into an LLM and get a full, accurate understanding of the project structure, recent changes, and where to look when modifying or debugging code.

Top-level layout
----------------
- README.md
- RECAP.md
- EDUZ_CONTEXT.md (this file)
- eduz_backend/  (FastAPI backend)
- Samplefrontend/ (React + Vite frontend)
- tests/ (pytest tests for backend)

Backend (eduz_backend)
----------------------
Language & stack
- Python 3.10+ (virtualenv under `env/` or `.venv/`)
- FastAPI for HTTP API
- SQLAlchemy ORM and Alembic for migrations
- PostgreSQL in production/dev (JSONB usage)
- Authentication: JWT tokens (jose) + OAuth2Password flow

Key files and folders
- `main.py` — FastAPI app entrypoint (uvicorn runs this)
- `requirements.txt` — Python dependencies
- `app/models.py` — SQLAlchemy models (User, Subject, Branch, Topic, Question, etc.)
  - Note: `Question.options` is mapped as `Column(JSON)` and corresponds to a JSONB column in Postgres.
- `app/schemas.py` — Pydantic request/response models
- `app/api/` — API route modules
  - `questions.py` — CRUD for questions (create/list endpoints). Recent edits removed double json.loads/json.dumps; it now stores/returns `options` as list types.
  - `quiz.py` — quiz flow: `/quiz/start`, `/quiz/submit`, `/quiz/result`.
    - Recent changes: reads `options` as JSON, robust normalization for `correct_option` vs submitted answers, debug prints for verification, scoring fixes.
  - `users.py` — registration/login and promote user endpoint.
- `app/core/` — infrastructure
  - `database.py` — DB session management
  - `auth.py` — dependency helpers: `get_current_user` and `require_role` (recently made case-insensitive)
  - `security.py` — password hashing and token creation/decoding
- `app/db/init_db.py` — helper to create tables (not a migration)
- `bulk_insert_cs_questions.py` — helper script for bulk-loading questions

Recent backend changes (important)
- `Question.options` changed to JSON (SQLAlchemy `JSON`) and app now expects `List[str]`.
- Removed legacy serialization/deserialization in endpoints where it caused double-parsing errors.
- Implemented a normalization routine in `submit_quiz` to compare stored `correct_option` values and submitted answers robustly:
  - Decodes JSON-encoded string literals when present (e.g. `"0\\n1\\n2"`).
  - Strips surrounding quotes, replaces escaped newlines and commas with spaces, collapses whitespace, lowercases, tokenizes.
  - Multi-select answers are compared as order-insensitive token sets.
- `require_role` now normalizes role strings to lowercase to avoid accidental 403 responses caused by case/whitespace mismatches.

Data migration notes
- There are legacy rows where `options` or `correct_option` were stored as text with embedded commas, letter prefixes (A), B), etc.), or JSON-encoded quoted strings. A safe approach was prepared:
  - Backup `questions` table.
  - Restore into text column if needed.
  - Use a `parse_lettered_options(text) RETURNS jsonb` PL/pgSQL function to parse complex strings into JSON arrays (handles parentheses and embedded commas).
  - Replace `options` with parsed JSONB and verify with SELECT queries.
- If you want, a Python script or SQL snippet can be provided to run this one-off normalization.

Frontend (Samplefrontend)
-------------------------
Language & stack
- React (TypeScript), Vite, MUI (Material UI)
- Axios for API calls (authorization header attached from a small user store)

Key files
- `src/App.tsx` — routes and ProtectedRoute wrapper using `useUserStore()`
- `src/api/index.ts` — axios instance that attaches Authorization header
- `src/pages/` — page components (StudentDashboard, TeacherDashboard, QuizPage, QuizPrepPage, AddQuestionPage, etc.)
- `src/components/NavBar.tsx` — top navigation bar
- `src/components/PageContainer.tsx` — (added) wrapper that centers page content and accounts for AppBar height
- `src/index.css` — global styles (was adjusted to remove `body { display:flex }` which caused layout problems)

Recent frontend changes and fixes
- `PageContainer` was added and used in `App.tsx` route wrappers to ensure consistent, centered page layout across the app.
- `index.css` had `display:flex` on `body` which prevented per-page centering; it was removed so pages center correctly.
- Frontend expects `options` as `string[]` and sends the selected option text in the quiz submission payload. No changes to API contract were required beyond the backend now returning lists.

How the quiz flow works (end-to-end)
- Frontend `QuizPage` POSTs to `/quiz/start` with selection params (subject/topic/branch and `num_questions`).
- Backend selects appropriate questions from DB (joins to Topic/Subject), creates a `Quiz_session` and returns an array of questions (without `correct_option` included).
- Frontend displays questions; when user submits answers it posts to `/quiz/submit` with `quiz_session_id` and an array of `{ question_id, selected_option }` where `selected_option` is the option text.
- Backend `submit_quiz` compares submitted text with stored `correct_option` (recent changes normalize both) and computes score.

Auth & roles
- Login (`/users/login`) returns an access token and small `user` object (id, role, email) to avoid an extra `/users/me` call.
- `require_role(...)` checks current user's role; it is now case-insensitive.

How to run (local dev)
1. Backend (from `eduz_backend`):
```powershell
Set-Location 'C:\Users\Dell\Documents\Files\GitHub\EduZ\eduz_backend'
& '.\env\Scripts\Activate.ps1'   # or activate your venv
pip install -r requirements.txt
# ensure DATABASE_URL is set in .env
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```
2. Frontend (from `Samplefrontend`):
```powershell
Set-Location 'C:\Users\Dell\Documents\Files\GitHub\EduZ\Samplefrontend'
npm install
npm run dev
```

Testing
- The backend includes `tests/` using pytest — some tests were updated to expect `options` as lists rather than JSON strings.
- Run tests (after installing dev requirements and ensuring DB/test DB is configured):
```powershell
# from eduz_backend
pytest -q
```

Known issues & TODOs
- Data cleanup: legacy question rows need conversion to consistent JSON arrays for `options` and normalized `correct_option` text — a one-off script is recommended.
- Logging: debug prints were added to scoring logic to aid verification. Replace with structured logging and reduce verbosity when validated.
- ProtectedRoute role checks rely on `useUserStore()` — ensure the frontend store contains the token and role after login.

Files to inspect first when debugging quiz/option issues
- `eduz_backend/app/models.py` — data model definitions
- `eduz_backend/app/api/questions.py` — creation and listing of questions
- `eduz_backend/app/api/quiz.py` — start/submit/result logic and normalization helpers
- `Samplefrontend/src/pages/QuizPage.tsx` — how options are rendered and answers submitted
- `Samplefrontend/src/components/PageContainer.tsx` and `src/index.css` — layout issues


-- End of context snapshot
