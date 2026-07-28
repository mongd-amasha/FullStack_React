# Final Database Schema

This folder contains the final PostgreSQL database package for the Full Stack Exam Management System.

## Files

- `001_final_schema.sql` creates the final tables, constraints, indexes, and update triggers.
- `002_final_seed.sql` inserts sample users, exams, questions, submissions, grades, notifications, and audit logs.
- `003_final_queries.sql` contains useful demo queries for testing and presenting the project.

Docker Compose runs only the schema and seed files automatically on a fresh PostgreSQL volume.

## Docker Usage

From the project root:

```bash
docker compose up --build
```

Reset and recreate the seeded database:

```bash
docker compose down -v
docker compose up --build
```

The Docker database name is `examapp`.

## Manual SQL Commands

If the Docker PostgreSQL container is already running, you can apply the files manually:

```powershell
Get-Content .\db\final\001_final_schema.sql | docker exec -i examapp-postgres psql -U postgres -d examapp
Get-Content .\db\final\002_final_seed.sql | docker exec -i examapp-postgres psql -U postgres -d examapp
Get-Content .\db\final\003_final_queries.sql | docker exec -i examapp-postgres psql -U postgres -d examapp
```

Open PostgreSQL manually:

```powershell
docker exec -it examapp-postgres psql -U postgres -d examapp
```

Inside `psql`, list the final project tables:

```sql
\dt exam_app.*
```

## Schema Scope

The final tables are created inside the PostgreSQL schema namespace `exam_app`.

The schema supports:

- Users with role checks
- Exams with draft, published, closed, and archived statuses
- Question types, questions, and answer options
- Student submissions and submitted answers
- Grades/results and teacher feedback
- Notifications and audit logs
- JSONB fields for flexible question metadata, submission snapshots, notification metadata, and audit details
