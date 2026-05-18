import { mockDatabase } from '../data/mockDatabase'
import { loggerService } from './LoggerService'

class MockApiService {
  async getUsers() {
    loggerService.info('Loading users from mock database')
    return mockDatabase.users
  }

  async getStudents() {
    loggerService.info('Loading students from mock database')
    return mockDatabase.users.filter((user) => user.role === 'student')
  }

  async getTeachers() {
    loggerService.info('Loading teachers from mock database')
    return mockDatabase.users.filter((user) => user.role === 'teacher')
  }

  async login(email, password) {
    loggerService.info('Trying login from mock database')

    const user = mockDatabase.users.find(
      (item) => item.email === email && item.password === password
    )

    if (!user) {
      return null
    }

    return user
  }

  async register(userData) {
    loggerService.info('Registering new user in mock database')

    const newUser = {
      id: mockDatabase.users.length + 1,
      ...userData
    }

    mockDatabase.users.push(newUser)

    return newUser
  }

  async getExams() {
    loggerService.info('Loading exams from mock database')
    return mockDatabase.exams
  }

  async getExamById(examId) {
    loggerService.info(`Loading exam ${examId} from mock database`)
    return mockDatabase.exams.find((exam) => exam.id === examId)
  }

  async getQuestionsByExamId(examId) {
    loggerService.info(`Loading questions for exam ${examId}`)
    return mockDatabase.questions.filter((question) => question.examId === examId)
  }

  async getSubmissions() {
    loggerService.info('Loading submissions from mock database')
    return mockDatabase.submissions
  }

  async getResults() {
    loggerService.info('Loading results from mock database')
    return mockDatabase.results
  }
}

export const mockApiService = new MockApiService()