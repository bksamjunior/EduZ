1. Offline MCQ Engine (Core Feature)
Students can:
Download MCQ sets per subject, topic, and grade level
Take quizzes offline (no internet)
Submit and receive immediate feedback with correction
Track basic progress and scores locally
2. Basic Adaptive Logic
If a student misses easy questions → repeat or reintroduce those questions later.
Simple rules only; no heavy ML yet.
3. Question Management (Admin/Teacher)
Admin or Teacher can:
Upload question sets via backend (CSV/JSON/manual form)
Categorize questions by subject, topic, and level
Flag approved vs. unapproved content
4. User System
Roles:
Student – uses the mobile app
Teacher/Admin – manages content from web/admin dashboard
Simple auth system (email/password or phone ID with JWT)
5. Data Sync Engine
Student quiz results are stored locally first
When online, data syncs to central server
Prioritize SQLite + background sync pattern
