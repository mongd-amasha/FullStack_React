# User Flows

## Authentication Flow

```mermaid
flowchart TD
  A[Open app] --> B[Login screen]
  B --> C[Enter email and password]
  C --> D[POST /api/auth/login]
  D --> E{Valid credentials?}
  E -->|No| F[Show error message]
  E -->|Yes| G[Save user and JWT token]
  G --> H{User role}
  H -->|Teacher| I[Teacher dashboard]
  H -->|Student| J[Student dashboard]
  H -->|Admin| K[Admin-capable account]
```

## Teacher Workflow

```mermaid
flowchart TD
  A[Teacher logs in] --> B[Open Teacher Exams]
  B --> C[Create or edit exam]
  C --> D[Add questions and options]
  D --> E[Publish exam]
  E --> F[Students submit answers]
  F --> G[Open exam submissions]
  G --> H[Review submission]
  H --> I[Save grade and feedback]
  I --> J[Publish result]
```

## Teacher Features

Teachers can:

- Create and edit exams
- Change exam status
- Add questions and options
- View submissions for an exam
- Review student submissions
- Save score and feedback
- Publish results

## Student Workflow

```mermaid
flowchart TD
  A[Student logs in] --> B[Open Student Exams]
  B --> C[View published exams]
  C --> D[Start exam]
  D --> E[Load questions]
  E --> F[Answer questions]
  F --> G[Submit exam]
  G --> H[Submission saved]
  H --> I[Teacher grades submission]
  I --> J[Teacher publishes result]
  J --> K[Student views result]
```

## Student Features

Students can:

- View available exams
- Start an exam submission
- Answer multiple choice or text questions
- Submit answers
- View submission history
- View published results and feedback

## Result Publishing Flow

```mermaid
sequenceDiagram
  participant S as Student
  participant C as React Client
  participant API as Express API
  participant T as Teacher

  S->>C: Submit exam answers
  C->>API: POST /api/submissions/:id/submit
  API-->>C: Submission saved
  T->>C: Open exam submissions
  C->>API: GET /api/submissions/exam/:examId
  API-->>C: Submissions list
  T->>C: Save grade
  C->>API: POST /api/results/submission/:id/grade
  API-->>C: Result saved
  T->>C: Publish result
  C->>API: PATCH /api/results/:resultId/publish
  API-->>C: Result published
  S->>C: View results
  C->>API: GET /api/results/my
  API-->>C: Published results
```
