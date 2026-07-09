# OOP UML / Class Diagram

## Overview

The project uses clear model concepts across the client, server, and database. The following UML diagram represents the main domain objects and their relationships.

```mermaid
classDiagram
    class User {
        +id
        +email
        +fullName
        +role
        +canAccess(role)
    }

    class Teacher {
        +createExam()
        +updateExam()
        +publishExam()
        +gradeSubmission()
    }

    class Student {
        +startExam()
        +submitAnswers()
        +viewResult()
    }

    class Exam {
        +id
        +title
        +description
        +durationMinutes
        +status
        +addQuestion()
        +changeStatus()
    }

    class Question {
        +id
        +questionText
        +points
        +position
        +metadata
    }

    class QuestionType {
        +id
        +code
        +name
    }

    class QuestionOption {
        +id
        +optionText
        +isCorrect
        +position
    }

    class Submission {
        +id
        +status
        +startedAt
        +submittedAt
        +submit()
    }

    class SubmissionAnswer {
        +id
        +selectedOptionId
        +answerText
    }

    class Result {
        +id
        +score
        +feedback
        +status
        +publish()
    }

    class AuthService {
        +login(email, password)
        +logout()
        +getCurrentUser()
    }

    class ExamApiService {
        +getExams()
        +createExam()
        +updateExam()
        +getExamQuestions()
        +addQuestion()
    }

    class SubmissionApiService {
        +startSubmission()
        +submitAnswers()
        +getMySubmissions()
    }

    class ResultApiService {
        +getMyResults()
        +getExamSubmissions()
        +gradeSubmission()
        +publishResult()
    }

    User <|-- Teacher
    User <|-- Student
    Teacher "1" --> "many" Exam : creates
    Exam "1" --> "many" Question : contains
    QuestionType "1" --> "many" Question : classifies
    Question "1" --> "many" QuestionOption : has
    Student "1" --> "many" Submission : creates
    Exam "1" --> "many" Submission : receives
    Submission "1" --> "many" SubmissionAnswer : includes
    Submission "1" --> "0..1" Result : has
    AuthService --> User
    ExamApiService --> Exam
    SubmissionApiService --> Submission
    ResultApiService --> Result
```

## Class Responsibilities

| Class / Concept | Responsibility |
| --- | --- |
| User | Shared identity data for all users |
| Teacher | Teacher-specific exam and grading actions |
| Student | Student-specific exam-taking actions |
| Exam | Exam metadata and lifecycle status |
| Question | Question content and scoring value |
| QuestionType | Type/category for questions |
| QuestionOption | Possible answer for multiple choice questions |
| Submission | Student attempt for an exam |
| SubmissionAnswer | One answer inside a submission |
| Result | Score, feedback, and publication status |
| AuthService | Login/logout and user session behavior |
| ExamApiService | Client API access for exams and questions |
| SubmissionApiService | Client API access for submissions |
| ResultApiService | Client API access for grading and results |

## OOP Principles Demonstrated

- Encapsulation: API and storage details are kept inside service classes/modules.
- Separation of concerns: UI components, services, routes, controllers, and database logic have separate responsibilities.
- Reuse: Shared user and domain model concepts are used across workflows.
- Abstraction: React components call service methods instead of building HTTP requests directly in every UI interaction.
