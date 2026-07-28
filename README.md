# Full Stack Exam Management System

Full stack final project for managing exams with teacher and student workflows.

## Fresh Clone And Run

Requirements:

- Docker Desktop or Docker Engine
- No personal Docker account is required
- No local PostgreSQL, Node.js, or developer-machine setup is required when using Docker

```bash
git clone <repository-url>
cd FullStack_React
git checkout dev
docker compose up --build
```

Open the app:

```text
http://localhost:3000/FullStack_React/
```

Health check:

```text
http://localhost:5000/api/health
```

## Demo Users

Use these seeded accounts for the teacher/student presentation flow:

| Role | Email | Password |
| --- | --- | --- |
| Teacher | `dana.teacher@examapp.test` | `123456` |
| Student | `alice.student@examapp.test` | `123456` |

The backend still keeps an internal admin seed user for protected API coverage, but the normal UI presentation is teacher and student focused.

## Reset The Docker Database

PostgreSQL uses the named Docker volume `postgres_data`. If you want a fresh seeded database:

```bash
docker compose down -v
docker compose up --build
```

On first run, Docker initializes PostgreSQL with:

- `db/final/001_final_schema.sql`
- `db/final/002_final_seed.sql`

## Project URLs

- App: http://localhost:3000/FullStack_React/
- API health: http://localhost:5000/api/health
- Backend API base URL: http://localhost:5000/api

## Docker Services

- `postgres` - PostgreSQL 16 database on port `5432`
- `server` - Express API on port `5000`
- `client` - React production build served by nginx on port `3000`

Database settings used by Docker:

| Setting | Value |
| --- | --- |
| Database | `examapp` |
| User | `postgres` |
| Password | `postgres` |
| Host from your computer | `localhost` |
| Host from backend container | `postgres` |

## Final Documentation

The final documentation package is:

- [docs/final-submission/README.md](docs/final-submission/README.md)

Database notes are in:

- [db/README.md](db/README.md)

## Verification Commands

Frontend:

```bash
cd client
npm run lint
npm run build
```

Backend:

```bash
cd server
npm test
```
