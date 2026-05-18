class LoggerService {
  info(message) {
    console.log(`[INFO]: ${message}`)
  }

  warning(message) {
    console.warn(`[WARNING]: ${message}`)
  }

  error(message) {
    console.error(`[ERROR]: ${message}`)
  }
}

export const loggerService = new LoggerService()