# Milestones and Project Stages

## Milestone 1: Project Planning

Main goals:

- Define the exam management system idea.
- Identify user roles: teacher, student, and admin.
- Define the core entities: users, exams, questions, submissions, answers, and results.
- Choose the technology stack: React, Express, PostgreSQL, JWT, Docker.

Deliverables:

- Initial project structure.
- Basic requirements and feature list.
- First database model direction.

## Milestone 2: Backend Foundation

Main goals:

- Create the Express backend.
- Configure environment variables.
- Connect to PostgreSQL.
- Add health endpoint.
- Build authentication endpoints.
- Add JWT middleware.

Deliverables:

- Running backend API.
- Database connection.
- Login flow.
- Protected route foundation.

## Milestone 3: Database and Domain Model

Main goals:

- Create database schema for the main entities.
- Seed demo users and sample data where needed.
- Add relations between exams, questions, submissions, and results.

Deliverables:

- PostgreSQL schema.
- Demo users for teacher, student, and admin.
- Data relationships ready for API workflows.

## Milestone 4: Frontend Foundation

Main goals:

- Create the React client with Vite.
- Add app-level navigation and role-based screens.
- Add login/register UI.
- Add shared styling and polished layout.

Deliverables:

- Working frontend shell.
- Login portal.
- Role-based navigation.
- Initial dashboard views.

## Milestone 5: Teacher Exam Management

Main goals:

- Build teacher exam list.
- Add create/edit exam form.
- Support exam status updates.
- Add question management.
- Connect the teacher UI to backend exam APIs.

Deliverables:

- Teacher can manage exams.
- Teacher can add questions and options.
- Teacher can publish or close exams.

## Milestone 6: Student Exam Submission

Main goals:

- Build student exam list.
- Load exam questions.
- Start a submission.
- Submit multiple choice or text answers.
- Show submission success state.

Deliverables:

- Student can view available exams.
- Student can start and submit an exam.
- Submission data is stored through the backend.

## Milestone 7: Results and Grading

Main goals:

- Allow teacher to view submissions for an exam.
- Allow teacher to review a student's submission.
- Save score and feedback.
- Publish results.
- Allow student to view result details.

Deliverables:

- Teacher grading workflow.
- Student result viewing workflow.
- Result feedback shown in the UI.

## Milestone 8: Testing, Docker, and Final Polish

Main goals:

- Add backend API tests.
- Add Docker Compose setup.
- Verify frontend lint and build.
- Improve UI layout and user experience.
- Prepare final documentation package.

Deliverables:

- Docker run instructions.
- Backend test command.
- Client lint/build commands.
- Final submission documentation.

## Final Demo Checklist

- Start the app with Docker Compose.
- Confirm backend health endpoint works.
- Log in as teacher.
- Create or open an exam.
- Add/check questions.
- Publish the exam.
- Log in as student.
- Start and submit the exam.
- Log in as teacher again.
- Grade and publish the result.
- Log in as student again.
- View the result and feedback.
