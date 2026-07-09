# Testing Guide

## Demo Users

| Role | Email | Password |
| --- | --- | --- |
| Teacher | `dana.teacher@examapp.test` | `123456` |
| Student | `alice.student@examapp.test` | `123456` |
| Admin | `admin@examapp.test` | `123456` |

## Run With Docker Compose

From the project root:

```bash
docker compose up --build
```

Open the frontend:

```text
http://localhost:3000/FullStack_React/
```

Check the backend:

```text
http://localhost:5000/api/health
```

Database details:

```text
Host: localhost
Port: 5432
Database: examapp
User: postgres
Password: postgres
```

To reset the database and rerun seed files:

```bash
docker compose down -v
docker compose up --build
```

## Run Locally Without Docker

Start PostgreSQL manually and make sure the backend `.env` points to the correct database.

Backend:

```bash
cd server
npm install
npm run dev
```

Frontend:

```bash
cd client
npm install
npm run dev
```

## Authentication Test

1. Open the frontend.
2. Login as the teacher:
   - Email: `dana.teacher@examapp.test`
   - Password: `123456`
3. Confirm the dashboard appears.
4. Logout.
5. Login as the student:
   - Email: `alice.student@examapp.test`
   - Password: `123456`
6. Confirm the dashboard appears.

Expected result:

- Login succeeds.
- JWT token and current user are saved in browser localStorage.
- Logout clears authentication data.

## Teacher Exam Test

1. Login as the teacher.
2. Open `Teacher Exams`.
3. Create a new exam with title, description, duration, and `draft` status.
4. Add a multiple choice question.
5. Change status to `published`.
6. Refresh the page.

Expected result:

- The exam remains saved.
- Questions remain saved.
- Published exams can be seen by students.

## Student Submission Test

1. Login as the student.
2. Open `Student Exams`.
3. Start a published exam.
4. Answer all questions.
5. Submit the exam.
6. Return to the exam list.
7. Check `My Submissions / Results`.

Expected result:

- Submission is saved.
- The submission appears in the student's submissions list.

## Teacher Grading Test

1. Login as the teacher.
2. Open `Teacher Exams`.
3. Click `Submissions` on an exam.
4. Click `Review / Grade` for a student submission.
5. Enter a score and feedback.
6. Click `Save Grade`.
7. Click `Publish Result`.

Expected result:

- Grade is saved.
- Result can be published.
- Student can view the published result.

## Student Result Test

1. Login as the student.
2. Open `Student Exams`.
3. Check `My Submissions / Results`.
4. Click `View Result`.

Expected result:

- Published score is displayed.
- Feedback is displayed.
- Answer feedback is displayed if returned by the backend.

## Common Issues

### Frontend white screen in Docker

Open:

```text
http://localhost:3000/FullStack_React/
```

The production frontend is built with the Vite base path `/FullStack_React/`.

### Port already in use

Default ports:

- Frontend: `3000`
- Backend: `5000`
- PostgreSQL: `5432`

Stop any existing service that is already using one of those ports.
