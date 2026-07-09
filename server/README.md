# Exam Management Server

## Backend API Tests

The backend includes Jest + Supertest API tests under `server/tests/`.

Install dependencies and run the tests from the `server/` folder:

```bash
npm install
npm test
```

The tests use the existing PostgreSQL connection from `.env` and expect the normal demo accounts to exist:

- `dana.teacher@examapp.test / 123456`
- `alice.student@examapp.test / 123456`
- `admin@examapp.test / 123456`

See `README_TESTS.md` for the full test notes.
