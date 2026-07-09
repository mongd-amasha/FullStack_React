# API Documentation

## Base URL

```text
http://localhost:5000/api
```

## Response Format

Successful responses use:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

Error responses use:

```json
{
  "success": false,
  "message": "Error message"
}
```

## Authentication Header

Protected endpoints require:

```http
Authorization: Bearer <token>
```

The frontend stores the token in `localStorage` after login or registration.

## Auth Endpoints

### POST /api/auth/login

Logs in an existing user.

Request:

```json
{
  "email": "dana.teacher@examapp.test",
  "password": "123456"
}
```

Response data:

```json
{
  "user": {
    "id": "user-id",
    "fullName": "Dana Teacher",
    "email": "dana.teacher@examapp.test",
    "role": "teacher"
  },
  "token": "jwt-token"
}
```

### POST /api/auth/register

Creates a new account.

Request:

```json
{
  "fullName": "New Student",
  "email": "new.student@example.com",
  "password": "123456",
  "role": "student"
}
```

### GET /api/auth/me

Returns the current authenticated user.

## Exam Endpoints

### GET /api/exams

Returns exams visible to the authenticated user.

- Teachers see exams they manage.
- Students see published/available exams.

### GET /api/exams/:examId

Returns one exam.

### POST /api/exams

Creates an exam. Teacher role required.

```json
{
  "title": "JavaScript Basics",
  "description": "Basic JavaScript exam",
  "durationMinutes": 60,
  "status": "draft"
}
```

### PUT /api/exams/:examId

Updates exam details. Teacher role required.

### PATCH /api/exams/:examId/status

Updates an exam status. Teacher role required.

```json
{
  "status": "published"
}
```

### GET /api/exams/question-types

Returns supported question types.

### GET /api/exams/:examId/questions

Returns questions and options for an exam.

### POST /api/exams/:examId/questions

Adds a question to an exam. Teacher role required.

```json
{
  "questionTypeId": "question-type-uuid",
  "questionText": "Which keyword declares a constant in JavaScript?",
  "points": 10,
  "position": 1,
  "metadata": {},
  "options": [
    {
      "optionText": "const",
      "isCorrect": true,
      "position": 1
    },
    {
      "optionText": "var",
      "isCorrect": false,
      "position": 2
    }
  ]
}
```

## Submission Endpoints

### POST /api/submissions/start

Starts a student submission.

```json
{
  "examId": "exam-uuid"
}
```

### POST /api/submissions/:submissionId/submit

Submits student answers.

```json
{
  "answers": [
    {
      "questionId": "question-uuid",
      "selectedOptionId": "option-uuid",
      "answerText": null
    }
  ]
}
```

### GET /api/submissions/my

Returns submissions for the logged-in student.

### GET /api/submissions/exam/:examId

Returns submissions for one exam. Teacher/admin role required.

## Result Endpoints

### GET /api/results/my

Returns published results for the logged-in student.

### GET /api/results/my/:resultId

Returns details for one published result.

### GET /api/results/submission/:submissionId

Returns grading details for a submission. Teacher/admin role required.

### POST /api/results/submission/:submissionId/grade

Saves a grade for a submission. Teacher/admin role required.

```json
{
  "score": 85,
  "feedback": "Good work. Review question 3."
}
```

### PATCH /api/results/:resultId/publish

Publishes a result so the student can view it.

### GET /api/results/exam/:examId

Returns results for an exam. Teacher/admin role required.

## Health Endpoint

### GET /api/health

Checks that the backend server is running.
