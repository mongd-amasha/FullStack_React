class ConfigService {
  constructor() {
    this.appName = 'Exam Management App'
    this.version = '1.0.0'
    this.defaultLanguage = 'en'
  }

  getAppName() {
    return this.appName
  }

  getVersion() {
    return this.version
  }

  getDefaultLanguage() {
    return this.defaultLanguage
  }
}

export const configService = new ConfigService()