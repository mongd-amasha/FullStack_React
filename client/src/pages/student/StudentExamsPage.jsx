import { useEffect, useState } from 'react'
import {
  examApiService,
  resultApiService,
  submissionApiService
} from '../../services'

function StudentExamsPage({ currentUser, onBack }) {
  const [exams, setExams] = useState([])
  const [selectedExam, setSelectedExam] = useState(null)
  const [questions, setQuestions] = useState([])
  const [submission, setSubmission] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [results, setResults] = useState([])
  const [selectedResult, setSelectedResult] = useState(null)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(false)
  const [submissionsLoading, setSubmissionsLoading] = useState(false)
  const [resultsLoading, setResultsLoading] = useState(false)
  const [resultLoading, setResultLoading] = useState(false)
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

  async function loadMyResults() {
    setResultsLoading(true)

    try {
      const resultsData = await resultApiService.getMyResults()
      setResults(resultsData)
    } catch (error) {
      setError(error.message || 'Failed to load results')
    } finally {
      setResultsLoading(false)
    }
  }

  useEffect(() => {
    loadExams()
    loadMySubmissions()
    loadMyResults()
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
      await loadMyResults()
    } catch (error) {
      setError(error.message || 'Failed to submit exam')
    } finally {
      setSubmitting(false)
    }
  }

  const openResult = async (resultId) => {
    setResultLoading(true)
    setSelectedResult(null)
    setError('')

    try {
      const result = await resultApiService.getMyResultById(resultId)
      setSelectedResult(result)
    } catch (error) {
      setError(error.message || 'Failed to load result details')
    } finally {
      setResultLoading(false)
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

  const formatText = (value) => {
    if (value === null || value === undefined) {
      return ''
    }

    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      return String(value)
    }

    if (Array.isArray(value)) {
      return value.map(formatText).filter(Boolean).join(', ')
    }

    if (typeof value === 'object') {
      const textValue =
        value.feedbackText ||
        value.feedback ||
        value.message ||
        value.text ||
        value.optionText ||
        value.questionText ||
        value.title ||
        value.fullName ||
        value.email

      if (textValue !== undefined && textValue !== null) {
        return formatText(textValue)
      }

      try {
        return JSON.stringify(value)
      } catch {
        return ''
      }
    }

    return String(value)
  }

  const getExamDuration = (exam) => {
    return exam.durationMinutes || exam.duration_minutes || 0
  }

  const getQuestionText = (question) => {
    return formatText(
      question?.questionText || question?.question_text || question?.text
    )
  }

  const getQuestionOptions = (question) => {
    return question?.options || []
  }

  const getOptionId = (option) => {
    return option?.id || option?.optionId || option?.option_id
  }

  const getOptionText = (option) => {
    return formatText(option?.optionText || option?.option_text || option?.text)
  }

  const getSubmissionExamTitle = (item) => {
    return formatText(
      item?.exam?.title || item?.examTitle || item?.exam_title || item?.title
    )
  }

  const getSubmissionStatus = (item) => {
    return formatText(item?.status || item?.result?.status || 'in progress')
  }

  const getResultId = (item) => {
    return item?.id || item?.resultId || item?.result_id || item?.result?.id
  }

  const getResultSubmissionId = (item) => {
    return item?.submissionId || item?.submission_id || item?.submission?.id
  }

  const getRelatedResult = (submissionItem) => {
    if (submissionItem.result) {
      return submissionItem.result
    }

    return results.find(
      (result) => getResultSubmissionId(result) === submissionItem.id
    )
  }

  const getResultScore = (item) => {
    return item?.result?.score ?? item?.score ?? item?.finalScore ?? null
  }

  const getResultFeedback = (item) => {
    return formatText(
      item?.result?.feedback ||
        item?.result?.feedbackText ||
        item?.result?.feedback_text ||
        item?.feedback ||
        item?.feedbackText ||
        item?.feedback_text ||
        item?.generalFeedback ||
        item?.general_feedback ||
        ''
    )
  }

  const getAnswerFeedback = (result) => {
    const feedbackItems =
      result?.answerFeedback ||
      result?.answer_feedback ||
      result?.answers ||
      result?.submission?.answers ||
      []

    if (Array.isArray(feedbackItems)) {
      return feedbackItems
    }

    if (feedbackItems && typeof feedbackItems === 'object') {
      if (
        feedbackItems.feedbackText ||
        feedbackItems.feedback ||
        feedbackItems.message ||
        feedbackItems.question ||
        feedbackItems.questionText ||
        feedbackItems.question_text ||
        feedbackItems.answerText ||
        feedbackItems.answer_text
      ) {
        return [feedbackItems]
      }

      return Object.values(feedbackItems)
    }

    return []
  }

  const getFeedbackQuestionText = (item) => {
    return formatText(
      item?.question?.questionText ||
        item?.question?.text ||
        item?.questionText ||
        item?.question_text ||
        'Question'
    )
  }

  const getFeedbackText = (item) => {
    return formatText(
      item?.feedbackText ||
        item?.feedback_text ||
        item?.feedback ||
        item?.teacherFeedback ||
        item?.teacher_feedback ||
        item?.message ||
        formatText(item)
    )
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
            <h1 className="fw-bold">{formatText(selectedExam.title)}</h1>
            <p className="text-muted mb-0">
              {formatText(selectedExam.description)}
            </p>
            <p className="text-muted small mb-0">
              Duration: {getExamDuration(selectedExam)} minutes
            </p>
            {currentUser && (
              <p className="text-muted small mb-0">
                Student: {formatText(currentUser.fullName || currentUser.email)}
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
                      Points: {formatText(question.points)}
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
              Logged in as {formatText(currentUser.fullName || currentUser.email)}
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
                <h4 className="fw-bold">{formatText(exam.title)}</h4>
                <p className="text-muted">{formatText(exam.description)}</p>
                <p className="text-muted small mb-2">
                  Duration: {getExamDuration(exam)} minutes
                </p>
                <span className="badge bg-success mb-3">
                  {formatText(exam.status || 'published')}
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
          My Submissions / Results
        </div>

        <div className="card-body">
          {(submissionsLoading || resultsLoading) && (
            <div className="alert alert-info">Loading results...</div>
          )}

          {!submissionsLoading &&
            !resultsLoading &&
            submissions.length === 0 &&
            results.length === 0 && (
              <p className="text-muted mb-0">No submissions yet.</p>
            )}

          {submissions.map((item) => {
            const result = getRelatedResult(item)
            const resultId = getResultId(result)
            const score = getResultScore(result)
            const feedback = getResultFeedback(result)

            return (
              <div className="border rounded p-3 mb-3" key={item.id}>
                <h5 className="fw-bold mb-1">
                  {getSubmissionExamTitle(item) || 'Exam'}
                </h5>
                <p className="text-muted mb-2">
                  Submission status: {getSubmissionStatus(item)}
                </p>
                {result ? (
                  <>
                    <p className="mb-1">
                      Score: {score === null ? 'Not graded yet' : formatText(score)}
                    </p>
                    <p className="mb-2">
                      Feedback: {feedback || 'No feedback yet'}
                    </p>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => openResult(resultId)}
                      disabled={!resultId || resultLoading}
                    >
                      {resultLoading ? 'Loading...' : 'View Result'}
                    </button>
                  </>
                ) : (
                  <p className="mb-0">Result: Not published yet</p>
                )}
              </div>
            )
          })}

          {results
            .filter(
              (result) =>
                !submissions.some(
                  (item) => item.id === getResultSubmissionId(result)
                )
            )
            .map((result) => (
              <div className="border rounded p-3 mb-3" key={getResultId(result)}>
                <h5 className="fw-bold mb-1">
                  {getSubmissionExamTitle(result) || 'Exam'}
                </h5>
                <p className="mb-1">
                  Score: {formatText(getResultScore(result))}
                </p>
                <p className="mb-2">
                  Feedback: {getResultFeedback(result) || 'No feedback yet'}
                </p>
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => openResult(getResultId(result))}
                  disabled={resultLoading}
                >
                  {resultLoading ? 'Loading...' : 'View Result'}
                </button>
              </div>
            ))}

          {selectedResult && (
            <div className="alert alert-light border mt-3 mb-0">
              <h5 className="fw-bold">Result Details</h5>
              <p className="mb-1">
                Score: {formatText(getResultScore(selectedResult))}
              </p>
              <p className="mb-3">
                Feedback: {getResultFeedback(selectedResult) || 'No feedback'}
              </p>

              {getAnswerFeedback(selectedResult).length > 0 && (
                <>
                  <h6 className="fw-bold">Answer Feedback</h6>
                  {getAnswerFeedback(selectedResult).map((item, index) => (
                    <div className="border rounded p-2 mb-2" key={index}>
                      <p className="fw-bold mb-1">
                        {getFeedbackQuestionText(item)}
                      </p>
                      <p className="mb-0">
                        {getFeedbackText(item) || 'No answer feedback'}
                      </p>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StudentExamsPage
