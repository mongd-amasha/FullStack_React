import { API_BASE_URL } from './AuthApiService'
import { storageService } from './StorageService'

class SubmissionApiService {
  async startSubmission(examId) {
    const response = await this.sendRequest('/submissions/start', {
      method: 'POST',
      body: JSON.stringify({ examId })
    })

    return response.data?.submission || response.data || null
  }

  async submitAnswers(submissionId, answers) {
    const response = await this.sendRequest(
      `/submissions/${submissionId}/submit`,
      {
        method: 'POST',
        body: JSON.stringify({ answers })
      }
    )

    return response.data?.submission || response.data || null
  }

  async getMySubmissions() {
    const response = await this.sendRequest('/submissions/my')
    const submissions = response.data?.submissions || response.data || []

    if (!Array.isArray(submissions)) {
      return []
    }

    return submissions
  }

  async sendRequest(path, options = {}) {
    const token = storageService.get('token')

    if (!token) {
      throw new Error('You must be logged in to use the submissions API')
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
        throw new Error(data.message || 'Submission API request failed')
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

export const submissionApiService = new SubmissionApiService()
