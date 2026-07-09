# System Architecture

## Project Goal

The Full Stack Exam Management System is a web application for managing online exams. It supports teacher exam creation, student exam submission, grading, result publishing, and role-based access using JWT authentication.

## Technologies Used

- Frontend: React, Vite, Bootstrap
- Backend: Node.js, Express
- Database: PostgreSQL
- Authentication: JWT
- Deployment/runtime: Docker Compose
- Static frontend serving: nginx

## High-Level Architecture

```mermaid
flowchart LR
  User[Teacher / Student / Admin] --> Browser[React Frontend]
  Browser -->|HTTP JSON API| API[Express Backend]
  API -->|SQL queries| DB[(PostgreSQL)]
  Browser -->|JWT in localStorage| Browser
  Browser -->|Authorization: Bearer token| API

  subgraph Docker Compose
    Nginx[client: nginx + React build]
    Server[server: Express API]
    Postgres[postgres: PostgreSQL 16]
  end

  Nginx --> Server
  Server --> Postgres
```

## Responsibilities

### Frontend

The React frontend is responsible for login/register screens, storing the JWT token, showing role-based pages, and sending authenticated API requests.

### Backend

The Express backend handles authentication, authorization, validation, exam APIs, submission APIs, result APIs, and database access.

### Database

PostgreSQL stores users, exams, questions, options, submissions, submitted answers, results, and feedback.

## Authentication Flow

```mermaid
sequenceDiagram
  participant U as User
  participant C as React Client
  participant A as Express API
  participant D as PostgreSQL

  U->>C: Enter email and password
  C->>A: POST /api/auth/login
  A->>D: Find user by email
  D-->>A: User record
  A->>A: Validate password and create JWT
  A-->>C: user + token
  C->>C: Save token and currentUser in localStorage
  C->>A: Authenticated requests with Bearer token
```

## Roles

- Teacher: manage exams, questions, submissions, grades, and published results
- Student: view available exams, submit answers, and view published results
- Admin: seeded for administrative access and future extension

## Docker Architecture

```mermaid
flowchart TB
  ClientPort[localhost:3000] --> Client[client container<br/>nginx serves React build]
  ApiPort[localhost:5000] --> Server[server container<br/>Express API]
  DbPort[localhost:5432] --> DB[(postgres container<br/>PostgreSQL 16)]
  Client -->|API calls to localhost:5000/api| Server
  Server -->|DB_HOST=postgres| DB
  Seed[db/final SQL seed files] --> DB
  Volume[(postgres_data volume)] --> DB
```

## URLs

- Frontend: `http://localhost:3000/FullStack_React/`
- Backend API: `http://localhost:5000/api`
- Health check: `http://localhost:5000/api/health`
