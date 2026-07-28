# Database Folder

`db/final/` is the final database version used by Docker Compose.

Docker initializes a fresh PostgreSQL volume with:

- `db/final/001_final_schema.sql`
- `db/final/002_final_seed.sql`

`db/final/003_final_queries.sql` is kept as a useful presentation/query reference, but Docker does not run it automatically.

To recreate the database from the final schema and seed:

```bash
docker compose down -v
docker compose up --build
```

The older root-level SQL drafts were removed to keep the submission focused on the final database package.
