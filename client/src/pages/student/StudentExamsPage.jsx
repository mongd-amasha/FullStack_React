import { useEffect, useState } from 'react'
import { mockApiService } from '../../services'

function StudentExamsPage({ currentUser, onBack }) {
  const [exams, setExams] = useState([])
  const [selectedExam, setSelectedExam] = useState(null)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)

  useEffect(() => {
    loadExams()
  }, [])

  const loadExams = async () => {
    const examsData = await mockApiService.getActiveExams()
    setExams([...examsData])
  }

  const openExam = async (exam) => {
    const examQuestions = await mockApiService.getQuestionsByExamId(exam.id)
    const savedResult = await mockApiService.getResultByStudentAndExam(
      currentUser?.id || 2,
      exam.id
    )

    setSelectedExam(exam)
    setQuestions(examQuestions)
    setAnswers({})
    setResult(savedResult || null)
  }

  const handleAnswerChange = (questionId, answer) => {
    setAnswers({
      ...answers,
      [questionId]: answer
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const submitResult = await mockApiService.submitExamAnswers(
      selectedExam.id,
      currentUser?.id || 2,
      answers
    )

    setResult(submitResult)
  }

  const backToExamList = () => {
    setSelectedExam(null)
    setQuestions([])
    setAnswers({})
    setResult(null)
  }

  if (selectedExam) {
    return (
      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="fw-bold">{selectedExam.title}</h1>
            <p className="text-muted mb-0">{selectedExam.description}</p>
          </div>

          <button className="btn btn-outline-primary" onClick={backToExamList}>
            Back to Exams
          </button>
        </div>

        <div className="card shadow-sm">
          <div className="card-header bg-primary text-white fw-bold">
            Exam Questions
          </div>

          <div className="card-body">
            {result && (
              <div className="alert alert-info">
                <h4 className="fw-bold mb-1">Exam submitted</h4>
                <p className="mb-1">Score: {result.score}</p>
                <p className="mb-0">Status: {result.status}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {questions.map((question, index) => (
                <div className="border rounded p-3 mb-3" key={question.id}>
                  <h5 className="fw-bold">
                    {index + 1}. {question.text}
                  </h5>

                  {question.options.map((option) => (
                    <div className="form-check" key={option}>
                      <input
                        className="form-check-input"
                        type="radio"
                        name={`question-${question.id}`}
                        value={option}
                        checked={answers[question.id] === option}
                        onChange={() => handleAnswerChange(question.id, option)}
                        disabled={!!result}
                        required
                      />

                      <label className="form-check-label">{option}</label>
                    </div>
                  ))}
                </div>
              ))}

              {!result && (
                <button type="submit" className="btn btn-success">
                  Submit Exam
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold">Student Exams</h1>
          <p className="text-muted mb-0">
            View available exams, answer questions, and see your result.
          </p>
        </div>

        <button className="btn btn-outline-primary" onClick={onBack}>
          Back to Dashboard
        </button>
      </div>

      <div className="row g-4">
        {exams.map((exam) => (
          <div className="col-md-6" key={exam.id}>
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h4 className="fw-bold">{exam.title}</h4>
                <p className="text-muted">{exam.description}</p>
                <span className="badge bg-success mb-3">{exam.status}</span>

                <br />

                <button
                  className="btn btn-primary"
                  onClick={() => openExam(exam)}
                >
                  Open Exam
                </button>
              </div>
            </div>
          </div>
        ))}

        {exams.length === 0 && (
          <div className="col-12">
            <div className="alert alert-warning">No active exams available.</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentExamsPage