# API and Features

## Feature Summary

| Area | Implemented Project Behavior |
| --- | --- |
| Authentication | Users log in with email/password and receive a JWT-backed session |
| Role Navigation | UI changes based on teacher, student, or admin role |
| Teacher Exams | Teacher can create, edit, list, and update exam status |
| Question Management | Teacher can load question types and add questions/options to an exam |
| Student Exams | Student can view exams, start an exam, answer questions, and submit |
| Submissions | Student submissions are stored and can be reviewed |
| Results | Teacher can grade submissions and publish results; students can view results |
| Database | PostgreSQL persists users, exams, questions, submissions, answers, and results |
| Docker | Docker Compose starts the stack for final presentation |
| Testing | Backend API tests and frontend lint/build checks are included |

## API Groups

The project uses REST-style API groups. Endpoint names below describe the implemented areas and expected responsibilities; exact route file names may differ.

### Health

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Confirm the backend is running |

### Authentication

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Log in with email and password |
| `POST` | `/api/auth/register` | Register a user where enabled by the project |
| `GET` | `/api/auth/me` | Return the current authenticated user where enabled |

### Exams

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/exams` | List exams available to the current user |
| `POST` | `/api/exams` | Create an exam as a teacher |
| `PUT` | `/api/exams/:id` | Update exam details as a teacher |
| `PATCH` | `/api/exams/:id/status` | Update exam status, such as draft or published |

### Questions

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/question-types` | Load supported question types |
| `GET` | `/api/exams/:examId/questions` | Load questions for an exam |
| `POST` | `/api/exams/:examId/questions` | Add a question to an exam as a teacher |

### Submissions

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/exams/:examId/submissions/start` | Start a student submission |
| `POST` | `/api/submissions/:submissionId/answers` | Submit student answers |
| `GET` | `/api/submissions/my` | Load the current student's submissions |
| `GET` | `/api/exams/:examId/submissions` | Load exam submissions as a teacher |

### Results

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/results/my` | Load current student's results |
| `GET` | `/api/results/:id` | Load a result detail where allowed |
| `GET` | `/api/submissions/:submissionId/result` | Load result by submission |
| `POST` | `/api/submissions/:submissionId/grade` | Save teacher grade and feedback |
| `PATCH` | `/api/results/:id/publish` | Publish a result |

## Main Workflow Details

### Teacher Exam Management

1. Teacher logs in.
2. Teacher opens the exam management screen.
3. Teacher creates or edits an exam.
4. Teacher adds questions and answer options.
5. Teacher publishes the exam when it is ready.

### Student Exam Submission

1. Student logs in.
2. Student opens the available exams screen.
3. Student starts an exam.
4. Backend creates a submission.
5. Student answers all questions.
6. Student submits answers.

### Grading and Results

1. Teacher opens submissions for an exam.
2. Teacher reviews a student's submission.
3. Teacher saves score and feedback.
4. Teacher publishes the result.
5. Student opens results and views score/feedback.

## Security Notes

- Protected API requests require a valid JWT.
- Role-specific backend routes should validate that the authenticated user has the required role.
- Frontend role navigation improves UX, but backend authorization remains the important security layer.
- Passwords should be stored as hashes, not plain text.
- Private environment values should stay in local `.env` files and should not be exposed publicly.
