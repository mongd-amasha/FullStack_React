const path = require('path')
const { pathToFileURL } = require('url')

const serverRoot = path.resolve(__dirname, '..', '..')

async function loadModule(filePath) {
  try {
    return require(filePath)
  } catch (error) {
    if (error.code !== 'ERR_REQUIRE_ESM') {
      throw error
    }

    return import(pathToFileURL(filePath).href)
  }
}

async function loadApp() {
  const candidates = [
    'src/app.js',
    'src/server.js',
    'app.js',
    'server.js',
    'index.js'
  ]
  const errors = []

  for (const candidate of candidates) {
    const fullPath = path.join(serverRoot, candidate)

    try {
      const loadedModule = await loadModule(fullPath)
      const app =
        loadedModule.default ||
        loadedModule.app ||
        loadedModule.server ||
        loadedModule.httpServer ||
        loadedModule

      if (typeof app === 'function' || typeof app?.listen === 'function') {
        return app
      }
    } catch (error) {
      if (error.code !== 'MODULE_NOT_FOUND') {
        errors.push(`${candidate}: ${error.message}`)
      }
    }
  }

  throw new Error(
    `Could not load the Express app for tests. Tried: ${candidates.join(', ')}. ${errors.join(' | ')}`
  )
}

async function closeDatabase() {
  try {
    const { pool } = await loadModule(path.join(serverRoot, 'src/config/db.js'))

    if (typeof pool?.end === 'function') {
      await pool.end()
    }
  } catch (error) {
    if (error.code !== 'MODULE_NOT_FOUND') {
      throw error
    }
  }
}

async function cleanupTestData(titlePrefix) {
  const { pool } = await loadModule(path.join(serverRoot, 'src/config/db.js'))
  const client = await pool.connect()
  const titlePattern = `${titlePrefix}%`

  try {
    await client.query('BEGIN')

    await client.query(
      `
        DELETE FROM exam_app.feedback
        WHERE exam_id IN (
          SELECT id FROM exam_app.exams WHERE title LIKE $1
        )
        OR grade_id IN (
          SELECT g.id
          FROM exam_app.grades g
          JOIN exam_app.submissions s ON s.id = g.submission_id
          JOIN exam_app.exams e ON e.id = s.exam_id
          WHERE e.title LIKE $1
        )
      `,
      [titlePattern]
    )

    await client.query(
      `
        DELETE FROM exam_app.audit_logs
        WHERE entity_id IN (
          SELECT id FROM exam_app.exams WHERE title LIKE $1
          UNION
          SELECT q.id
          FROM exam_app.questions q
          JOIN exam_app.exams e ON e.id = q.exam_id
          WHERE e.title LIKE $1
          UNION
          SELECT s.id
          FROM exam_app.submissions s
          JOIN exam_app.exams e ON e.id = s.exam_id
          WHERE e.title LIKE $1
          UNION
          SELECT g.id
          FROM exam_app.grades g
          JOIN exam_app.submissions s ON s.id = g.submission_id
          JOIN exam_app.exams e ON e.id = s.exam_id
          WHERE e.title LIKE $1
        )
        OR details->>'exam_id' IN (
          SELECT id::text FROM exam_app.exams WHERE title LIKE $1
        )
      `,
      [titlePattern]
    )

    await client.query(
      `
        DELETE FROM exam_app.grades
        WHERE submission_id IN (
          SELECT s.id
          FROM exam_app.submissions s
          JOIN exam_app.exams e ON e.id = s.exam_id
          WHERE e.title LIKE $1
        )
      `,
      [titlePattern]
    )

    await client.query(
      `
        DELETE FROM exam_app.submitted_answers
        WHERE submission_id IN (
          SELECT s.id
          FROM exam_app.submissions s
          JOIN exam_app.exams e ON e.id = s.exam_id
          WHERE e.title LIKE $1
        )
        OR question_id IN (
          SELECT q.id
          FROM exam_app.questions q
          JOIN exam_app.exams e ON e.id = q.exam_id
          WHERE e.title LIKE $1
        )
      `,
      [titlePattern]
    )

    await client.query(
      `
        DELETE FROM exam_app.submissions
        WHERE exam_id IN (
          SELECT id FROM exam_app.exams WHERE title LIKE $1
        )
      `,
      [titlePattern]
    )

    await client.query(
      `
        DELETE FROM exam_app.question_options
        WHERE question_id IN (
          SELECT q.id
          FROM exam_app.questions q
          JOIN exam_app.exams e ON e.id = q.exam_id
          WHERE e.title LIKE $1
        )
      `,
      [titlePattern]
    )

    await client.query(
      `
        DELETE FROM exam_app.questions
        WHERE exam_id IN (
          SELECT id FROM exam_app.exams WHERE title LIKE $1
        )
      `,
      [titlePattern]
    )

    await client.query(
      `
        DELETE FROM exam_app.exams
        WHERE title LIKE $1
      `,
      [titlePattern]
    )

    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

function getData(response) {
  return response?.body?.data ?? response?.body
}

function getList(response) {
  const data = getData(response)

  if (Array.isArray(data)) {
    return data
  }

  return (
    data?.items ||
    data?.exams ||
    data?.submissions ||
    data?.results ||
    data?.questions ||
    data?.questionTypes ||
    []
  )
}

function getId(entity) {
  return (
    entity?.id ||
    entity?.examId ||
    entity?.exam_id ||
    entity?.resultId ||
    entity?.result_id ||
    entity?.submissionId ||
    entity?.submission_id
  )
}

function getResult(value) {
  const data = value?.body ? getData(value) : value

  return data?.result || data
}

function getResultId(value) {
  const result = getResult(value)

  return (
    result?.id ||
    result?.resultId ||
    result?.result_id ||
    getData(value)?.result?.id
  )
}

function getToken(response) {
  const data = getData(response)

  return data?.token || data?.accessToken || response.body?.token
}

function authHeader(token) {
  return {
    Authorization: `Bearer ${token}`
  }
}

async function login(api, email, password = '123456') {
  const response = await api
    .post('/api/auth/login')
    .send({ email, password })

  expect(response.status).toBe(200)

  const token = getToken(response)
  expect(token).toBeTruthy()

  return {
    token,
    user: getData(response)?.user || response.body?.user
  }
}

async function requestFirst(api, requests, token) {
  const responses = []

  for (const requestData of requests) {
    const method = requestData.method || 'get'
    const call = api[method](requestData.path)

    if (token) {
      call.set(authHeader(token))
    }

    if (requestData.body) {
      call.send(requestData.body)
    }

    const response = await call
    responses.push(`${method.toUpperCase()} ${requestData.path}: ${response.status}`)

    if (![404, 405].includes(response.status)) {
      return response
    }
  }

  throw new Error(`No matching route found. Tried ${responses.join(', ')}`)
}

module.exports = {
  authHeader,
  closeDatabase,
  cleanupTestData,
  getData,
  getId,
  getList,
  getResult,
  getResultId,
  loadApp,
  login,
  requestFirst
}
