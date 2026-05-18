class NotifyService {
  success(message) {
    return {
      type: 'success',
      message
    }
  }

  info(message) {
    return {
      type: 'info',
      message
    }
  }

  error(message) {
    return {
      type: 'danger',
      message
    }
  }
}

export const notifyService = new NotifyService()