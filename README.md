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
