# Final Database Schema

This folder contains the final-project PostgreSQL database design for the FullStack Exam Management System.

## Files

- `001_final_schema.sql` creates the final tables, constraints, indexes, and update triggers.
- `002_final_seed.sql` inserts sample users, exams, questions, submissions, grades, notifications, and audit logs.
- `003_final_queries.sql` contains useful demo queries for testing and presenting the project.

The final tables are created inside the PostgreSQL schema namespace `exam_app`. This keeps the final project database separate from older class-task tables that may already exist in `public`.

## What The Schema Supports

The schema supports three roles:

- `admin`: manages the system and users.
- `teacher`: creates exams, adds questions, publishes exams, reviews submissions, grades answers, and publishes results.
- `student`: views available exams, submits answers, and views grades and feedback.

Main features included:

- Users with role checks.
- Exams with draft, published, closed, and archived statuses.
- Question types: multiple choice, true/false, and short text.
- Questions and answer options.
- Student submissions and individual submitted answers.
- Grades/results and teacher feedback.
- Notifications for exam publishing, submissions, grades, and feedback.
- Audit logs for important system actions.

## Relational + JSONB Design

Most important project data is relational because it needs strong structure:

- users belong to roles
- exams belong to teachers
- questions belong to exams
- submissions belong to students and exams
- grades belong to submissions

The schema also uses JSONB where flexibility is useful:

- `questions.metadata` stores flexible question settings like difficulty, topics, accepted short-text answers, and shuffle settings.
- `submissions.answers_snapshot` preserves the submitted answer data exactly as it looked when the student submitted the exam.
- `audit_logs.details` stores action-specific details without needing a new table for every audit event type.
- `notifications.metadata` stores extra notification context, such as related exam, grade, or submission IDs.

This hybrid design keeps the core system reliable with foreign keys and constraints, while still allowing flexible final-project features.

## How To Run With Docker PostgreSQL

These commands assume you already have a Docker PostgreSQL container named `examapp-postgres` and a database named `fullstack_exam_management`.

From the project root, run the schema first:

```powershell
Get-Content .\db\final\001_final_schema.sql | docker exec -i examapp-postgres psql -U postgres -d fullstack_exam_management
```

Then run the seed data:

```powershell
Get-Content .\db\final\002_final_seed.sql | docker exec -i examapp-postgres psql -U postgres -d fullstack_exam_management
```

Then run the demo queries:

```powershell
Get-Content .\db\final\003_final_queries.sql | docker exec -i examapp-postgres psql -U postgres -d fullstack_exam_management
```

If the database does not exist yet, create it inside the existing container:

```powershell
docker exec -it examapp-postgres createdb -U postgres fullstack_exam_management
```

To open PostgreSQL manually:

```powershell
docker exec -it examapp-postgres psql -U postgres -d fullstack_exam_management
```

Inside `psql`, you can list the final project tables with:

```sql
\dt exam_app.*
```
