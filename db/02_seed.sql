TRUNCATE TABLE exams, users RESTART IDENTITY CASCADE;

INSERT INTO users (full_name, email, role)
VALUES
    ('Teacher Example', 'teacher@example.com', 'teacher'),
    ('Daniel Cohen', 'daniel.cohen@example.com', 'student'),
    ('Maya Levi', 'maya.levi@example.com', 'student'),
    ('Yosef Haddad', 'yosef.haddad@example.com', 'student');

INSERT INTO exams (
    title,
    description,
    status,
    teacher_id,
    questions
)
VALUES (
    'React Basics Exam',
    'Basic exam about React components and state.',
    'active',
    1,
    jsonb_build_array(
        jsonb_build_object(
            'id', 1,
            'text', 'What is JSX?',
            'options', jsonb_build_array(
                'JavaScript XML',
                'Java Syntax Extension',
                'JSON XML',
                'Java Server XML'
            ),
            'correctAnswer', 'JavaScript XML'
        ),
        jsonb_build_object(
            'id', 2,
            'text', 'What is useState used for?',
            'options', jsonb_build_array(
                'Routing',
                'Managing state',
                'Styling',
                'Building APIs'
            ),
            'correctAnswer', 'Managing state'
        ),
        jsonb_build_object(
            'id', 3,
            'text', 'What is a React component?',
            'options', jsonb_build_array(
                'Reusable UI part',
                'Database table',
                'Server route',
                'CSS file'
            ),
            'correctAnswer', 'Reusable UI part'
        )
    )
);

INSERT INTO exams (
    title,
    description,
    status,
    teacher_id,
    questions
)
VALUES (
    'JavaScript Fundamentals',
    'Exam about basic JavaScript concepts.',
    'draft',
    1,
    jsonb_build_array(
        jsonb_build_object(
            'id', 1,
            'text', 'Which keyword creates a constant?',
            'options', jsonb_build_array('var', 'let', 'const', 'static'),
            'correctAnswer', 'const'
        ),
        jsonb_build_object(
            'id', 2,
            'text', 'Which method adds an item to an array?',
            'options', jsonb_build_array('push', 'map', 'filter', 'find'),
            'correctAnswer', 'push'
        )
    )
);