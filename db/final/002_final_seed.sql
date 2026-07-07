-- Final Project Seed Data: FullStack Exam Management System
-- Run this file after 001_final_schema.sql.

SET search_path TO exam_app, public;

BEGIN;

INSERT INTO users (id, full_name, email, password_hash, role)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'System Admin', 'admin@examapp.test', '$2a$10$placeholderhash', 'admin'),
  ('00000000-0000-0000-0000-000000000002', 'Dana Teacher', 'dana.teacher@examapp.test', '$2a$10$placeholderhash', 'teacher'),
  ('00000000-0000-0000-0000-000000000003', 'Eli Teacher', 'eli.teacher@examapp.test', '$2a$10$placeholderhash', 'teacher'),
  ('00000000-0000-0000-0000-000000000011', 'Alice Student', 'alice.student@examapp.test', '$2a$10$placeholderhash', 'student'),
  ('00000000-0000-0000-0000-000000000012', 'Ben Student', 'ben.student@examapp.test', '$2a$10$placeholderhash', 'student'),
  ('00000000-0000-0000-0000-000000000013', 'Cora Student', 'cora.student@examapp.test', '$2a$10$placeholderhash', 'student'),
  ('00000000-0000-0000-0000-000000000014', 'Noam Student', 'noam.student@examapp.test', '$2a$10$placeholderhash', 'student')
ON CONFLICT (id) DO NOTHING;

