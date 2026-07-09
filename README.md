# Full Stack Exam Management System

## Docker Setup

This project can run with Docker Compose using three services:

- `postgres` - PostgreSQL 16 database
- `server` - Express API on port `5000`
- `client` - React production build served by nginx on port `3000`

### Start The Project

```bash
docker compose up --build
```

### URLs

- App: http://localhost:3000
- API health: http://localhost:5000/api/health
- Backend API base URL: http://localhost:5000/api

### Database

- Host from your computer: `localhost`
- Host from backend container: `postgres`
- Port: `5432`
- Database: `examapp`
- User: `postgres`
- Password: `postgres`

PostgreSQL uses the named volume `postgres_data` for persistence.

On the first run, Docker initializes the database with:

- `db/final/001_final_schema.sql`
- `db/final/002_final_seed.sql`

If the database volume already exists, PostgreSQL will not rerun the init SQL files automatically. To recreate the database from seed data, stop the stack and remove the volume:

```bash
docker compose down -v
docker compose up --build
```

## Final Project Documentation

This repository includes final-project documentation under `docs/final/`.

- [Architecture](docs/final/architecture.md)
- [Database Design](docs/final/database-design.md)
- [API Documentation](docs/final/api-documentation.md)
- [User Flows](docs/final/user-flows.md)
- [Testing Guide](docs/final/testing-guide.md)
- [Final Project Summary](docs/final/final-project-summary.md)

### Demo Users

| Role | Email | Password |
| --- | --- | --- |
| Teacher | `dana.teacher@examapp.test` | `123456` |
| Student | `alice.student@examapp.test` | `123456` |
| Admin | `admin@examapp.test` | `123456` |
## Final Submission Package

The final project documentation package is available at:

- [docs/final-submission/README.md](docs/final-submission/README.md)
