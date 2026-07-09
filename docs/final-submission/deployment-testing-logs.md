# Deployment, Testing, and Logs

## Docker Deployment

From the project root:

```bash
docker compose up --build
```

Expected application URLs:

```text
Frontend: http://localhost:3000/FullStack_React/
Backend health: http://localhost:5000/api/health
```

## Local Development

Start only PostgreSQL:

```bash
docker compose up -d postgres
```

Start the backend:

```bash
cd server
npm run dev
```

Start the frontend:

```bash
cd client
npm run dev
```

## Testing Commands

Frontend lint:

```bash
cd client
npm run lint
```

Frontend production build:

```bash
cd client
npm run build
```

Backend tests:

```bash
cd server
npm test
```

## What Each Check Proves

| Command | Purpose |
| --- | --- |
| `npm run lint` in `client/` | Checks frontend code quality, including React hook rules |
| `npm run build` in `client/` | Confirms the production frontend build succeeds |
| `npm test` in `server/` | Runs backend API tests |
| `/api/health` | Confirms the backend process is running and reachable |

## Logs to Show During Demo

### Docker Logs

Use Docker logs to confirm that services started correctly:

```bash
docker compose logs
```

Useful focused logs:

```bash
docker compose logs server
docker compose logs client
docker compose logs postgres
```

What to look for:

- PostgreSQL starts successfully.
- Backend connects to the database.
- Backend listens on its configured port.
- Client container starts and serves the frontend.
- No repeated crash or restart loop appears.

### Backend Health Endpoint

Open:

```text
http://localhost:5000/api/health
```

Expected meaning:

- The backend server is reachable.
- The API is running.
- This is a quick first check before testing login and workflows.

### Server Console Logs

When running locally with:

```bash
cd server
npm run dev
```

Use the terminal output to check:

- Server startup message.
- Database connection messages if logged by the project.
- API request logs if enabled.
- Error messages if a request fails.

### Test Output

When running:

```bash
cd server
npm test
```

The test output should show which suites passed or failed. During the demo explanation, describe that backend tests are used to verify important API behavior such as health checks, authentication, protected routes, and exam workflows covered by the implemented test files.

## Deployment Configuration Notes

- Docker Compose defines the services needed for the project.
- PostgreSQL runs as a database service.
- The backend uses environment variables for database and JWT configuration.
- The frontend is built and served separately from the backend.
- The frontend calls the backend API through configured API URLs.

## Troubleshooting Checklist

| Problem | What to Check |
| --- | --- |
| Frontend does not load | Confirm client container is running and open the correct URL |
| Backend health fails | Check server logs and backend port |
| Login fails | Confirm backend is running, database is seeded, and credentials are correct |
| Database errors | Confirm PostgreSQL container is healthy and environment variables match |
| Tests fail | Read the failed test name and compare expected API behavior with server logs |
