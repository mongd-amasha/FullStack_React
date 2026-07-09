import { storageService } from './StorageService'

export const API_BASE_URL = 'http://localhost:5000/api'

class AuthApiService {
  async login(email, password) {
    const response = await this.sendRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: email.trim(),
        password
      })
    })

    return this.saveAuthResponse(
      response.data,
      'Login response was missing user or token'
    )
  }

  async register({ fullName, email, password, role }) {
    const response = await this.sendRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        role
      })
    })

    return this.saveAuthResponse(
      response.data,
      'Registration response was missing user or token'
    )
  }

  getToken() {
    return storageService.get('token')
  }

  getCurrentUser() {
    return storageService.get('currentUser')
  }

  logout() {
    storageService.remove('token')
    storageService.remove('currentUser')
    storageService.remove('screen')
  }

  saveAuthResponse(authData, fallbackMessage) {
    if (!authData?.user || !authData?.token) {
      throw new Error(fallbackMessage)
    }

    storageService.set('token', authData.token)
    storageService.set('currentUser', authData.user)

    return authData.user
  }

  async sendRequest(path, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      })
      const data = await this.readResponse(response)

      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Request failed')
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

export const authApiService = new AuthApiService()
