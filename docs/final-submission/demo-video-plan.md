# Demo Video Plan

## Goal

Record a clear final demo that explains what the project does, how it is built, and how the main workflows work from the perspective of teacher and student users.

Recommended length: 5 to 10 minutes, depending on teacher instructions.

## Demo Accounts

| Role | Email | Password |
| --- | --- | --- |
| Teacher | dana.teacher@examapp.test | 123456 |
| Student | alice.student@examapp.test | 123456 |

The demo should focus on the teacher and student flows.

## Suggested Video Structure

### 1. Short Introduction

Explain:

- Project name: Full Stack Exam Management System.
- Main purpose: teachers create exams, students submit exams, teachers grade, students view results.
- Tech stack: React, Express, PostgreSQL, JWT, Docker Compose.

### 2. Architecture Overview

Show or mention:

- `client/` is the React frontend.
- `server/` is the Express backend.
- `db/` contains database-related files.
- PostgreSQL stores the project data.
- The client communicates with the backend through REST APIs.
- JWT protects private routes.

### 3. Run the Project

Show the Docker command:

```bash
docker compose up --build
```

Open:

```text
http://localhost:3000/FullStack_React/
http://localhost:5000/api/health
```

Explain that the health endpoint confirms the backend is running.

### 4. Teacher Workflow

Log in as:

```text
dana.teacher@examapp.test / 123456
```

Show:

- Teacher dashboard or teacher navigation.
- Exam management page.
- Create or edit an exam.
- Check exam list.
- Add or review questions.
- Change exam status to published.
- Open submissions and grading area.

### 5. Student Workflow

Log in as:

```text
alice.student@examapp.test / 123456
```

Show:

- Student dashboard or student navigation.
- Available exams.
- Start an exam.
- Answer all questions.
- Submit the exam.
- Check submissions/results section.

### 6. Grading and Result Workflow

Return to the teacher user:

- Open submissions for the exam.
- Review the student's submission.
- Enter score and feedback.
- Save grade.
- Publish result.

Return to the student user:

- Open results.
- View score and feedback.

### 7. Testing and Quality

Show or explain these commands:

```bash
cd client
npm run lint
npm run build
```

```bash
cd server
npm test
```

Explain:

- Lint checks frontend quality and React hook rules.
- Build confirms the frontend production bundle works.
- Server tests verify important backend API behavior.

### 8. Closing Summary

Summarize:

- Full stack separation: React client, Express server, PostgreSQL database.
- Role-based workflows for teacher and student.
- Real exam lifecycle: create, publish, submit, grade, publish result.
- Docker and tests make the project easier to run and verify.

## Recording Tips

- Keep the browser zoom readable.
- Prepare the demo users before recording.
- Avoid spending too long on code unless required.
- If a command takes time, explain what it does while it runs.
- Show the final result from both teacher and student perspectives.
