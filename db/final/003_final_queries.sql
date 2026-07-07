-- Final Project Demo Queries: FullStack Exam Management System
-- Run this file after 001_final_schema.sql and 002_final_seed.sql.

SET search_path TO exam_app, public;

-- 1. Connection test
SELECT NOW() AS database_connected_at;

-- 2. List users by role
SELECT
  role,
  full_name,
  email,
  is_active
FROM users
ORDER BY role, full_name;

-- 3. List exams with teacher names
SELECT
  e.title,
  e.status,
  e.duration_minutes,
  e.total_points,
  e.available_from,
  e.available_until,
  u.full_name AS teacher_name
FROM exams e
JOIN users u ON u.id = e.teacher_id
ORDER BY e.created_at;

-- 4. List published exams currently available to students
SELECT
  e.id,
  e.title,
  e.description,
  e.duration_minutes,
  e.total_points,
  u.full_name AS teacher_name
FROM exams e
JOIN users u ON u.id = e.teacher_id
WHERE e.status = 'published'
  AND (e.available_from IS NULL OR e.available_from <= NOW())
  AND (e.available_until IS NULL OR e.available_until >= NOW())
ORDER BY e.available_from;

-- 5. Show exam questions with their answer options
SELECT
  e.title AS exam_title,
  q.position,
  qt.code AS question_type,
  q.question_text,
  q.points,
  q.metadata,
  COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'position', qo.position,
        'option_text', qo.option_text,
        'is_correct', qo.is_correct
      )
      ORDER BY qo.position
    ) FILTER (WHERE qo.id IS NOT NULL),
    '[]'::jsonb
  ) AS options
FROM exams e
JOIN questions q ON q.exam_id = e.id
JOIN question_types qt ON qt.id = q.question_type_id
LEFT JOIN question_options qo ON qo.question_id = q.id
WHERE e.title = 'SQL Fundamentals Midterm'
GROUP BY e.title, q.position, qt.code, q.question_text, q.points, q.metadata
ORDER BY q.position;

-- 6. Show submissions with student and exam information
SELECT
  s.id AS submission_id,
  student.full_name AS student_name,
  exam.title AS exam_title,
  s.status,
  s.attempt_number,
  s.started_at,
  s.submitted_at
FROM submissions s
JOIN users student ON student.id = s.student_id
JOIN exams exam ON exam.id = s.exam_id
ORDER BY s.submitted_at DESC NULLS LAST;

-- 7. Show grades and feedback
SELECT
  student.full_name AS student_name,
  exam.title AS exam_title,
  g.score,
  g.max_score,
  g.percentage,
  g.status AS grade_status,
  f.feedback_text
FROM grades g
JOIN submissions s ON s.id = g.submission_id
JOIN users student ON student.id = s.student_id
JOIN exams exam ON exam.id = s.exam_id
LEFT JOIN feedback f ON f.grade_id = g.id
ORDER BY g.published_at DESC NULLS LAST;

-- 8. Query question JSONB metadata
SELECT
  question_text,
  metadata ->> 'difficulty' AS difficulty,
  metadata -> 'topics' AS topics
FROM questions
WHERE metadata @> '{"difficulty": "easy"}'::jsonb
ORDER BY position;

-- 9. Query submitted answer snapshots stored as JSONB
SELECT
  student.full_name AS student_name,
  exam.title AS exam_title,
  s.answers_snapshot -> '30000000-0000-0000-0000-000000000001' AS first_sql_answer
FROM submissions s
JOIN users student ON student.id = s.student_id
JOIN exams exam ON exam.id = s.exam_id
WHERE s.answers_snapshot ? '30000000-0000-0000-0000-000000000001';

-- 10. Query audit log JSONB details
SELECT
  action,
  entity_type,
  details ->> 'status_before' AS status_before,
  details ->> 'status_after' AS status_after,
  details ->> 'exam_title' AS exam_title,
  created_at
FROM audit_logs
WHERE details @> '{"status_after": "published"}'::jsonb
ORDER BY created_at DESC;
