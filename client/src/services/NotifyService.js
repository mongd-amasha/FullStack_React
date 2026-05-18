class NotifyService {
  success(message) {
    alert(`Success: ${message}`)
  }

  error(message) {
    alert(`Error: ${message}`)
  }

  info(message) {
    alert(message)
  }
}

export const notifyService = new NotifyService()