class StorageService {
  save(key, value) {
    localStorage.setItem(key, JSON.stringify(value))
  }

  get(key) {
    const value = localStorage.getItem(key)

    if (!value) {
      return null
    }

    return JSON.parse(value)
  }

  remove(key) {
    localStorage.removeItem(key)
  }

  clear() {
    localStorage.clear()
  }
}

export const storageService = new StorageService()