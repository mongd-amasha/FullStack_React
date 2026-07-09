# Project Overview

## Project Name

Full Stack Exam Management System

## Purpose

The system helps teachers create and manage exams, helps students take exams online, and supports grading and result publication. It is designed as a final full stack project that demonstrates frontend development, backend API design, database modeling, authentication, authorization, testing, and Docker-based deployment.

## Main Users

| User Type | Main Responsibilities |
| --- | --- |
| Teacher | Create exams, publish exams, manage questions, review submissions, grade results, publish feedback |
| Student | View available exams, start an exam, submit answers, view published results |
| Admin | Access the admin role in the system and support administrative flows where available |

## Demo Users

| Role | Email | Password |
| --- | --- | --- |
| Teacher | dana.teacher@examapp.test | 123456 |
| Student | alice.student@examapp.test | 123456 |
| Admin | admin@examapp.test | 123456 |

## Main Features

- JWT-based login and protected API access
- Role-based navigation and login portal behavior
- Teacher dashboard and exam management
- Exam creation, editing, status updates, and publishing
- Question management with question types and multiple choice options
- Student exam list and exam-taking workflow
- Student answer submission workflow
- Teacher submission review and grading workflow
- Student result viewing workflow
- PostgreSQL persistence
- Docker Compose setup for the application stack
- Backend API tests
- Client linting and production build checks

## Technology Stack

| Layer | Technology |
| --- | --- |
| Client | React, Vite, Bootstrap, custom CSS |
| Server | Node.js, Express |
| Database | PostgreSQL |
| Authentication | JWT |
| Deployment | Docker Compose |
| Testing | Backend API tests, client lint/build checks |

## Project Goals

1. Build a working full stack application with clear separation between frontend, backend, and database.
2. Implement authentication and role-based access for teacher, student, and admin users.
3. Model exams, questions, submissions, answers, and results in a relational database.
4. Provide realistic workflows for exam publishing, exam submission, grading, and result viewing.
5. Package the system with clear run, test, and deployment instructions.

## Scope Notes

This project focuses on the core exam management workflow. It does not claim to include every feature of a commercial learning management system, such as live proctoring, advanced analytics, payment systems, email notifications, or external identity providers.
