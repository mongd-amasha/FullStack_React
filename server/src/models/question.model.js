const { pool } = require('../config/db');

const mapQuestionType = (row) => ({
  id: row.id,
  code: row.code,
  name: row.name,
  description: row.description,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const mapQuestion = (row) => ({
  id: row.id,
  examId: row.exam_id,
  questionTypeId: row.question_type_id,
  questionType: {
    id: row.question_type_id,
    code: row.question_type_code,
    name: row.question_type_name
  },
  questionText: row.question_text,
  points: Number(row.points),
  position: row.position,
  isRequired: row.is_required,
  metadata: row.metadata || {},
  options: row.options || [],
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const questionsSelect = `
  SELECT
    q.id,
    q.exam_id,
    q.question_type_id,
    qt.code AS question_type_code,
    qt.name AS question_type_name,
    q.question_text,
    q.points,
    q.position,
    q.is_required,
    q.metadata,
    q.created_at,
    q.updated_at,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', qo.id,
          'optionText', qo.option_text,
          'isCorrect', qo.is_correct,
          'position', qo.position
        )
        ORDER BY qo.position
      ) FILTER (WHERE qo.id IS NOT NULL),
      '[]'::jsonb
    ) AS options
  FROM exam_app.questions q
  JOIN exam_app.question_types qt ON qt.id = q.question_type_id
  LEFT JOIN exam_app.question_options qo ON qo.question_id = q.id
`;

const findQuestionTypes = async () => {
  const result = await pool.query(
    `
      SELECT id, code, name, description, created_at, updated_at
      FROM exam_app.question_types
      ORDER BY code
    `
  );

  return result.rows.map(mapQuestionType);
};

const findQuestionsByExamId = async (examId) => {
  const result = await pool.query(
    `
      ${questionsSelect}
      WHERE q.exam_id = $1
      GROUP BY q.id, qt.id, qt.code, qt.name
      ORDER BY q.position
    `,
    [examId]
  );

  return result.rows.map(mapQuestion);
};

const createQuestionWithOptions = async ({
  examId,
  questionTypeId,
  questionText,
  points,
  position,
  metadata,
  options
}) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const questionResult = await client.query(
      `
        INSERT INTO exam_app.questions (
          exam_id,
          question_type_id,
          question_text,
          points,
          position,
          metadata
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `,
      [examId, questionTypeId, questionText, points, position, metadata]
    );

    const questionId = questionResult.rows[0].id;

    for (const option of options) {
      await client.query(
        `
          INSERT INTO exam_app.question_options (
            question_id,
            option_text,
            is_correct,
            position
          )
          VALUES ($1, $2, $3, $4)
        `,
        [questionId, option.optionText, option.isCorrect, option.position]
      );
    }

    const createdQuestionResult = await client.query(
      `
        ${questionsSelect}
        WHERE q.id = $1
        GROUP BY q.id, qt.id, qt.code, qt.name
        LIMIT 1
      `,
      [questionId]
    );

    await client.query('COMMIT');

    return mapQuestion(createdQuestionResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  findQuestionTypes,
  findQuestionsByExamId,
  createQuestionWithOptions
};
