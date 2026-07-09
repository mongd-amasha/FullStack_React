# Final Project Summary

## Project Name

Full Stack Exam Management System

## Project Goal

The goal of this project is to provide a complete web-based exam management system. Teachers can create and publish exams, students can submit answers, and teachers can grade submissions and publish results.

## Main Features

### Authentication

- Login
- Registration
- JWT authentication
- Role-based behavior for teachers and students

### Teacher Features

- Create exams
- Edit exams
- Change exam status
- Add questions and answer options
- View submissions for an exam
- Review student submissions
- Save grades and feedback
- Publish results

### Student Features

- View available published exams
- Start an exam submission
- Answer questions
- Submit exam answers
- View submission history
- View published results and feedback

### Results and Grading

- Teachers grade submitted exams
- Teachers publish results
- Students see published results
- Feedback is displayed safely in the frontend

## Technologies

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, Bootstrap |
| Backend | Node.js, Express |
| Database | PostgreSQL |
| Authentication | JWT |
| Containerization | Docker Compose |
| Frontend production server | nginx |

## System Structure

```text
client/       React frontend
server/       Express backend API
db/final/     Final PostgreSQL schema and seed data
docs/final/   Final project documentation
```

## Docker Summary

Docker Compose starts:

- PostgreSQL database
- Express backend
- React production frontend served by nginx

Main URLs:

- Frontend: `http://localhost:3000/FullStack_React/`
- Backend health: `http://localhost:5000/api/health`
- Backend API base: `http://localhost:5000/api`

## Demo Accounts

| Role | Email | Password |
| --- | --- | --- |
| Teacher | `dana.teacher@examapp.test` | `123456` |
| Student | `alice.student@examapp.test` | `123456` |
| Admin | `admin@examapp.test` | `123456` |

## What The Project Demonstrates

This project demonstrates:

- Full stack React and Express development
- REST API design
- PostgreSQL relational database design
- Authentication and authorization with JWT
- Teacher/student role separation
- Docker-based project setup
- Clear final-project documentation and diagrams

## Future Improvements

Possible future improvements include:

- More question types
- More advanced teacher analytics
- Admin management screens
- Better timed-exam controls
- File upload support for written answers
