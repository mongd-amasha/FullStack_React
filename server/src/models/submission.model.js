const { pool } = require('../config/db');

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const mapSubmission = (row) => {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    examId: row.exam_id,
    studentId: row.student_id,
    status: row.status,
    attemptNumber: row.attempt_number,
    startedAt: row.started_at,
    submittedAt: row.submitted_at,
    answersSnapshot: row.answers_snapshot || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    exam: {
      id: row.exam_id,
      title: row.exam_title,
      status: row.exam_status,
      teacherId: row.exam_teacher_id
    },
    student: row.student_name
      ? {
          id: row.student_id,
          fullName: row.student_name,
          email: row.student_email
        }
      : undefined,
    grade: row.grade_id
      ? {
          id: row.grade_id,
          score: Number(row.score),
          maxScore: Number(row.max_score),
          percentage: Number(row.percentage),
          status: row.grade_status,
          gradedAt: row.graded_at,
          publishedAt: row.published_at
        }
      : null
  };
};

const submissionSelect = `
  SELECT
    s.id,
    s.exam_id,
    s.student_id,
    s.status,
    s.attempt_number,
    s.started_at,
    s.submitted_at,
    s.answers_snapshot,
    s.created_at,
    s.updated_at,
    e.title AS exam_title,
    e.status AS exam_status,
    e.teacher_id AS exam_teacher_id,
    student.full_name AS student_name,
    student.email AS student_email,
    g.id AS grade_id,
    g.score,
    g.max_score,
    g.percentage,
    g.status AS grade_status,
    g.graded_at,
    g.published_at
  FROM exam_app.submissions s
  JOIN exam_app.exams e ON e.id = s.exam_id
  JOIN exam_app.users student ON student.id = s.student_id
  LEFT JOIN exam_app.grades g ON g.submission_id = s.id
`;

const findAvailableExamById = async (examId) => {
  const result = await pool.query(
    `
      SELECT id, teacher_id, title, status, available_from, available_until
      FROM exam_app.exams
      WHERE id = $1::uuid
        AND status = 'published'
        AND (available_from IS NULL OR available_from <= NOW())
        AND (available_until IS NULL OR available_until >= NOW())
      LIMIT 1
    `,
    [examId]
  );

  return result.rows[0] || null;
};

const findExamById = async (examId) => {
  const result = await pool.query(
    `
      SELECT id, teacher_id, title, status
      FROM exam_app.exams
      WHERE id = $1::uuid
      LIMIT 1
    `,
    [examId]
  );

  return result.rows[0] || null;
};

const findSubmissionById = async (submissionId) => {
  const result = await pool.query(
    `
      ${submissionSelect}
      WHERE s.id = $1::uuid
      LIMIT 1
    `,
    [submissionId]
  );

  return mapSubmission(result.rows[0]);
};

const findInProgressSubmission = async (examId, studentId) => {
  const result = await pool.query(
    `
      ${submissionSelect}
      WHERE s.exam_id = $1::uuid
        AND s.student_id = $2::uuid
        AND s.status = 'in_progress'
      ORDER BY s.created_at DESC
      LIMIT 1
    `,
    [examId, studentId]
  );

  return mapSubmission(result.rows[0]);
};

const createSubmission = async ({ examId, studentId }) => {
  const result = await pool.query(
    `
      INSERT INTO exam_app.submissions (
        exam_id,
        student_id,
        status,
        attempt_number
      )
      VALUES (
        $1::uuid,
        $2::uuid,
        'in_progress',
        COALESCE(
          (
            SELECT MAX(attempt_number) + 1
            FROM exam_app.submissions
            WHERE exam_id = $1::uuid
              AND student_id = $2::uuid
          ),
          1
        )
      )
      RETURNING id
    `,
    [examId, studentId]
  );

  return findSubmissionById(result.rows[0].id);
};

const findMySubmissions = async (studentId) => {
  const result = await pool.query(
    `
      ${submissionSelect}
      WHERE s.student_id = $1::uuid
      ORDER BY s.created_at DESC
    `,
    [studentId]
  );

  return result.rows.map(mapSubmission);
};

const findSubmissionsByExamId = async (examId) => {
  const result = await pool.query(
    `
      ${submissionSelect}
      WHERE s.exam_id = $1::uuid
      ORDER BY s.submitted_at DESC NULLS LAST, s.created_at DESC
    `,
    [examId]
  );

  return result.rows.map(mapSubmission);
};

const findSubmittedAnswers = async (submissionId) => {
  const result = await pool.query(
    `
      SELECT
        sa.id,
        sa.question_id,
        q.question_text,
        qt.code AS question_type,
        sa.selected_option_id,
        qo.option_text AS selected_option_text,
        sa.answer_text,
        sa.is_correct,
        sa.points_awarded,
        sa.teacher_comment,
        sa.created_at,
        sa.updated_at
      FROM exam_app.submitted_answers sa
      JOIN exam_app.questions q ON q.id = sa.question_id
      JOIN exam_app.question_types qt ON qt.id = q.question_type_id
      LEFT JOIN exam_app.question_options qo ON qo.id = sa.selected_option_id
      WHERE sa.submission_id = $1::uuid
      ORDER BY q.position
    `,
    [submissionId]
  );

  return result.rows.map((row) => ({
    id: row.id,
    questionId: row.question_id,
    questionText: row.question_text,
    questionType: row.question_type,
    selectedOptionId: row.selected_option_id,
    selectedOptionText: row.selected_option_text,
    answerText: row.answer_text,
    isCorrect: row.is_correct,
    pointsAwarded: Number(row.points_awarded),
    teacherComment: row.teacher_comment,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
};

const findFeedbackBySubmissionId = async (submissionId) => {
  const result = await pool.query(
    `
      SELECT
        f.id,
        f.feedback_text,
        f.visibility,
        f.created_at,
        teacher.id AS teacher_id,
        teacher.full_name AS teacher_name
      FROM exam_app.feedback f
      JOIN exam_app.grades g ON g.id = f.grade_id
      JOIN exam_app.users teacher ON teacher.id = f.teacher_id
      WHERE g.submission_id = $1::uuid
      ORDER BY f.created_at DESC
    `,
    [submissionId]
  );

  return result.rows.map((row) => ({
    id: row.id,
    feedbackText: row.feedback_text,
    visibility: row.visibility,
    createdAt: row.created_at,
    teacher: {
      id: row.teacher_id,
      fullName: row.teacher_name
    }
  }));
};

const findSubmissionDetail = async (submissionId) => {
  const submission = await findSubmissionById(submissionId);

  if (!submission) {
    return null;
  }

  const answers = await findSubmittedAnswers(submissionId);
  const feedback = await findFeedbackBySubmissionId(submissionId);

  return {
    ...submission,
    answers,
    feedback
  };
};

const getSelectedOptions = async (client, selectedOptionIds) => {
  if (selectedOptionIds.length === 0) {
    return new Map();
  }

  const result = await client.query(
    `
      SELECT id, question_id, option_text, is_correct
      FROM exam_app.question_options
      WHERE id = ANY($1::uuid[])
    `,
    [selectedOptionIds]
  );

  const optionsById = new Map();

  result.rows.forEach((row) => {
    optionsById.set(row.id, {
      id: row.id,
      questionId: row.question_id,
      optionText: row.option_text,
      isCorrect: row.is_correct
    });
  });

  return optionsById;
};

const getExamQuestions = async (client, examId) => {
  const result = await client.query(
    `
      SELECT
        q.id,
        q.points,
        q.metadata,
        qt.code AS question_type
      FROM exam_app.questions q
      JOIN exam_app.question_types qt ON qt.id = q.question_type_id
      WHERE q.exam_id = $1::uuid
    `,
    [examId]
  );

  const questionsById = new Map();
  let maxScore = 0;

  result.rows.forEach((row) => {
    const question = {
      id: row.id,
      points: Number(row.points),
      metadata: row.metadata || {},
      questionType: row.question_type
    };

    questionsById.set(row.id, question);
    maxScore += question.points;
  });

  return {
    questionsById,
    maxScore
  };
};

const answerMatchesAcceptedText = (answerText, metadata) => {
  const acceptedAnswers = Array.isArray(metadata.accepted_answers)
    ? metadata.accepted_answers
    : [];

  if (!answerText || acceptedAnswers.length === 0) {
    return null;
  }

  if (metadata.case_sensitive === false) {
    const normalizedAnswer = answerText.trim().toLowerCase();
    return acceptedAnswers.some((acceptedAnswer) => {
      return String(acceptedAnswer).trim().toLowerCase() === normalizedAnswer;
    });
  }

  return acceptedAnswers.some((acceptedAnswer) => {
    return String(acceptedAnswer).trim() === answerText.trim();
  });
};

const buildGradedAnswers = async (client, submission, answers) => {
  const { questionsById, maxScore } = await getExamQuestions(client, submission.examId);
  const selectedOptionIds = answers
    .filter((answer) => answer.selectedOptionId)
    .map((answer) => answer.selectedOptionId);
  const optionsById = await getSelectedOptions(client, selectedOptionIds);

  const gradedAnswers = answers.map((answer) => {
    const question = questionsById.get(answer.questionId);

    if (!question) {
      throw createError('Answer contains a question that does not belong to this exam', 400);
    }

    const selectedOption = answer.selectedOptionId
      ? optionsById.get(answer.selectedOptionId)
      : null;

    if (answer.selectedOptionId && !selectedOption) {
      throw createError('Selected option was not found', 400);
    }

    if (selectedOption && String(selectedOption.questionId) !== String(answer.questionId)) {
      throw createError('Selected option does not belong to the answer question', 400);
    }

    let isCorrect = null;
    let pointsAwarded = 0;

    if (question.questionType === 'multiple_choice' || question.questionType === 'true_false') {
      isCorrect = selectedOption ? selectedOption.isCorrect : false;
      pointsAwarded = isCorrect ? question.points : 0;
    }

    if (question.questionType === 'short_text') {
      const shortTextMatch = answerMatchesAcceptedText(answer.answerText, question.metadata);

      if (shortTextMatch !== null) {
        isCorrect = shortTextMatch;
        pointsAwarded = shortTextMatch ? question.points : 0;
      }
    }

    return {
      questionId: answer.questionId,
      selectedOptionId: answer.selectedOptionId || null,
      answerText: answer.answerText || null,
      isCorrect,
      pointsAwarded
    };
  });

  return {
    gradedAnswers,
    maxScore
  };
};

const buildAnswersSnapshot = (gradedAnswers) => {
  return gradedAnswers.reduce((snapshot, answer) => {
    snapshot[answer.questionId] = {
      selectedOptionId: answer.selectedOptionId,
      answerText: answer.answerText,
      isCorrect: answer.isCorrect,
      pointsAwarded: answer.pointsAwarded
    };

    return snapshot;
  }, {});
};

const submitAnswers = async ({ submission, answers }) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { gradedAnswers, maxScore } = await buildGradedAnswers(client, submission, answers);
    const answersSnapshot = buildAnswersSnapshot(gradedAnswers);
    const score = gradedAnswers.reduce((total, answer) => total + answer.pointsAwarded, 0);
    const percentage = maxScore > 0 ? Number(((score / maxScore) * 100).toFixed(2)) : 0;
    const fullyAutoGraded = gradedAnswers.length > 0
      && gradedAnswers.every((answer) => answer.isCorrect !== null);
    const submissionStatus = fullyAutoGraded ? 'result_published' : 'submitted';
    const gradeStatus = fullyAutoGraded ? 'published' : 'draft';

    await client.query(
      `
        DELETE FROM exam_app.submitted_answers
        WHERE submission_id = $1::uuid
      `,
      [submission.id]
    );

    for (const answer of gradedAnswers) {
      await client.query(
        `
          INSERT INTO exam_app.submitted_answers (
            submission_id,
            question_id,
            selected_option_id,
            answer_text,
            is_correct,
            points_awarded
          )
          VALUES ($1::uuid, $2::uuid, $3::uuid, $4::text, $5::boolean, $6::numeric)
        `,
        [
          submission.id,
          answer.questionId,
          answer.selectedOptionId,
          answer.answerText,
          answer.isCorrect,
          answer.pointsAwarded
        ]
      );
    }

    await client.query(
      `
        UPDATE exam_app.submissions
        SET
          status = $2::text,
          submitted_at = NOW(),
          answers_snapshot = $3::jsonb
        WHERE id = $1::uuid
      `,
      [submission.id, submissionStatus, answersSnapshot]
    );

    await client.query(
      `
        INSERT INTO exam_app.grades (
          submission_id,
          graded_by,
          score,
          max_score,
          percentage,
          status,
          graded_at,
          published_at
        )
        VALUES (
          $1::uuid,
          $2::uuid,
          $3::numeric,
          $4::numeric,
          $5::numeric,
          $6::text,
          CASE WHEN $6::text = 'published' THEN NOW() ELSE NULL END,
          CASE WHEN $6::text = 'published' THEN NOW() ELSE NULL END
        )
        ON CONFLICT (submission_id)
        DO UPDATE SET
          score = EXCLUDED.score,
          max_score = EXCLUDED.max_score,
          percentage = EXCLUDED.percentage,
          status = EXCLUDED.status,
          graded_at = EXCLUDED.graded_at,
          published_at = EXCLUDED.published_at
      `,
      [
        submission.id,
        submission.exam.teacherId,
        score,
        maxScore,
        percentage,
        gradeStatus
      ]
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }

  return findSubmissionDetail(submission.id);
};

const insertAuditLog = async ({ userId, action, entityType, entityId, details }) => {
  try {
    await pool.query(
      `
        INSERT INTO exam_app.audit_logs (
          user_id,
          action,
          entity_type,
          entity_id,
          details
        )
        VALUES ($1::uuid, $2::text, $3::text, $4::uuid, $5::jsonb)
      `,
      [userId, action, entityType, entityId, details]
    );
  } catch (error) {
    if (error.code === '42P01' || error.code === '3F000') {
      return;
    }

    throw error;
  }
};

module.exports = {
  findAvailableExamById,
  findExamById,
  findSubmissionById,
  findSubmissionDetail,
  findInProgressSubmission,
  createSubmission,
  findMySubmissions,
  findSubmissionsByExamId,
  submitAnswers,
  insertAuditLog
};