INSERT INTO question_types (id, code, name, description)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'multiple_choice', 'Multiple Choice', 'Student selects one answer from several options.'),
  ('10000000-0000-0000-0000-000000000002', 'true_false', 'True / False', 'Student selects true or false.'),
  ('10000000-0000-0000-0000-000000000003', 'short_text', 'Short Text', 'Student writes a short text answer for manual or assisted grading.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO exams (
  id,
  teacher_id,
  title,
  description,
  instructions,
  status,
  available_from,
  available_until,
  duration_minutes,
  total_points,
  passing_score,
  published_at
)
VALUES
  (
    '20000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    'SQL Fundamentals Midterm',
    'Covers SELECT queries, joins, constraints, and PostgreSQL data types.',
    'Answer all questions. Short text answers should be clear and concise.',
    'published',
    '2026-07-01 05:00:00+00',
    '2026-12-31 21:59:00+00',
    60,
    40,
    60,
    '2026-06-25 08:00:00+00'
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003',
    'React Basics Quiz',
    'Checks understanding of React components, hooks, and Vite development.',
    'Choose the best answer. Short text answers are graded by the teacher.',
    'published',
    '2026-07-01 05:00:00+00',
    '2026-11-30 21:59:00+00',
    35,
    30,
    70,
    '2026-06-28 09:00:00+00'
  ),
  (
    '20000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000002',
    'Final Project Defense Practice',
    'Practice exam for explaining the final full stack project.',
    'This exam is still in draft mode and is not visible to students yet.',
    'draft',
    NULL,
    NULL,
    45,
    30,
    70,
    NULL
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO questions (id, exam_id, question_type_id, question_text, points, position, metadata)
VALUES
  (
    '30000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'Which SQL command is used to read data from a table?',
    10,
    1,
    '{"difficulty": "easy", "topics": ["sql", "select"], "shuffle_options": true}'::jsonb
  ),
  (
    '30000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000002',
    'A primary key value must be unique in its table.',
    10,
    2,
    '{"difficulty": "easy", "topics": ["constraints", "primary_key"]}'::jsonb
  ),
  (
    '30000000-0000-0000-0000-000000000003',
    '20000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000003',
    'Name one PostgreSQL data type that is useful for flexible structured data.',
    10,
    3,
    '{"difficulty": "medium", "topics": ["postgresql", "jsonb"], "accepted_answers": ["JSONB"], "case_sensitive": false}'::jsonb
  ),
  (
    '30000000-0000-0000-0000-000000000004',
    '20000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'Which JOIN returns only rows that have matching values in both tables?',
    10,
    4,
    '{"difficulty": "medium", "topics": ["sql", "joins"], "shuffle_options": true}'::jsonb
  ),
  (
    '30000000-0000-0000-0000-000000000005',
    '20000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000001',
    'Which React hook is commonly used to store component state?',
    10,
    1,
    '{"difficulty": "easy", "topics": ["react", "hooks"], "shuffle_options": true}'::jsonb
  ),
  (
    '30000000-0000-0000-0000-000000000006',
    '20000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000002',
    'Vite can be used as a development tool for React applications.',
    10,
    2,
    '{"difficulty": "easy", "topics": ["vite", "react"]}'::jsonb
  ),
  (
    '30000000-0000-0000-0000-000000000007',
    '20000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000003',
    'What npm script is commonly used to start a Vite development server?',
    10,
    3,
    '{"difficulty": "easy", "topics": ["vite", "npm"], "accepted_answers": ["npm run dev"], "case_sensitive": false}'::jsonb
  ),
  (
    '30000000-0000-0000-0000-000000000008',
    '20000000-0000-0000-0000-000000000003',
    '10000000-0000-0000-0000-000000000003',
    'Explain why audit logs are useful in an exam management system.',
    20,
    1,
    '{"difficulty": "medium", "topics": ["security", "audit_logs"], "rubric": "Mention tracking important actions and accountability."}'::jsonb
  ),
  (
    '30000000-0000-0000-0000-000000000009',
    '20000000-0000-0000-0000-000000000003',
    '10000000-0000-0000-0000-000000000001',
    'Where should local development database passwords usually be stored in a Node.js project?',
    10,
    2,
    '{"difficulty": "easy", "topics": ["node", "dotenv"], "shuffle_options": true}'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO question_options (id, question_id, option_text, is_correct, position)
VALUES
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'SELECT', TRUE, 1),
  ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 'INSERT', FALSE, 2),
  ('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', 'UPDATE', FALSE, 3),
  ('40000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000001', 'DELETE', FALSE, 4),
  ('40000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000002', 'True', TRUE, 1),
  ('40000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000002', 'False', FALSE, 2),
  ('40000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000004', 'LEFT JOIN', FALSE, 1),
  ('40000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000004', 'RIGHT JOIN', FALSE, 2),
  ('40000000-0000-0000-0000-000000000009', '30000000-0000-0000-0000-000000000004', 'INNER JOIN', TRUE, 3),
  ('40000000-0000-0000-0000-000000000010', '30000000-0000-0000-0000-000000000004', 'FULL OUTER JOIN', FALSE, 4),
  ('40000000-0000-0000-0000-000000000011', '30000000-0000-0000-0000-000000000005', 'useState', TRUE, 1),
  ('40000000-0000-0000-0000-000000000012', '30000000-0000-0000-0000-000000000005', 'useEffect', FALSE, 2),
  ('40000000-0000-0000-0000-000000000013', '30000000-0000-0000-0000-000000000005', 'useMemo', FALSE, 3),
  ('40000000-0000-0000-0000-000000000014', '30000000-0000-0000-0000-000000000005', 'useRef', FALSE, 4),
  ('40000000-0000-0000-0000-000000000015', '30000000-0000-0000-0000-000000000006', 'True', TRUE, 1),
  ('40000000-0000-0000-0000-000000000016', '30000000-0000-0000-0000-000000000006', 'False', FALSE, 2),
  ('40000000-0000-0000-0000-000000000017', '30000000-0000-0000-0000-000000000009', 'In a .env file loaded by dotenv', TRUE, 1),
  ('40000000-0000-0000-0000-000000000018', '30000000-0000-0000-0000-000000000009', 'Hardcoded inside controller files', FALSE, 2),
  ('40000000-0000-0000-0000-000000000019', '30000000-0000-0000-0000-000000000009', 'Inside React components', FALSE, 3),
  ('40000000-0000-0000-0000-000000000020', '30000000-0000-0000-0000-000000000009', 'Inside audit log details', FALSE, 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO submissions (
  id,
  exam_id,
  student_id,
  status,
  attempt_number,
  started_at,
  submitted_at,
  answers_snapshot
)
VALUES
  (
    '50000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000011',
    'result_published',
    1,
    '2026-07-03 08:00:00+00',
    '2026-07-03 08:42:00+00',
    '{
      "30000000-0000-0000-0000-000000000001": {"selected_option_id": "40000000-0000-0000-0000-000000000001", "answer": "SELECT"},
      "30000000-0000-0000-0000-000000000002": {"selected_option_id": "40000000-0000-0000-0000-000000000005", "answer": "True"},
      "30000000-0000-0000-0000-000000000003": {"answer_text": "JSONB"},
      "30000000-0000-0000-0000-000000000004": {"selected_option_id": "40000000-0000-0000-0000-000000000009", "answer": "INNER JOIN"}
    }'::jsonb
  ),
  (
    '50000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000012',
    'submitted',
    1,
    '2026-07-04 10:00:00+00',
    '2026-07-04 10:55:00+00',
    '{
      "30000000-0000-0000-0000-000000000001": {"selected_option_id": "40000000-0000-0000-0000-000000000002", "answer": "INSERT"},
      "30000000-0000-0000-0000-000000000002": {"selected_option_id": "40000000-0000-0000-0000-000000000005", "answer": "True"},
      "30000000-0000-0000-0000-000000000003": {"answer_text": "UUID"},
      "30000000-0000-0000-0000-000000000004": {"selected_option_id": "40000000-0000-0000-0000-000000000007", "answer": "LEFT JOIN"}
    }'::jsonb
  ),
  (
    '50000000-0000-0000-0000-000000000003',
    '20000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000013',
    'result_published',
    1,
    '2026-07-05 11:00:00+00',
    '2026-07-05 11:24:00+00',
    '{
      "30000000-0000-0000-0000-000000000005": {"selected_option_id": "40000000-0000-0000-0000-000000000011", "answer": "useState"},
      "30000000-0000-0000-0000-000000000006": {"selected_option_id": "40000000-0000-0000-0000-000000000016", "answer": "False"},
      "30000000-0000-0000-0000-000000000007": {"answer_text": "npm run dev"}
    }'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO submitted_answers (
  id,
  submission_id,
  question_id,
  selected_option_id,
  answer_text,
  is_correct,
  points_awarded,
  teacher_comment
)
VALUES
  ('60000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', NULL, TRUE, 10, NULL),
  ('60000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000005', NULL, TRUE, 10, NULL),
  ('60000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003', NULL, 'JSONB', TRUE, 10, 'Good answer. JSONB is the expected example.'),
  ('60000000-0000-0000-0000-000000000004', '50000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000009', NULL, TRUE, 10, NULL),
  ('60000000-0000-0000-0000-000000000005', '50000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002', NULL, NULL, 0, NULL),
  ('60000000-0000-0000-0000-000000000006', '50000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000005', NULL, NULL, 0, NULL),
  ('60000000-0000-0000-0000-000000000007', '50000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000003', NULL, 'UUID', NULL, 0, NULL),
  ('60000000-0000-0000-0000-000000000008', '50000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000007', NULL, NULL, 0, NULL),
  ('60000000-0000-0000-0000-000000000009', '50000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000011', NULL, TRUE, 10, NULL),
  ('60000000-0000-0000-0000-000000000010', '50000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000006', '40000000-0000-0000-0000-000000000016', NULL, FALSE, 0, 'Vite can be used with React, so the correct answer is True.'),
  ('60000000-0000-0000-0000-000000000011', '50000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000007', NULL, 'npm run dev', TRUE, 10, 'Correct command.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO grades (
  id,
  submission_id,
  graded_by,
  score,
  max_score,
  percentage,
  status,
  graded_at,
  published_at
)
VALUES
  (
    '70000000-0000-0000-0000-000000000001',
    '50000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    40,
    40,
    100,
    'published',
    '2026-07-04 08:30:00+00',
    '2026-07-04 09:00:00+00'
  ),
  (
    '70000000-0000-0000-0000-000000000002',
    '50000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000003',
    20,
    30,
    66.67,
    'published',
    '2026-07-06 07:30:00+00',
    '2026-07-06 08:00:00+00'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO feedback (id, grade_id, teacher_id, student_id, exam_id, feedback_text, visibility)
VALUES
  (
    '80000000-0000-0000-0000-000000000001',
    '70000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000011',
    '20000000-0000-0000-0000-000000000001',
    'Excellent work. Your SQL answers were accurate and clear.',
    'student'
  ),
  (
    '80000000-0000-0000-0000-000000000002',
    '70000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000013',
    '20000000-0000-0000-0000-000000000002',
    'Good work on hooks and Vite commands. Review the true/false question about Vite.',
    'student'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO notifications (id, user_id, title, message, type, is_read, read_at, metadata)
VALUES
  (
    '90000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000011',
    'New exam available',
    'SQL Fundamentals Midterm is now available.',
    'exam_published',
    TRUE,
    '2026-07-01 12:00:00+00',
    '{"exam_id": "20000000-0000-0000-0000-000000000001", "exam_title": "SQL Fundamentals Midterm"}'::jsonb
  ),
  (
    '90000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000012',
    'New exam available',
    'SQL Fundamentals Midterm is now available.',
    'exam_published',
    FALSE,
    NULL,
    '{"exam_id": "20000000-0000-0000-0000-000000000001", "exam_title": "SQL Fundamentals Midterm"}'::jsonb
  ),
  (
    '90000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000013',
    'Grade published',
    'Your React Basics Quiz grade is now available.',
    'grade_published',
    FALSE,
    NULL,
    '{"exam_id": "20000000-0000-0000-0000-000000000002", "grade_id": "70000000-0000-0000-0000-000000000002"}'::jsonb
  ),
  (
    '90000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000002',
    'Submission received',
    'Ben Student submitted SQL Fundamentals Midterm.',
    'submission_received',
    FALSE,
    NULL,
    '{"exam_id": "20000000-0000-0000-0000-000000000001", "submission_id": "50000000-0000-0000-0000-000000000002"}'::jsonb
  ),
  (
    '90000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000014',
    'New exam available',
    'React Basics Quiz is now available.',
    'exam_published',
    FALSE,
    NULL,
    '{"exam_id": "20000000-0000-0000-0000-000000000002", "exam_title": "React Basics Quiz"}'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details, ip_address)
VALUES
  (
    'a0000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    'exam_published',
    'exam',
    '20000000-0000-0000-0000-000000000001',
    '{"status_before": "draft", "status_after": "published", "exam_title": "SQL Fundamentals Midterm"}'::jsonb,
    '127.0.0.1'
  ),
  (
    'a0000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000011',
    'submission_created',
    'submission',
    '50000000-0000-0000-0000-000000000001',
    '{"exam_id": "20000000-0000-0000-0000-000000000001", "student_name": "Alice Student", "attempt_number": 1}'::jsonb,
    '127.0.0.1'
  ),
  (
    'a0000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000002',
    'grade_published',
    'grade',
    '70000000-0000-0000-0000-000000000001',
    '{"submission_id": "50000000-0000-0000-0000-000000000001", "score": 40, "max_score": 40, "status_after": "published"}'::jsonb,
    '127.0.0.1'
  ),
  (
    'a0000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000001',
    'user_created',
    'user',
    '00000000-0000-0000-0000-000000000003',
    '{"created_role": "teacher", "created_email": "eli.teacher@examapp.test"}'::jsonb,
    '127.0.0.1'
  )
ON CONFLICT (id) DO NOTHING;

COMMIT;
