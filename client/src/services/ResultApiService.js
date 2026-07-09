import { API_BASE_URL } from './AuthApiService'
import { storageService } from './StorageService'

class ResultApiService {
  async getMyResults() {
    const response = await this.sendRequest('/results/my')
    return this.getArray(response.data, 'results')
  }

  async getMyResultById(resultId) {
    const response = await this.sendRequest(`/results/my/${resultId}`)
    return response.data?.result || response.data || null
  }

  async getExamSubmissions(examId) {
    const response = await this.sendRequest(`/submissions/exam/${examId}`)
    return this.getArray(response.data, 'submissions')
  }

  async getResultBySubmission(submissionId) {
    const response = await this.sendRequest(
      `/results/submission/${submissionId}`
    )

    return response.data?.result || response.data || null
  }

  async gradeSubmission(submissionId, gradeData) {
    const response = await this.sendRequest(
      `/results/submission/${submissionId}/grade`,
      {
        method: 'POST',
        body: JSON.stringify({
          score: Number(gradeData.score),
          feedback: gradeData.feedback
        })
      }
    )

    return response.data?.result || response.data || null
  }

  async publishResult(resultId) {
    const response = await this.sendRequest(`/results/${resultId}/publish`, {
      method: 'PATCH'
    })

    return response.data?.result || response.data || null
  }

  async getExamResults(examId) {
    const response = await this.sendRequest(`/results/exam/${examId}`)
    return this.getArray(response.data, 'results')
  }

  getArray(data, key) {
    const items = data?.[key] || data || []

    if (!Array.isArray(items)) {
      return []
    }

    return items
  }

  async sendRequest(path, options = {}) {
    const token = storageService.get('token')

    if (!token) {
      throw new Error('You must be logged in to use the results API')
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
        throw new Error(data.message || 'Results API request failed')
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

export const resultApiService = new ResultApiService()
