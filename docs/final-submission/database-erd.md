# Database ERD and JSON Models

## Overview

The database is PostgreSQL. It stores users, roles, exams, questions, options, submissions, answers, and results. The backend owns all database access.

## Entity Relationship Diagram

```mermaid
erDiagram
    USERS {
        int id PK
        string email
        string password_hash
        string full_name
        string role
        timestamp created_at
    }

    EXAMS {
        int id PK
        int teacher_id FK
        string title
        text description
        int duration_minutes
        string status
        timestamp created_at
        timestamp updated_at
    }

    QUESTION_TYPES {
        int id PK
        string code
        string name
    }

    QUESTIONS {
        int id PK
        int exam_id FK
        int question_type_id FK
        text question_text
        int points
        int position
        json metadata
    }

    QUESTION_OPTIONS {
        int id PK
        int question_id FK
        text option_text
        boolean is_correct
        int position
    }

    SUBMISSIONS {
        int id PK
        int exam_id FK
        int student_id FK
        string status
        timestamp started_at
        timestamp submitted_at
    }

    SUBMISSION_ANSWERS {
        int id PK
        int submission_id FK
        int question_id FK
        int selected_option_id FK
        text answer_text
    }

    RESULTS {
        int id PK
        int submission_id FK
        numeric score
        text feedback
        string status
        timestamp published_at
    }

    USERS ||--o{ EXAMS : creates
    EXAMS ||--o{ QUESTIONS : contains
    QUESTION_TYPES ||--o{ QUESTIONS : categorizes
    QUESTIONS ||--o{ QUESTION_OPTIONS : has
    USERS ||--o{ SUBMISSIONS : submits
    EXAMS ||--o{ SUBMISSIONS : receives
    SUBMISSIONS ||--o{ SUBMISSION_ANSWERS : includes
    QUESTIONS ||--o{ SUBMISSION_ANSWERS : answered_by
    QUESTION_OPTIONS ||--o{ SUBMISSION_ANSWERS : selected_option
    SUBMISSIONS ||--o| RESULTS : produces
```

## Data Model Notes

- A teacher user can create many exams.
- An exam can contain many questions.
- A question belongs to a question type.
- Multiple choice questions can have multiple answer options.
- A student can create submissions for exams.
- A submission contains the student's answers.
- A result belongs to a submission and stores the grade and feedback.
- Exam status controls availability and lifecycle, for example draft, published, closed, or archived.

## Example JSON Models

### User

```json
{
  "id": 1,
  "email": "dana.teacher@examapp.test",
  "fullName": "Dana Teacher",
  "role": "teacher"
}
```

### Exam

```json
{
  "id": 10,
  "title": "JavaScript Basics",
  "description": "Short exam about JavaScript fundamentals",
  "durationMinutes": 60,
  "status": "published"
}
```

### Question

```json
{
  "id": 101,
  "examId": 10,
  "questionTypeId": 1,
  "questionText": "Which keyword declares a constant in JavaScript?",
  "points": 10,
  "position": 1,
  "metadata": {},
  "options": [
    {
      "id": 1001,
      "optionText": "const",
      "isCorrect": true,
      "position": 1
    },
    {
      "id": 1002,
      "optionText": "var",
      "isCorrect": false,
      "position": 2
    }
  ]
}
```

### Submission

```json
{
  "id": 200,
  "examId": 10,
  "studentId": 2,
  "status": "submitted",
  "startedAt": "2026-07-09T10:00:00.000Z",
  "submittedAt": "2026-07-09T10:20:00.000Z"
}
```

### Submission Answer

```json
{
  "id": 300,
  "submissionId": 200,
  "questionId": 101,
  "selectedOptionId": 1001,
  "answerText": null
}
```

### Result

```json
{
  "id": 400,
  "submissionId": 200,
  "score": 95,
  "feedback": "Strong work. Review one syntax detail.",
  "status": "published"
}
```
