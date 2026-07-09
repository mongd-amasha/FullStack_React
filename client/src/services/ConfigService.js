class ConfigService {
  getAppName() {
    return 'FullStack Exams App'
  }

  getApiMode() {
    return 'Real Auth API'
  }

  getVersion() {
    return '2.0'
  }
}

export const configService = new ConfigService()
