const { pool } = require('../config/db');

const examSelect = `
  SELECT
    e.id,
    e.teacher_id,
    teacher.full_name AS teacher_name,
    e.title,
    e.description,
    e.instructions,
    e.status,
    e.available_from,
    e.available_until,
    e.duration_minutes,
    e.total_points,
    e.passing_score,
    e.published_at,
    e.created_at,
    e.updated_at
  FROM exam_app.exams e
  JOIN exam_app.users teacher ON teacher.id = e.teacher_id
`;

const mapExam = (row) => {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    teacherId: row.teacher_id,
    teacherName: row.teacher_name,
    title: row.title,
    description: row.description,
    instructions: row.instructions,
    status: row.status,
    availableFrom: row.available_from,
    availableUntil: row.available_until,
    durationMinutes: row.duration_minutes,
    totalPoints: Number(row.total_points),
    passingScore: Number(row.passing_score),
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
};

const findExamsForUser = async (user) => {
  const values = [];
  let whereClause = '';

  if (user.role === 'teacher') {
    values.push(user.id);
    whereClause = 'WHERE e.teacher_id = $1';
  }

  if (user.role === 'student') {
    whereClause = `
      WHERE e.status = 'published'
        AND (e.available_from IS NULL OR e.available_from <= NOW())
        AND (e.available_until IS NULL OR e.available_until >= NOW())
    `;
  }

  const result = await pool.query(
    `
      ${examSelect}
      ${whereClause}
      ORDER BY e.created_at DESC
    `,
    values
  );

  return result.rows.map(mapExam);
};

const findExamById = async (examId) => {
  const result = await pool.query(
    `
      ${examSelect}
      WHERE e.id = $1
      LIMIT 1
    `,
    [examId]
  );

  return mapExam(result.rows[0]);
};

const createExam = async ({
  teacherId,
  title,
  description,
  durationMinutes,
  availableFrom,
  availableUntil
}) => {
  const result = await pool.query(
    `
      INSERT INTO exam_app.exams (
        teacher_id,
        title,
        description,
        duration_minutes,
        available_from,
        available_until,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'draft')
      RETURNING id
    `,
    [teacherId, title, description, durationMinutes, availableFrom, availableUntil]
  );

  return findExamById(result.rows[0].id);
};

const updateExam = async (examId, updates) => {
  const fields = [
    ['title', 'title'],
    ['description', 'description'],
    ['durationMinutes', 'duration_minutes'],
    ['availableFrom', 'available_from'],
    ['availableUntil', 'available_until']
  ];

  const values = [];
  const setClauses = [];

  fields.forEach(([propertyName, columnName]) => {
    if (Object.prototype.hasOwnProperty.call(updates, propertyName)) {
      values.push(updates[propertyName]);
      setClauses.push(`${columnName} = $${values.length}`);
    }
  });

  if (setClauses.length === 0) {
    return findExamById(examId);
  }

  values.push(examId);

  await pool.query(
    `
      UPDATE exam_app.exams
      SET ${setClauses.join(', ')}
      WHERE id = $${values.length}
    `,
    values
  );

  return findExamById(examId);
};

const updateExamStatus = async (examId, status) => {
  await pool.query(
    `
      WITH status_input AS (
        SELECT
          $1::uuid AS exam_id,
          $2::text AS new_status
      )
      UPDATE exam_app.exams AS e
      SET
        status = status_input.new_status,
        published_at = CASE
          WHEN status_input.new_status = 'published' THEN COALESCE(e.published_at, NOW())
          ELSE e.published_at
        END
      FROM status_input
      WHERE e.id = status_input.exam_id
    `,
    [examId, status]
  );

  return findExamById(examId);
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
  findExamsForUser,
  findExamById,
  createExam,
  updateExam,
  updateExamStatus,
  insertAuditLog
};
