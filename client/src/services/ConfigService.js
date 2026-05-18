class ConfigService {
  getAppName() {
    return 'FullStack Exams App'
  }

  getApiMode() {
    return 'Mock API'
  }

  getVersion() {
    return '2.0'
  }
}

export const configService = new ConfigService()