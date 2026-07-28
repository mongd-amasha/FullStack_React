const supertest = require('supertest')
const {
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
} = require('./helpers/apiTestHelper.cjs')

const TEST_EXAM_PREFIX = '__API_TEST__ Exam'
const LEGACY_TEST_EXAM_PREFIX = 'API Test Exam'

describe('Backend API flows', () => {
  let app
  let api
  let teacher
  let student
  let admin
  let createdExam
  let createdQuestion
  let startedSubmission
  let gradedResult

  beforeAll(async () => {
    app = await loadApp()
    api = supertest(app)
    await cleanupTestData(TEST_EXAM_PREFIX)
    await cleanupTestData(LEGACY_TEST_EXAM_PREFIX)
  })

  afterAll(async () => {
    await cleanupTestData(TEST_EXAM_PREFIX)
    await cleanupTestData(LEGACY_TEST_EXAM_PREFIX)

    if (typeof app?.close === 'function') {
      await new Promise((resolve) => app.close(resolve))
    }

    await closeDatabase()
  })

  test('health endpoint responds', async () => {
    const response = await requestFirst(api, [
      { path: '/health' },
      { path: '/api/health' }
    ])

    expect(response.status).toBe(200)
  })

  test('auth login succeeds and fails clearly', async () => {
    teacher = await login(api, 'dana.teacher@examapp.test')
    student = await login(api, 'alice.student@examapp.test')
    admin = await login(api, 'admin@examapp.test')

    expect(teacher.user?.role).toBe('teacher')
    expect(student.user?.role).toBe('student')
    expect(admin.user?.role).toBe('admin')

    const failedLogin = await api
      .post('/api/auth/login')
      .send({
        email: 'alice.student@examapp.test',
        password: 'wrong-password'
      })

    expect([400, 401]).toContain(failedLogin.status)
  })

  test('current user endpoint returns the logged-in user with JWT', async () => {
    const response = await api
      .get('/api/auth/me')
      .set(authHeader(teacher.token))

    expect(response.status).toBe(200)
    expect(getData(response)?.user?.role || getData(response)?.role).toBe('teacher')
  })

  test('teacher can load, create, and update exams', async () => {
    const examsResponse = await api
      .get('/api/exams')
      .set(authHeader(teacher.token))

    expect(examsResponse.status).toBe(200)

    const uniqueTitle = `${TEST_EXAM_PREFIX} ${Date.now()}`
    const createResponse = await api
      .post('/api/exams')
      .set(authHeader(teacher.token))
      .send({
        title: uniqueTitle,
        description: 'Created by Jest and Supertest',
        durationMinutes: 45,
        status: 'draft'
      })

    expect([200, 201]).toContain(createResponse.status)
    createdExam = getData(createResponse)?.exam || getData(createResponse)
    expect(getId(createdExam)).toBeTruthy()

    const updateResponse = await requestFirst(api, [
      {
        method: 'put',
        path: `/api/exams/${getId(createdExam)}`,
        body: {
          title: `${uniqueTitle} Updated`,
          description: 'Updated by Jest and Supertest',
          durationMinutes: 60,
          status: 'draft'
        }
      },
      {
        method: 'patch',
        path: `/api/exams/${getId(createdExam)}`,
        body: {
          title: `${uniqueTitle} Updated`,
          description: 'Updated by Jest and Supertest',
          durationMinutes: 60,
          status: 'draft'
        }
      }
    ], teacher.token)

    expect([200, 204]).toContain(updateResponse.status)
  })

  test('teacher can add a question and publish the exam', async () => {
    const typeResponse = await requestFirst(api, [
      { path: '/api/question-types' },
      { path: '/api/exams/question-types' }
    ], teacher.token)
    const questionType = getList(typeResponse)[0] || getData(typeResponse)?.questionTypes?.[0]
    expect(questionType?.id).toBeTruthy()

    const addQuestionResponse = await requestFirst(api, [
      {
        method: 'post',
        path: `/api/exams/${getId(createdExam)}/questions`,
        body: {
          questionTypeId: questionType.id,
          questionText: 'Which role can manage exam submissions?',
          points: 10,
          position: 1,
          metadata: {},
          options: [
            { optionText: 'Teacher', isCorrect: true, position: 1 },
            { optionText: 'Student', isCorrect: false, position: 2 }
          ]
        }
      },
      {
        method: 'post',
        path: '/api/questions',
        body: {
          examId: getId(createdExam),
          questionTypeId: questionType.id,
          questionText: 'Which role can manage exam submissions?',
          points: 10,
          position: 1,
          metadata: {},
          options: [
            { optionText: 'Teacher', isCorrect: true, position: 1 },
            { optionText: 'Student', isCorrect: false, position: 2 }
          ]
        }
      }
    ], teacher.token)

    expect([200, 201]).toContain(addQuestionResponse.status)
    createdQuestion = getData(addQuestionResponse)?.question || getData(addQuestionResponse)

    const publishResponse = await requestFirst(api, [
      {
        method: 'patch',
        path: `/api/exams/${getId(createdExam)}/status`,
        body: { status: 'published' }
      },
      {
        method: 'put',
        path: `/api/exams/${getId(createdExam)}`,
        body: {
          ...createdExam,
          status: 'published'
        }
      }
    ], teacher.token)

    expect([200, 204]).toContain(publishResponse.status)
  })

  test('student can load published exams, start, and submit a submission', async () => {
    const examsResponse = await api
      .get('/api/exams')
      .set(authHeader(student.token))

    expect(examsResponse.status).toBe(200)
    expect(getList(examsResponse).length).toBeGreaterThan(0)

    const questionsResponse = await requestFirst(api, [
      { path: `/api/exams/${getId(createdExam)}/questions` },
      { path: `/api/questions?examId=${getId(createdExam)}` }
    ], student.token)
    const question = getList(questionsResponse)[0] || createdQuestion
    const option = question?.options?.[0] || createdQuestion?.options?.[0]

    expect(getId(question)).toBeTruthy()
    expect(getId(option)).toBeTruthy()

    const startResponse = await requestFirst(api, [
      {
        method: 'post',
        path: '/api/submissions/start',
        body: { examId: getId(createdExam) }
      },
      {
        method: 'post',
        path: `/api/exams/${getId(createdExam)}/submissions/start`,
        body: {}
      }
    ], student.token)

    expect([200, 201]).toContain(startResponse.status)
    startedSubmission = getData(startResponse)?.submission || getData(startResponse)
    expect(getId(startedSubmission)).toBeTruthy()

    const answers = [
      {
        questionId: getId(question),
        selectedOptionId: getId(option),
        answerText: null
      }
    ]

    const submitResponse = await requestFirst(api, [
      {
        method: 'post',
        path: `/api/submissions/${getId(startedSubmission)}/answers`,
        body: { answers }
      },
      {
        method: 'post',
        path: `/api/submissions/${getId(startedSubmission)}/submit`,
        body: { answers }
      }
    ], student.token)

    expect([200, 201]).toContain(submitResponse.status)
  })

  test('teacher and admin can view submissions', async () => {
    const teacherResponse = await requestFirst(api, [
      { path: `/api/submissions/exam/${getId(createdExam)}` },
      { path: `/api/exams/${getId(createdExam)}/submissions` }
    ], teacher.token)

    expect(teacherResponse.status).toBe(200)
    expect(getList(teacherResponse).length).toBeGreaterThan(0)

    const adminResponse = await requestFirst(api, [
      { path: `/api/submissions/exam/${getId(createdExam)}` },
      { path: `/api/exams/${getId(createdExam)}/submissions` }
    ], admin.token)

    expect(adminResponse.status).toBe(200)
  })

  test('teacher can grade and publish result', async () => {
    const resultViewResponse = await api
      .get(`/api/results/submission/${getId(startedSubmission)}`)
      .set(authHeader(teacher.token))

    expect(resultViewResponse.status).toBe(200)

    const gradeResponse = await api
      .post(`/api/results/submission/${getId(startedSubmission)}/grade`)
      .set(authHeader(teacher.token))
      .send({
        score: 100,
        feedback: 'Excellent work from API test.'
      })

    expect([200, 201]).toContain(gradeResponse.status)
    gradedResult = getResult(gradeResponse)
    const gradedResultId = getResultId(gradeResponse)
    expect(gradedResultId).toBeTruthy()

    const publishResponse = await api
      .patch(`/api/results/${gradedResultId}/publish`)
      .set(authHeader(teacher.token))
      .send({})

    expect([200, 204]).toContain(publishResponse.status)
    gradedResult = getResult(publishResponse)
  })

  test('student can view published results', async () => {
    const resultsResponse = await api
      .get('/api/results/my')
      .set(authHeader(student.token))

    expect(resultsResponse.status).toBe(200)
    const publishedResults = getList(resultsResponse)
    expect(publishedResults.length).toBeGreaterThan(0)

    const gradedResultId = getResultId(gradedResult)
    const publishedResult =
      publishedResults.find((result) => getResultId(result) === gradedResultId) ||
      publishedResults.find((result) => result.status === 'published') ||
      publishedResults[0]
    const resultId = getResultId(publishedResult)

    expect(resultId).toBeTruthy()

    const resultDetailsResponse = await api
      .get(`/api/results/my/${resultId}`)
      .set(authHeader(student.token))

    expect(resultDetailsResponse.status).toBe(200)
    expect(getResultId(resultDetailsResponse)).toBe(resultId)
  })
})
