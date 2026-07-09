# Backend API Tests

The server test suite uses Jest and Supertest to exercise the main Express API flows against the existing PostgreSQL connection.

## Setup

Install dependencies from the `server/` folder:

```bash
npm install
```

The tests expect the backend `.env` database settings to point at a PostgreSQL database that has the normal project schema and demo users:

- `dana.teacher@examapp.test / 123456`
- `alice.student@examapp.test / 123456`
- `admin@examapp.test / 123456`

## Run

From `server/`:

```bash
npm test
```

The `test` script should run:

```bash
jest --runInBand
```

## Covered Flows

- Health endpoint
- Login success and failure
- Current user lookup with JWT
- Teacher exam load/create/update
- Student published exam loading
- Student submission start and submit
- Teacher/admin submission viewing
- Teacher/admin grading and result publishing
- Student published result viewing
