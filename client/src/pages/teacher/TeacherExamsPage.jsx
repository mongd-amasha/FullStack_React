import { useEffect, useState } from 'react'
import { examApiService, resultApiService } from '../../services'

function TeacherExamsPage({ currentUser, onBack }) {
  const [exams, setExams] = useState([])
  const [editingExamId, setEditingExamId] = useState(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(60)
  const [status, setStatus] = useState('draft')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [selectedExam, setSelectedExam] = useState(null)
  const [questions, setQuestions] = useState([])
  const [questionTypes, setQuestionTypes] = useState([])
  const [questionText, setQuestionText] = useState('')
  const [selectedQuestionTypeId, setSelectedQuestionTypeId] = useState('')
  const [questionPoints, setQuestionPoints] = useState(10)
  const [questionOptions, setQuestionOptions] = useState(['', '', '', ''])
  const [correctOptionIndex, setCorrectOptionIndex] = useState(0)
  const [questionsLoading, setQuestionsLoading] = useState(false)
  const [selectedSubmissionsExam, setSelectedSubmissionsExam] = useState(null)
  const [examSubmissions, setExamSubmissions] = useState([])
  const [examResults, setExamResults] = useState([])
  const [submissionsLoading, setSubmissionsLoading] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [submissionResult, setSubmissionResult] = useState(null)
  const [resultLoading, setResultLoading] = useState(false)
  const [gradingScore, setGradingScore] = useState(0)
  const [gradingFeedback, setGradingFeedback] = useState('')
  const [gradingLoading, setGradingLoading] = useState(false)

  const loadExams = async () => {
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

  useEffect(() => {
    let isCurrent = true

    async function loadInitialExams() {
      try {
        const examsData = await examApiService.getExams()

        if (isCurrent) {
          setExams(examsData)
        }
      } catch (error) {
        if (isCurrent) {
          setError(error.message || 'Failed to load exams')
        }
      } finally {
        if (isCurrent) {
          setLoading(false)
        }
      }
    }

    async function loadInitialQuestionTypes() {
      try {
        const types = await examApiService.getQuestionTypes()

        if (isCurrent) {
          setQuestionTypes(types)

          if (types.length > 0) {
            setSelectedQuestionTypeId(types[0].id)
          }
        }
      } catch (error) {
        if (isCurrent) {
          setError(error.message || 'Failed to load question types')
        }
      }
    }

    loadInitialExams()
    loadInitialQuestionTypes()

    return () => {
      isCurrent = false
    }
  }, [])

  const clearForm = () => {
    setEditingExamId(null)
    setTitle('')
    setDescription('')
    setDurationMinutes(60)
    setStatus('draft')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')

    try {
      const examData = {
        title,
        description,
        durationMinutes,
        status
      }

      if (editingExamId) {
        await examApiService.updateExam(editingExamId, examData)
        setMessage('Exam updated successfully')
      } else {
        await examApiService.createExam(examData)
        setMessage('Exam created successfully')
      }

      clearForm()
      loadExams()
    } catch (error) {
      setError(error.message || 'Failed to save exam')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (exam) => {
    setEditingExamId(exam.id)
    setTitle(exam.title)
    setDescription(exam.description || '')
    setDurationMinutes(exam.durationMinutes || exam.duration_minutes || 60)
    setStatus(exam.status)
  }

  const handleStatusChange = async (examId, newStatus) => {
    setMessage('')
    setError('')

    try {
      await examApiService.updateExamStatus(examId, newStatus)
      setMessage('Exam status updated successfully')
      loadExams()
    } catch (error) {
      setError(error.message || 'Failed to update exam status')
    }
  }

  const openSubmissions = async (exam) => {
    setSelectedSubmissionsExam(exam)
    setSelectedSubmission(null)
    setSubmissionResult(null)
    setExamSubmissions([])
    setExamResults([])
    setSubmissionsLoading(true)
    setMessage('')
    setError('')

    try {
      const submissions = await resultApiService.getExamSubmissions(exam.id)
      const results = await resultApiService.getExamResults(exam.id)
      setExamSubmissions(submissions)
      setExamResults(results)
    } catch (error) {
      setError(error.message || 'Failed to load exam submissions')
    } finally {
      setSubmissionsLoading(false)
    }
  }

  const openReviewSubmission = async (submission) => {
    setSelectedSubmission(submission)
    setSubmissionResult(null)
    setResultLoading(true)
    setMessage('')
    setError('')

    try {
      const result = await resultApiService.getResultBySubmission(submission.id)
      setSubmissionResult(result)
      setGradingScore(getResultScore(result) || getSubmissionScore(submission) || 0)
      setGradingFeedback(getResultFeedback(result))
    } catch (error) {
      setGradingScore(getSubmissionScore(submission) || 0)
      setGradingFeedback('')
      setError(error.message || 'Failed to load submission result')
    } finally {
      setResultLoading(false)
    }
  }

  const handleSaveGrade = async (event) => {
    event.preventDefault()
    setGradingLoading(true)
    setMessage('')
    setError('')

    try {
      const result = await resultApiService.gradeSubmission(
        selectedSubmission.id,
        {
          score: gradingScore,
          feedback: gradingFeedback
        }
      )

      setSubmissionResult(result)
      setMessage('Grade saved successfully')
    } catch (error) {
      setError(error.message || 'Failed to save grade')
    } finally {
      setGradingLoading(false)
    }
  }

  const handlePublishResult = async () => {
    const resultId = getResultId(submissionResult)

    if (!resultId) {
      setError('Save a grade before publishing the result')
      return
    }

    setGradingLoading(true)
    setMessage('')
    setError('')

    try {
      const result = await resultApiService.publishResult(resultId)
      setSubmissionResult(result)
      setMessage('Result published successfully')
    } catch (error) {
      setError(error.message || 'Failed to publish result')
    } finally {
      setGradingLoading(false)
    }
  }

  const openQuestions = async (exam) => {
    setSelectedExam(exam)
    setQuestionsLoading(true)
    setMessage('')
    setError('')

    if (!selectedQuestionTypeId && questionTypes.length > 0) {
      setSelectedQuestionTypeId(questionTypes[0].id)
    }

    try {
      const examQuestions = await examApiService.getExamQuestions(exam.id)
      setQuestions(examQuestions)
    } catch (error) {
      setError(error.message || 'Failed to load exam questions')
    } finally {
      setQuestionsLoading(false)
    }
  }

  const handleQuestionOptionChange = (index, value) => {
    const updatedOptions = [...questionOptions]
    updatedOptions[index] = value
    setQuestionOptions(updatedOptions)
  }

  const clearQuestionForm = () => {
    setQuestionText('')
    setQuestionPoints(10)
    setQuestionOptions(['', '', '', ''])
    setCorrectOptionIndex(0)
  }

  const handleAddQuestion = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')

    const cleanOptions = questionOptions
      .map((optionText, index) => ({
        optionText: optionText.trim(),
        isCorrect: index === Number(correctOptionIndex),
        position: index + 1
      }))
      .filter((option) => option.optionText)

    if (cleanOptions.length < 2) {
      setError('Please add at least two answer options')
      return
    }

    if (!cleanOptions.some((option) => option.isCorrect)) {
      setError('Please choose the correct answer')
      return
    }

    if (!selectedQuestionTypeId) {
      setError('Please choose a question type')
      return
    }

    try {
      await examApiService.addQuestion(selectedExam.id, {
        questionTypeId: selectedQuestionTypeId,
        questionText,
        points: Number(questionPoints),
        position: questions.length + 1,
        metadata: {},
        options: cleanOptions
      })
      setMessage('Question added successfully')
      clearQuestionForm()
      openQuestions(selectedExam)
    } catch (error) {
      setError(error.message || 'Failed to add question')
    }
  }

  const getStatusBadgeClass = (examStatus) => {
    if (examStatus === 'published') {
      return 'bg-success'
    }

    if (examStatus === 'closed') {
      return 'bg-secondary'
    }

    if (examStatus === 'archived') {
      return 'bg-dark'
    }

    return 'bg-warning text-dark'
  }

  const getQuestionTitle = (question) => {
    return formatText(
      question?.questionText || question?.question_text || question?.text
    )
  }

  const getQuestionOptions = (question) => {
    return question?.options || []
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

  const getSubmissionStudentName = (submission) => {
    return formatText(
      submission?.student?.fullName ||
        submission?.student?.email ||
        submission?.studentName ||
        submission?.student_name ||
        submission?.fullName ||
        submission?.email ||
        'Student'
    )
  }

  const getSubmissionStatus = (submission) => {
    return formatText(
      submission?.status || submission?.submissionStatus || 'submitted'
    )
  }

  const getResultSubmissionId = (result) => {
    return result?.submissionId || result?.submission_id || result?.submission?.id
  }

  const getRelatedExamResult = (submission) => {
    if (submission.result) {
      return submission.result
    }

    return examResults.find(
      (result) => getResultSubmissionId(result) === submission.id
    )
  }

  const getSubmissionScore = (submission, result = null) => {
    return (
      result?.score ??
      submission?.result?.score ??
      submission?.score ??
      submission?.finalScore ??
      submission?.final_score ??
      null
    )
  }

  const getResultId = (result) => {
    return result?.id || result?.resultId || result?.result_id || result?.result?.id
  }

  const getResultScore = (result) => {
    return result?.score ?? result?.result?.score ?? null
  }

  const getResultFeedback = (result) => {
    return formatText(
      result?.feedbackText ||
        result?.feedback_text ||
        result?.feedback ||
        result?.generalFeedback ||
        result?.general_feedback ||
        result?.result?.feedbackText ||
        result?.result?.feedback ||
        ''
    )
  }

  const getSubmissionAnswers = (result) => {
    const answers =
      result?.answers ||
      result?.submission?.answers ||
      result?.submissionAnswers ||
      result?.submission_answers ||
      []

    if (Array.isArray(answers)) {
      return answers
    }

    if (answers && typeof answers === 'object') {
      if (
        answers.question ||
        answers.questionText ||
        answers.question_text ||
        answers.selectedOption ||
        answers.selectedOptionText ||
        answers.selected_option_text ||
        answers.answerText ||
        answers.answer_text ||
        answers.feedbackText ||
        answers.feedback
      ) {
        return [answers]
      }

      return Object.values(answers)
    }

    return []
  }

  const getAnswerQuestionText = (answer) => {
    return formatText(
      answer?.question?.questionText ||
        answer?.question?.text ||
        answer?.questionText ||
        answer?.question_text ||
        'Question'
    )
  }

  const getAnswerText = (answer) => {
    return formatText(
      answer?.selectedOption?.optionText ||
        answer?.selectedOption?.text ||
        answer?.selectedOptionText ||
        answer?.selected_option_text ||
        answer?.answerText ||
        answer?.answer_text ||
        formatText(answer) ||
        'No answer'
    )
  }

  return (
    <div className="container page-container">
      <div className="page-header">
        <div>
          <p className="page-kicker">Teacher Workspace</p>
          <h1 className="page-title">Teacher Exam Management</h1>
          <p className="page-subtitle mb-0">
            Create exams, edit exam details, and change exam status.
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
        <div className="col-lg-5">
          <section className="section-card">
            <div className="section-card-header">
              <h2 className="section-card-title">
                {editingExamId ? 'Edit Exam' : 'Create New Exam'}
              </h2>
            </div>

            <div className="section-card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Exam title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    required
                  />
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Duration minutes</label>
                    <input
                      type="number"
                      className="form-control"
                      min="1"
                      value={durationMinutes}
                      onChange={(event) => setDurationMinutes(event.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={status}
                      onChange={(event) => setStatus(event.target.value)}
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="closed">Closed</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={saving}
                  >
                    {saving
                      ? 'Saving...'
                      : editingExamId
                        ? 'Save Changes'
                        : 'Create Exam'}
                  </button>

                  {editingExamId && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={clearForm}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </section>
        </div>

        <div className="col-lg-7">
          <section className="section-card">
            <div className="section-card-header">
              <h2 className="section-card-title">Exams List</h2>
            </div>

            <div className="section-card-body">
              <div className="exam-list">
                {exams.map((exam) => (
                  <article className="exam-card" key={exam.id}>
                    <div className="exam-card-header">
                      <div>
                        <h3 className="h4 exam-card-title">
                          {formatText(exam.title)}
                        </h3>
                        <p className="text-muted mb-2">
                          {formatText(exam.description)}
                        </p>
                        <div className="exam-meta">
                          <span>
                            Duration: {exam.durationMinutes || exam.duration_minutes || 0} minutes
                          </span>
                        </div>
                      </div>

                      <div className="d-flex flex-column align-items-end gap-2">
                        <span className={`badge status-badge ${getStatusBadgeClass(exam.status)}`}>
                          {formatText(exam.status)}
                        </span>

                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleEdit(exam)}
                        >
                          Edit
                        </button>
                      </div>
                    </div>

                    <div className="exam-actions">
                      <div>
                        <label className="form-label small fw-bold">
                          Change status
                        </label>

                        <select
                          className="form-select form-select-sm"
                          value={exam.status}
                          onChange={(event) =>
                            handleStatusChange(exam.id, event.target.value)
                          }
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                          <option value="closed">Closed</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        className="btn btn-sm btn-outline-success"
                        onClick={() => openQuestions(exam)}
                      >
                        Questions
                      </button>

                      <button
                        type="button"
                        className="btn btn-sm btn-outline-dark"
                        onClick={() => openSubmissions(exam)}
                      >
                        Submissions
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              {exams.length === 0 && (
                <div className="empty-state">No exams found.</div>
              )}
            </div>
          </section>
        </div>
      </div>

      {selectedExam && (
        <section className="section-card management-section">
          <div className="section-card-header">
            <h2 className="section-card-title">
              Questions for {formatText(selectedExam.title)}
            </h2>
          </div>

          <div className="section-card-body">
            {questionsLoading && (
              <div className="alert alert-info">Loading questions...</div>
            )}

            {questions.length === 0 && !questionsLoading && (
              <div className="empty-state">No questions added yet.</div>
            )}

            <div className="question-list">
              {questions.map((question, index) => (
                <article className="question-card" key={question.id}>
                  <h3 className="h5 question-card-title">
                    {index + 1}. {getQuestionTitle(question)}
                  </h3>

                  <p className="text-muted small mb-3">
                    Points: {formatText(question.points)}
                  </p>

                  <ul className="question-option-list">
                    {getQuestionOptions(question).map((option) => (
                      <li key={option.id || option.position || option.optionText}>
                        {formatText(option.optionText || option.text)}
                        {option.isCorrect && (
                          <span className="badge bg-success status-badge ms-2">
                            Correct
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>

            <hr />

            <h4 className="fw-bold mb-3">Add Multiple Choice Question</h4>

            <form onSubmit={handleAddQuestion}>
              <div className="row g-3">
                <div className="col-md-8">
                  <label className="form-label">Question type</label>
                  <select
                    className="form-select"
                    value={selectedQuestionTypeId}
                    onChange={(event) =>
                      setSelectedQuestionTypeId(event.target.value)
                    }
                    required
                  >
                    {questionTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {formatText(type.name || type.code)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label">Points</label>
                  <input
                    type="number"
                    className="form-control"
                    min="1"
                    value={questionPoints}
                    onChange={(event) => setQuestionPoints(event.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Question text</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={questionText}
                  onChange={(event) => setQuestionText(event.target.value)}
                  required
                />
              </div>

              {questionOptions.map((option, index) => (
                <div className="input-group mb-2" key={index}>
                  <div className="input-group-text">
                    <input
                      className="form-check-input mt-0"
                      type="radio"
                      name="correctOption"
                      checked={Number(correctOptionIndex) === index}
                      onChange={() => setCorrectOptionIndex(index)}
                    />
                  </div>

                  <input
                    type="text"
                    className="form-control"
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(event) =>
                      handleQuestionOptionChange(index, event.target.value)
                    }
                    required={index < 2}
                  />
                </div>
              ))}

              <button
                type="submit"
                className="btn btn-success"
                disabled={!selectedQuestionTypeId}
              >
                Add Question
              </button>
            </form>
          </div>
        </section>
      )}

      {selectedSubmissionsExam && (
        <section className="section-card management-section">
          <div className="section-card-header">
            <h2 className="section-card-title">
              Submissions for {formatText(selectedSubmissionsExam.title)}
            </h2>
          </div>

          <div className="section-card-body">
            {submissionsLoading && (
              <div className="alert alert-info">Loading submissions...</div>
            )}

            {!submissionsLoading && examSubmissions.length === 0 && (
              <div className="empty-state">No submissions found for this exam.</div>
            )}

            <div className="submission-list">
              {examSubmissions.map((submission) => {
                const result = getRelatedExamResult(submission)
                const score = getSubmissionScore(submission, result)

                return (
                  <article className="submission-card" key={submission.id}>
                    <div className="submission-card-header">
                      <div>
                        <h3 className="h5 submission-card-title">
                          {getSubmissionStudentName(submission)}
                        </h3>
                        <p className="text-muted mb-1">
                          Status: {getSubmissionStatus(submission)}
                        </p>
                        <p className="mb-0">
                          Score: {score === null ? 'Not graded yet' : formatText(score)}
                        </p>
                      </div>

                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => openReviewSubmission(submission)}
                      >
                        Review / Grade
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>

            {selectedSubmission && (
              <div className="review-panel">
                <h4 className="fw-bold mb-2">Review Submission</h4>
                <p className="text-muted mb-2">
                  Student: {getSubmissionStudentName(selectedSubmission)}
                </p>

                {resultLoading && (
                  <div className="alert alert-info">Loading result...</div>
                )}

                {submissionResult && (
                  <div className="result-card mb-3">
                    <p className="mb-1">
                      Current score:{' '}
                      {getResultScore(submissionResult) === null
                        ? 'Not graded yet'
                        : formatText(getResultScore(submissionResult))}
                    </p>
                    <p className="mb-0">
                      Feedback:{' '}
                      {getResultFeedback(submissionResult) || 'No feedback yet'}
                    </p>
                  </div>
                )}

                {getSubmissionAnswers(submissionResult).length > 0 && (
                  <div className="mb-3">
                    <h5 className="fw-bold">Answers</h5>
                    {getSubmissionAnswers(submissionResult).map(
                      (answer, index) => (
                        <div className="question-card mb-2" key={index}>
                          <p className="fw-bold mb-1">
                            {getAnswerQuestionText(answer)}
                          </p>
                          <p className="mb-0">{getAnswerText(answer)}</p>
                        </div>
                      )
                    )}
                  </div>
                )}

                <form onSubmit={handleSaveGrade}>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label">Score</label>
                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        max="100"
                        value={gradingScore}
                        onChange={(event) => setGradingScore(event.target.value)}
                        required
                      />
                    </div>

                    <div className="col-md-8">
                      <label className="form-label">Feedback</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={gradingFeedback}
                        onChange={(event) =>
                          setGradingFeedback(event.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      type="submit"
                      className="btn btn-success"
                      disabled={gradingLoading}
                    >
                      {gradingLoading ? 'Saving...' : 'Save Grade'}
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={handlePublishResult}
                      disabled={gradingLoading || !getResultId(submissionResult)}
                    >
                      Publish Result
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  )
}

export default TeacherExamsPage
