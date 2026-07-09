import { API_BASE_URL } from './AuthApiService'
import { storageService } from './StorageService'

class ExamApiService {
  async getExams() {
    const response = await this.sendRequest('/exams')
    return response.data?.exams || []
  }

  async getExamById(examId) {
    const response = await this.sendRequest(`/exams/${examId}`)
    return response.data?.exam || null
  }

  async createExam(examData) {
    const response = await this.sendRequest('/exams', {
      method: 'POST',
      body: JSON.stringify(this.mapExamData(examData))
    })

    return response.data?.exam || null
  }

  async updateExam(examId, examData) {
    const response = await this.sendRequest(`/exams/${examId}`, {
      method: 'PUT',
      body: JSON.stringify(this.mapExamData(examData))
    })

    return response.data?.exam || null
  }

  async updateExamStatus(examId, status) {
    const response = await this.sendRequest(`/exams/${examId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    })

    return response.data?.exam || null
  }

  async getQuestionTypes() {
    const response = await this.sendRequest('/exams/question-types')
    const questionTypes =
      response.data?.questionTypes ||
      response.data?.question_types ||
      response.data?.types ||
      response.data ||
      []

    if (!Array.isArray(questionTypes)) {
      return []
    }

    return questionTypes
      .map((type) => this.mapQuestionType(type))
      .filter((type) => type.id)
  }

  async getExamQuestions(examId) {
    const response = await this.sendRequest(`/exams/${examId}/questions`)
    return response.data?.questions || []
  }

  async addQuestion(examId, questionData) {
    const response = await this.sendRequest(`/exams/${examId}/questions`, {
      method: 'POST',
      body: JSON.stringify(questionData)
    })

    return response.data?.question || null
  }

  mapExamData(examData) {
    return {
      title: examData.title,
      description: examData.description,
      durationMinutes: Number(examData.durationMinutes),
      status: examData.status
    }
  }

  mapQuestionType(type) {
    return {
      ...type,
      id: type.id || type.questionTypeId || type.question_type_id,
      name: type.name || type.typeName || type.type_name || type.code,
      code: type.code || type.typeCode || type.type_code
    }
  }

  async sendRequest(path, options = {}) {
    const token = storageService.get('token')

    if (!token) {
      throw new Error('You must be logged in to use the exams API')
    }

    try {
      const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          ...options.headers
        }
      })
      const data = await this.readResponse(response)

      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Exam API request failed')
      }

      return data
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error(
          'Could not connect to the backend server. Make sure it is running on http://localhost:5000',
          { cause: error }
        )
      }

      throw error
    }
  }

  async readResponse(response) {
    const contentType = response.headers.get('content-type')

    if (contentType && contentType.includes('application/json')) {
      return response.json()
    }

    return {
      success: response.ok,
      message: response.statusText,
      data: null
    }
  }
}

export const examApiService = new ExamApiService()
