# Final Submission Package

This folder contains the final documentation package for the Full Stack Exam Management System project.

The project is a full stack exam management application with a React frontend, Express backend, PostgreSQL database, JWT authentication, role-based access, teacher exam management, student exam submission, and grading/results workflows.

## Demo Users

Use these seeded demo accounts during the presentation:

| Role | Email | Password |
| --- | --- | --- |
| Teacher | dana.teacher@examapp.test | 123456 |
| Student | alice.student@examapp.test | 123456 |

The admin seed account is internal and is not part of the normal presentation flow.

## Documentation Index

- [Project Overview](./project-overview.md)
- [System Architecture](./system-architecture.md)
- [Client Architecture](./client-architecture.md)
- [Server Architecture](./server-architecture.md)
- [Database ERD](./database-erd.md)
- [OOP UML](./oop-uml.md)
- [API and Features](./api-and-features.md)
- [Sequence Diagrams](./sequence-diagrams.md)
- [Milestones](./milestones.md)
- [Deployment, Testing, and Logs](./deployment-testing-logs.md)
- [Demo Video Plan](./demo-video-plan.md)

## Quick Run Instructions

### Docker

From the project root:

```bash
docker compose up --build
```

Open:

```text
Frontend: http://localhost:3000/FullStack_React/
Backend health: http://localhost:5000/api/health
```

Reset to a fresh seeded database:

```bash
docker compose down -v
docker compose up --build
```

### Local Development

Start PostgreSQL:

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

## Required Checks

```bash
cd client
npm run lint
npm run build
```

```bash
cd server
npm test
```

## Submission Notes

The documentation is organized to match the final project requirements:

- Main features and APIs
- System architecture and data flow
- Separate client/server architecture
- Backend MVC structure and packages
- Database ERD and JSON model examples
- OOP UML/class diagram
- Three main sequence diagrams
- Milestones and project stages
- Docker, testing, logs, and demo plan
