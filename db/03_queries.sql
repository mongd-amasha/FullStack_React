\echo '========== CONNECTION TEST =========='

SELECT
    current_database() AS database_name,
    current_user AS connected_user,
    NOW() AS connected_at;

\echo '========== USERS =========='

SELECT
    id,
    full_name,
    email,
    role
FROM users
ORDER BY id;

\echo '========== EXAMS =========='

SELECT
    id,
    title,
    status,
    teacher_id,
    jsonb_array_length(questions) AS question_count
FROM exams
ORDER BY id;

\echo '========== SPECIFIC EXAM JSONB =========='

SELECT
    id,
    title,
    questions
FROM exams
WHERE id = 1;