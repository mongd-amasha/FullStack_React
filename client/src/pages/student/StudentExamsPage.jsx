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
      <div className="container page-container">
        {error && <div className="alert alert-danger">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}

        <div className="page-header">
          <div>
            <p className="page-kicker">Exam Session</p>
            <h1 className="page-title">{formatText(selectedExam.title)}</h1>
            <p className="page-subtitle mb-0">
              {formatText(selectedExam.description)}
            </p>
            <p className="page-meta mb-0">
              Duration: {getExamDuration(selectedExam)} minutes
            </p>
            {currentUser && (
              <p className="page-meta mb-0">
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

        <section className="section-card">
          <div className="section-card-header">
            <h2 className="section-card-title">Exam Questions</h2>
          </div>

          <div className="section-card-body">
            {isSubmitted && (
              <div className="alert alert-success">
                Exam submitted successfully.
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="question-list">
                {questions.map((question, index) => (
                  <article className="question-card" key={question.id}>
                    <h3 className="h5 question-card-title">
                      {index + 1}. {getQuestionText(question)}
                    </h3>

                    {question.points && (
                      <p className="text-muted small mb-3">
                        Points: {formatText(question.points)}
                      </p>
                    )}

                    {getQuestionOptions(question).length > 0 ? (
                      getQuestionOptions(question).map((option) => {
                        const optionId = getOptionId(option)

                        return (
                          <div className="form-check answer-option" key={optionId}>
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
                  </article>
                ))}
              </div>

              {!isSubmitted && (
                <button
                  type="submit"
                  className="btn btn-success mt-3"
                  disabled={submitting || questions.length === 0}
                >
                  {submitting ? 'Submitting...' : 'Submit Exam'}
                </button>
              )}
            </form>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="container page-container">
      <div className="page-header">
        <div>
          <p className="page-kicker">Student Workspace</p>
          <h1 className="page-title">Student Exams</h1>
          <p className="page-subtitle mb-0">
            View available exams, answer questions, and see your result.
          </p>
          {currentUser && (
            <p className="page-meta mb-0">
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
            <article className="exam-card h-100">
              <div className="exam-card-header">
                <div>
                  <h3 className="h4 exam-card-title">
                    {formatText(exam.title)}
                  </h3>
                  <p className="text-muted">{formatText(exam.description)}</p>
                  <div className="exam-meta">
                    <span>Duration: {getExamDuration(exam)} minutes</span>
                  </div>
                </div>

                <span className="badge bg-success status-badge">
                  {formatText(exam.status || 'published')}
                </span>
              </div>

              <div className="exam-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => openExam(exam)}
                  disabled={examLoading}
                >
                  {examLoading ? 'Opening...' : 'Start Exam'}
                </button>
              </div>
            </article>
          </div>
        ))}

        {exams.length === 0 && !loading && (
          <div className="col-12">
            <div className="empty-state">No active exams available.</div>
          </div>
        )}
      </div>

      <section className="section-card management-section">
        <div className="section-card-header">
          <h2 className="section-card-title">My Submissions / Results</h2>
        </div>

        <div className="section-card-body">
          {(submissionsLoading || resultsLoading) && (
            <div className="alert alert-info">Loading results...</div>
          )}

          {!submissionsLoading &&
            !resultsLoading &&
            submissions.length === 0 &&
            results.length === 0 && (
              <div className="empty-state">No submissions yet.</div>
            )}

          <div className="result-list">
            {submissions.map((item) => {
              const result = getRelatedResult(item)
              const resultId = getResultId(result)
              const score = getResultScore(result)
              const feedback = getResultFeedback(result)

              return (
                <article className="result-card" key={item.id}>
                  <div className="result-card-header">
                    <div>
                      <h3 className="h5 result-card-title">
                        {getSubmissionExamTitle(item) || 'Exam'}
                      </h3>
                      <p className="text-muted mb-2">
                        Submission status: {getSubmissionStatus(item)}
                      </p>
                    </div>
                  </div>
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
                </article>
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
                <article className="result-card" key={getResultId(result)}>
                  <h3 className="h5 result-card-title">
                    {getSubmissionExamTitle(result) || 'Exam'}
                  </h3>
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
                </article>
              ))}
          </div>

          {selectedResult && (
            <div className="result-detail-panel">
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
                    <div className="question-card mb-2" key={index}>
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
      </section>
    </div>
  )
}

export default StudentExamsPage
