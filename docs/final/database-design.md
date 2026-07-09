# Database Design

## Overview

The database is PostgreSQL. The final schema and seed data are stored in:

- `db/final/001_final_schema.sql`
- `db/final/002_final_seed.sql`

The database stores users, exams, questions, submissions, answers, results, and feedback. The design separates exam content from student submissions and teacher grading.

## Main Tables

### users

Stores application users.

Important fields:

- `id`
- `full_name`
- `email`
- `password_hash`
- `role`
- `is_active`

### exams

Stores exams created by teachers.

Important fields:

- `id`
- `teacher_id`
- `title`
- `description`
- `duration_minutes`
- `status`

Common statuses:

- `draft`
- `published`
- `closed`
- `archived`

### question_types

Stores supported question type definitions, such as multiple choice or text-style questions.

### questions

Stores questions that belong to an exam.

Important fields:

- `id`
- `exam_id`
- `question_type_id`
- `question_text`
- `points`
- `position`
- `metadata`

### question_options

Stores selectable answer options.

Important fields:

- `id`
- `question_id`
- `option_text`
- `is_correct`
- `position`

### submissions

Stores a student's attempt for an exam.

Important fields:

- `id`
- `exam_id`
- `student_id`
- `status`

### submission_answers

Stores submitted answers.

Important fields:

- `id`
- `submission_id`
- `question_id`
- `selected_option_id`
- `answer_text`

### results

Stores teacher grading and published result data.

Important fields:

- `id`
- `submission_id`
- `score`
- `feedback`
- `is_published`

### answer_feedback

Stores optional feedback for individual answers if returned by the backend.

## ERD-Style Diagram

```mermaid
erDiagram
  USERS ||--o{ EXAMS : creates
  USERS ||--o{ SUBMISSIONS : submits
  EXAMS ||--o{ QUESTIONS : contains
  QUESTION_TYPES ||--o{ QUESTIONS : classifies
  QUESTIONS ||--o{ QUESTION_OPTIONS : has
  EXAMS ||--o{ SUBMISSIONS : receives
  SUBMISSIONS ||--o{ SUBMISSION_ANSWERS : includes
  QUESTIONS ||--o{ SUBMISSION_ANSWERS : answered_by
  QUESTION_OPTIONS ||--o{ SUBMISSION_ANSWERS : selected
  SUBMISSIONS ||--o| RESULTS : graded_as
  RESULTS ||--o{ ANSWER_FEEDBACK : includes

  USERS {
    uuid id
    string full_name
    string email
    string role
    boolean is_active
  }

  EXAMS {
    uuid id
    uuid teacher_id
    string title
    string status
    int duration_minutes
  }

  QUESTION_TYPES {
    uuid id
    string code
    string name
  }

  QUESTIONS {
    uuid id
    uuid exam_id
    uuid question_type_id
    string question_text
    int points
    int position
  }

  QUESTION_OPTIONS {
    uuid id
    uuid question_id
    string option_text
    boolean is_correct
    int position
  }

  SUBMISSIONS {
    uuid id
    uuid exam_id
    uuid student_id
    string status
  }

  SUBMISSION_ANSWERS {
    uuid id
    uuid submission_id
    uuid question_id
    uuid selected_option_id
    string answer_text
  }

  RESULTS {
    uuid id
    uuid submission_id
    int score
    string feedback
    boolean is_published
  }

  ANSWER_FEEDBACK {
    uuid id
    uuid result_id
    string feedback_text
  }
```

## Seed Users

| Role | Email | Password |
| --- | --- | --- |
| Teacher | `dana.teacher@examapp.test` | `123456` |
| Student | `alice.student@examapp.test` | `123456` |
| Admin | `admin@examapp.test` | `123456` |
