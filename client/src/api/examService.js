import { mockDb } from './mockDb'

export function getExams() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockDb.exams)
    }, 700)
  })
}

export function getStudents() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockDb.students)
    }, 700)
  })
}