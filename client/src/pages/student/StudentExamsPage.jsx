import { useEffect, useState } from 'react'
import { examApiService, submissionApiService } from '../../services'

function StudentExamsPage({ currentUser, onBack }) {
  const [exams, setExams] = useState([])
  const [selectedExam, setSelectedExam] = useState(null)
  const [questions, setQuestions] = useState([])
  const [submission, setSubmission] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(false)
  const [submissionsLoading, setSubmissionsLoading] = useState(false)
  const [examLoading, setExamLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function loadExams() {
    setLoading(true)
    setError('')

    try {
      const examsData = await examApiService.getExams()
      setExams(examsData)
    } catch (error) {
      setError(error.message || 'Failed to load exams')
    } finally {
      setLoading(false)
    }
  }

  async function loadMySubmissions() {
    setSubmissionsLoading(true)

    try {
      const submissionsData = await submissionApiService.getMySubmissions()
      setSubmissions(submissionsData)
    } catch (error) {
      setError(error.message || 'Failed to load submissions')
    } finally {
      setSubmissionsLoading(false)
    }
  }

  useEffect(() => {
    loadExams()
    loadMySubmissions()
  }, [])

  const openExam = async (exam) => {
    setExamLoading(true)
    setError('')
    setMessage('')
    setAnswers({})
    setSubmission(null)

    try {
      const examQuestions = await examApiService.getExamQuestions(exam.id)
      const startedSubmission = await submissionApiService.startSubmission(
        exam.id
      )

      setSelectedExam(exam)
      setQuestions(examQuestions)
      setSubmission(startedSubmission)
    } catch (error) {
      setError(error.message || 'Failed to open exam')
    } finally {
      setExamLoading(false)
    }
  }

  const handleOptionAnswerChange = (questionId, selectedOptionId) => {
    setAnswers({
      ...answers,
      [questionId]: {
        questionId,
        selectedOptionId,
        answerText: ''
      }
    })
  }

  const handleTextAnswerChange = (questionId, answerText) => {
    setAnswers({
      ...answers,
      [questionId]: {
        questionId,
        selectedOptionId: '',
        answerText
      }
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!submission?.id) {
      setError('Submission was not started. Please reopen the exam.')
      return
    }

    const missingQuestion = questions.find((question) => {
      const answer = answers[question.id]

      if (getQuestionOptions(question).length > 0) {
        return !answer?.selectedOptionId
      }

      return !answer?.answerText?.trim()
    })

    if (missingQuestion) {
      setError('Please answer all questions before submitting')
      return
    }

    const submissionAnswers = questions.map((question) => {
      const answer = answers[question.id]

      return {
        questionId: question.id,
        selectedOptionId: answer.selectedOptionId || null,
        answerText: answer.answerText?.trim() || null
      }
    })

    setSubmitting(true)

    try {
      const submittedSubmission = await submissionApiService.submitAnswers(
        submission.id,
        submissionAnswers
      )

      setSubmission(submittedSubmission || submission)
      setMessage('Exam submitted successfully')
      await loadMySubmissions()
    } catch (error) {
      setError(error.message || 'Failed to submit exam')
    } finally {
      setSubmitting(false)
    }
  }

  const backToExamList = () => {
    setSelectedExam(null)
    setQuestions([])
    setAnswers({})
    setSubmission(null)
    setMessage('')
    setError('')
  }

  const getExamDuration = (exam) => {
    return exam.durationMinutes || exam.duration_minutes || 0
  }

  const getQuestionText = (question) => {
    return question.questionText || question.question_text || question.text
  }

  const getQuestionOptions = (question) => {
    return question.options || []
  }

  const getOptionId = (option) => {
    return option.id || option.optionId || option.option_id
  }

  const getOptionText = (option) => {
    return option.optionText || option.option_text || option.text
  }

  const getSubmissionExamTitle = (item) => {
    return item.exam?.title || item.examTitle || item.exam_title || item.title
  }

  const getSubmissionStatus = (item) => {
    return item.status || item.result?.status || 'in progress'
  }

  const getSubmissionScore = (item) => {
    return item.result?.score ?? item.score ?? item.finalScore ?? null
  }

  const isSubmitted =
    submission?.status === 'submitted' ||
    submission?.submittedAt ||
    submission?.submitted_at

  if (selectedExam) {
    return (
      <div className="container py-5">
        {error && <div className="alert alert-danger">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}

        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="fw-bold">{selectedExam.title}</h1>
            <p className="text-muted mb-0">{selectedExam.description}</p>
            <p className="text-muted small mb-0">
              Duration: {getExamDuration(selectedExam)} minutes
            </p>
            {currentUser && (
              <p className="text-muted small mb-0">
                Student: {currentUser.fullName || currentUser.email}
              </p>
            )}
          </div>

          <button className="btn btn-outline-primary" onClick={backToExamList}>
            Back to Exams
          </button>
        </div>

        {examLoading && (
          <div className="alert alert-info text-center">Opening exam...</div>
        )}

        <div className="card shadow-sm">
          <div className="card-header bg-primary text-white fw-bold">
            Exam Questions
          </div>

          <div className="card-body">
            {isSubmitted && (
              <div className="alert alert-success">
                Exam submitted successfully.
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {questions.map((question, index) => (
                <div className="border rounded p-3 mb-3" key={question.id}>
                  <h5 className="fw-bold">
                    {index + 1}. {getQuestionText(question)}
                  </h5>

                  {question.points && (
                    <p className="text-muted small mb-2">
                      Points: {question.points}
                    </p>
                  )}

                  {getQuestionOptions(question).length > 0 ? (
                    getQuestionOptions(question).map((option) => {
                      const optionId = getOptionId(option)

                      return (
                        <div className="form-check" key={optionId}>
                          <input
                            className="form-check-input"
                            type="radio"
                            name={`question-${question.id}`}
                            value={optionId}
                            checked={
                              answers[question.id]?.selectedOptionId ===
                              optionId
                            }
                            onChange={() =>
                              handleOptionAnswerChange(question.id, optionId)
                            }
                            disabled={!!isSubmitted}
                            required
                          />

                          <label className="form-check-label">
                            {getOptionText(option)}
                          </label>
                        </div>
                      )
                    })
                  ) : (
                    <textarea
                      className="form-control"
                      rows="3"
                      value={answers[question.id]?.answerText || ''}
                      onChange={(event) =>
                        handleTextAnswerChange(question.id, event.target.value)
                      }
                      disabled={!!isSubmitted}
                      required
                    />
                  )}
                </div>
              ))}

              {!isSubmitted && (
                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={submitting || questions.length === 0}
                >
                  {submitting ? 'Submitting...' : 'Submit Exam'}
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
          {currentUser && (
            <p className="text-muted small mb-0">
              Logged in as {currentUser.fullName || currentUser.email}
            </p>
          )}
        </div>

        <button className="btn btn-outline-primary" onClick={onBack}>
          Back to Dashboard
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}
      {loading && <div className="alert alert-info">Loading exams...</div>}

      <div className="row g-4">
        {exams.map((exam) => (
          <div className="col-md-6" key={exam.id}>
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h4 className="fw-bold">{exam.title}</h4>
                <p className="text-muted">{exam.description}</p>
                <p className="text-muted small mb-2">
                  Duration: {getExamDuration(exam)} minutes
                </p>
                <span className="badge bg-success mb-3">
                  {exam.status || 'published'}
                </span>

                <br />

                <button
                  className="btn btn-primary"
                  onClick={() => openExam(exam)}
                  disabled={examLoading}
                >
                  {examLoading ? 'Opening...' : 'Start Exam'}
                </button>
              </div>
            </div>
          </div>
        ))}

        {exams.length === 0 && !loading && (
          <div className="col-12">
            <div className="alert alert-warning">No active exams available.</div>
          </div>
        )}
      </div>

      <div className="card shadow-sm mt-4">
        <div className="card-header bg-success text-white fw-bold">
          My Submissions
        </div>

        <div className="card-body">
          {submissionsLoading && (
            <div className="alert alert-info">Loading submissions...</div>
          )}

          {!submissionsLoading && submissions.length === 0 && (
            <p className="text-muted mb-0">No submissions yet.</p>
          )}

          {submissions.map((item) => {
            const score = getSubmissionScore(item)

            return (
              <div className="border rounded p-3 mb-3" key={item.id}>
                <h5 className="fw-bold mb-1">
                  {getSubmissionExamTitle(item) || 'Exam'}
                </h5>
                <p className="text-muted mb-2">
                  Status: {getSubmissionStatus(item)}
                </p>
                <p className="mb-0">
                  Score: {score === null ? 'Not graded yet' : score}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default StudentExamsPage
