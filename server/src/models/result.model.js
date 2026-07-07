const { pool } = require('../config/db');

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const mapSubmissionContext = (row) => {
  if (!row) {
    return null;
  }

  return {
    submission: {
      id: row.submission_id,
      status: row.submission_status,
      attemptNumber: row.attempt_number,
      startedAt: row.started_at,
      submittedAt: row.submitted_at
    },
    student: {
      id: row.student_id,
      fullName: row.student_name,
      email: row.student_email
    },
    exam: {
      id: row.exam_id,
      title: row.exam_title,
      teacherId: row.teacher_id,
      totalPoints: Number(row.total_points),
      passingScore: Number(row.passing_score)
    }
  };
};

const mapAnswer = (row) => ({
  id: row.answer_id,
  questionId: row.question_id,
  questionText: row.question_text,
  questionType: row.question_type,
  selectedOptionId: row.selected_option_id,
  selectedOptionText: row.selected_option_text,
  answerText: row.answer_text,
  isCorrect: row.is_correct,
  pointsAwarded: Number(row.points_awarded),
  feedback: row.teacher_comment,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const mapFeedback = (row) => ({
  id: row.id,
  feedbackText: row.feedback_text,
  visibility: row.visibility,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  teacher: {
    id: row.teacher_id,
    fullName: row.teacher_name
  }
});

const mapGrade = (row) => {
  if (!row || !row.result_id) {
    return null;
  }

  return {
    id: row.result_id,
    submissionId: row.submission_id,
    gradedBy: row.graded_by,
    graderName: row.grader_name,
    score: Number(row.score),
    maxScore: Number(row.max_score),
    percentage: Number(row.percentage),
    status: row.grade_status,
    passed: Number(row.percentage) >= Number(row.passing_score),
    gradedAt: row.graded_at,
    publishedAt: row.published_at,
    createdAt: row.grade_created_at,
    updatedAt: row.grade_updated_at
  };
};

const submissionContextSelect = `
  SELECT
    s.id AS submission_id,
    s.status AS submission_status,
    s.attempt_number,
    s.started_at,
    s.submitted_at,
    student.id AS student_id,
    student.full_name AS student_name,
    student.email AS student_email,
    e.id AS exam_id,
    e.title AS exam_title,
    e.teacher_id,
    e.total_points,
    e.passing_score
  FROM exam_app.submissions s
  JOIN exam_app.users student ON student.id = s.student_id
  JOIN exam_app.exams e ON e.id = s.exam_id
`;

const gradeSelect = `
  SELECT
    g.id AS result_id,
    g.submission_id,
    g.graded_by,
    grader.full_name AS grader_name,
    g.score,
    g.max_score,
    g.percentage,
    g.status AS grade_status,
    g.graded_at,
    g.published_at,
    g.created_at AS grade_created_at,
    g.updated_at AS grade_updated_at,
    e.passing_score
  FROM exam_app.grades g
  JOIN exam_app.submissions s ON s.id = g.submission_id
  JOIN exam_app.exams e ON e.id = s.exam_id
  JOIN exam_app.users grader ON grader.id = g.graded_by
`;

const findSubmissionContext = async (submissionId) => {
  const result = await pool.query(
    `
      ${submissionContextSelect}
      WHERE s.id = $1::uuid
      LIMIT 1
    `,
    [submissionId]
  );

  return mapSubmissionContext(result.rows[0]);
};

const findGradeBySubmissionId = async (submissionId) => {
  const result = await pool.query(
    `
      ${gradeSelect}
      WHERE g.submission_id = $1::uuid
      LIMIT 1
    `,
    [submissionId]
  );

  return mapGrade(result.rows[0]);
};

const findGradeById = async (resultId) => {
  const result = await pool.query(
    `
      ${gradeSelect}
      WHERE g.id = $1::uuid
      LIMIT 1
    `,
    [resultId]
  );

  return mapGrade(result.rows[0]);
};

const findSubmittedAnswers = async (submissionId) => {
  const result = await pool.query(
    `
      SELECT
        sa.id AS answer_id,
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

  return result.rows.map(mapAnswer);
};

const findFeedbackByGradeId = async (resultId, studentVisibleOnly = false) => {
  const values = [resultId];
  let visibilityClause = '';

  if (studentVisibleOnly) {
    visibilityClause = 'AND f.visibility = $2::text';
    values.push('student');
  }

  const result = await pool.query(
    `
      SELECT
        f.id,
        f.feedback_text,
        f.visibility,
        f.created_at,
        f.updated_at,
        teacher.id AS teacher_id,
        teacher.full_name AS teacher_name
      FROM exam_app.feedback f
      JOIN exam_app.users teacher ON teacher.id = f.teacher_id
      WHERE f.grade_id = $1::uuid
        ${visibilityClause}
      ORDER BY f.created_at DESC
    `,
    values
  );

  return result.rows.map(mapFeedback);
};

const findSubmissionResultView = async (submissionId) => {
  const context = await findSubmissionContext(submissionId);

  if (!context) {
    return null;
  }

  const result = await findGradeBySubmissionId(submissionId);
  const answers = await findSubmittedAnswers(submissionId);
  const feedback = result ? await findFeedbackByGradeId(result.id) : [];

  return {
    ...context,
    answers,
    result: result ? { ...result, feedback } : null
  };
};

const findResultDetailById = async (resultId, studentVisibleOnly = false) => {
  const result = await findGradeById(resultId);

  if (!result) {
    return null;
  }

  const context = await findSubmissionContext(result.submissionId);
  const answers = await findSubmittedAnswers(result.submissionId);
  const feedback = await findFeedbackByGradeId(resultId, studentVisibleOnly);

  return {
    ...context,
    answers,
    result: {
      ...result,
      feedback
    }
  };
};

const gradeSubmission = async ({
  submissionId,
  gradedBy,
  studentId,
  examId,
  score,
  feedback,
  answerFeedback,
  publish
}) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const gradeStatus = publish ? 'published' : 'draft';
    const submissionStatus = publish ? 'result_published' : 'graded';

    const gradeResult = await client.query(
      `
        INSERT INTO exam_app.grades AS current_grade (
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
          100,
          $3::numeric,
          $4::text,
          NOW(),
          CASE WHEN $4::text = 'published' THEN NOW() ELSE NULL END
        )
        ON CONFLICT (submission_id)
        DO UPDATE SET
          graded_by = EXCLUDED.graded_by,
          score = EXCLUDED.score,
          max_score = EXCLUDED.max_score,
          percentage = EXCLUDED.percentage,
          status = EXCLUDED.status,
          graded_at = NOW(),
          published_at = CASE
            WHEN EXCLUDED.status = 'published' THEN COALESCE(current_grade.published_at, NOW())
            ELSE NULL
          END
        RETURNING id
      `,
      [submissionId, gradedBy, score, gradeStatus]
    );

    const resultId = gradeResult.rows[0].id;

    await client.query(
      `
        UPDATE exam_app.submissions
        SET status = $2::text
        WHERE id = $1::uuid
      `,
      [submissionId, submissionStatus]
    );

    await client.query(
      `
        DELETE FROM exam_app.feedback
        WHERE grade_id = $1::uuid
          AND visibility = 'student'
      `,
      [resultId]
    );

    if (feedback) {
      await client.query(
        `
          INSERT INTO exam_app.feedback (
            grade_id,
            teacher_id,
            student_id,
            exam_id,
            feedback_text,
            visibility
          )
          VALUES ($1::uuid, $2::uuid, $3::uuid, $4::uuid, $5::text, 'student')
        `,
        [resultId, gradedBy, studentId, examId, feedback]
      );
    }

    for (const item of answerFeedback) {
      const updateResult = await client.query(
        `
          UPDATE exam_app.submitted_answers
          SET
            points_awarded = $3::numeric,
            teacher_comment = $4::text
          WHERE id = $1::uuid
            AND submission_id = $2::uuid
          RETURNING id
        `,
        [item.answerId, submissionId, item.pointsAwarded, item.feedback || null]
      );

      if (updateResult.rowCount === 0) {
        throw createError('Answer feedback contains an answer that does not belong to this submission');
      }
    }

    await client.query('COMMIT');

    return resultId;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const publishResult = async (resultId) => {
  const result = await pool.query(
    `
      WITH updated_grade AS (
        UPDATE exam_app.grades
        SET
          status = 'published',
          graded_at = COALESCE(graded_at, NOW()),
          published_at = COALESCE(published_at, NOW())
        WHERE id = $1::uuid
        RETURNING id, submission_id
      ),
      updated_submission AS (
        UPDATE exam_app.submissions AS s
        SET status = 'result_published'
        FROM updated_grade
        WHERE s.id = updated_grade.submission_id
        RETURNING s.id
      )
      SELECT updated_grade.id
      FROM updated_grade
      LEFT JOIN updated_submission ON TRUE
    `,
    [resultId]
  );

  return result.rows[0] ? result.rows[0].id : null;
};

const findResultsByExamId = async (examId) => {
  const result = await pool.query(
    `
      SELECT
        s.id AS submission_id,
        s.status AS submission_status,
        s.submitted_at,
        student.id AS student_id,
        student.full_name AS student_name,
        student.email AS student_email,
        e.id AS exam_id,
        e.title AS exam_title,
        e.teacher_id,
        e.passing_score,
        g.id AS result_id,
        g.score,
        g.max_score,
        g.percentage,
        g.status AS grade_status,
        g.graded_at,
        g.published_at,
        COALESCE(
          jsonb_agg(
            jsonb_build_object(
              'id', f.id,
              'feedbackText', f.feedback_text,
              'visibility', f.visibility,
              'createdAt', f.created_at
            )
            ORDER BY f.created_at DESC
          ) FILTER (WHERE f.id IS NOT NULL),
          '[]'::jsonb
        ) AS feedback
      FROM exam_app.submissions s
      JOIN exam_app.users student ON student.id = s.student_id
      JOIN exam_app.exams e ON e.id = s.exam_id
      LEFT JOIN exam_app.grades g ON g.submission_id = s.id
      LEFT JOIN exam_app.feedback f ON f.grade_id = g.id
      WHERE s.exam_id = $1::uuid
      GROUP BY s.id, student.id, e.id, g.id
      ORDER BY s.submitted_at DESC NULLS LAST, s.created_at DESC
    `,
    [examId]
  );

  return result.rows.map((row) => ({
    submission: {
      id: row.submission_id,
      status: row.submission_status,
      submittedAt: row.submitted_at
    },
    student: {
      id: row.student_id,
      fullName: row.student_name,
      email: row.student_email
    },
    exam: {
      id: row.exam_id,
      title: row.exam_title,
      teacherId: row.teacher_id
    },
    result: row.result_id
      ? {
          id: row.result_id,
          score: Number(row.score),
          maxScore: Number(row.max_score),
          percentage: Number(row.percentage),
          status: row.grade_status,
          passed: Number(row.percentage) >= Number(row.passing_score),
          gradedAt: row.graded_at,
          publishedAt: row.published_at,
          feedback: row.feedback || []
        }
      : null
  }));
};

const findPublishedResultsForStudent = async (studentId) => {
  const result = await pool.query(
    `
      SELECT
        g.id AS result_id,
        g.submission_id,
        g.score,
        g.max_score,
        g.percentage,
        g.status AS grade_status,
        g.published_at,
        e.id AS exam_id,
        e.title AS exam_title,
        e.passing_score,
        COALESCE(
          jsonb_agg(
            jsonb_build_object(
              'id', f.id,
              'feedbackText', f.feedback_text,
              'createdAt', f.created_at
            )
            ORDER BY f.created_at DESC
          ) FILTER (WHERE f.id IS NOT NULL),
          '[]'::jsonb
        ) AS feedback
      FROM exam_app.grades g
      JOIN exam_app.submissions s ON s.id = g.submission_id
      JOIN exam_app.exams e ON e.id = s.exam_id
      LEFT JOIN exam_app.feedback f ON f.grade_id = g.id AND f.visibility = 'student'
      WHERE s.student_id = $1::uuid
        AND g.status = 'published'
      GROUP BY g.id, e.id
      ORDER BY g.published_at DESC NULLS LAST
    `,
    [studentId]
  );

  return result.rows.map((row) => ({
    id: row.result_id,
    submissionId: row.submission_id,
    exam: {
      id: row.exam_id,
      title: row.exam_title
    },
    score: Number(row.score),
    maxScore: Number(row.max_score),
    percentage: Number(row.percentage),
    status: row.grade_status,
    passed: Number(row.percentage) >= Number(row.passing_score),
    feedback: row.feedback || [],
    publishedAt: row.published_at
  }));
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
  findSubmissionContext,
  findSubmissionResultView,
  findResultDetailById,
  findGradeById,
  gradeSubmission,
  publishResult,
  findResultsByExamId,
  findPublishedResultsForStudent,
  insertAuditLog
};
