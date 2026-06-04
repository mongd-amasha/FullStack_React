DO $$
DECLARE
    selected_exam RECORD;
    question JSONB;
BEGIN
    SELECT id, title, questions
    INTO selected_exam
    FROM exams
    WHERE id = 1;

    RAISE NOTICE 'Exam ID: %', selected_exam.id;
    RAISE NOTICE 'Exam Title: %', selected_exam.title;
    RAISE NOTICE '--------------------------------';

    FOR question IN
        SELECT value
        FROM jsonb_array_elements(selected_exam.questions)
    LOOP
        RAISE NOTICE 'Question ID: %', question->>'id';
        RAISE NOTICE 'Question: %', question->>'text';
        RAISE NOTICE 'Options: %', question->'options';
        RAISE NOTICE '--------------------------------';
    END LOOP;
END $$;