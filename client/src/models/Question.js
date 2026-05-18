class Question {
  constructor(id, examId, text, options, correctAnswer) {
    this.id = id
    this.examId = examId
    this.text = text
    this.options = options
    this.correctAnswer = correctAnswer
  }
}

export default Question