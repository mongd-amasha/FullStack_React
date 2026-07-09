import { useEffect, useState } from 'react'
import { examApiService } from '../../services'

function TeacherExamsPage({ currentUser, onBack }) {
  const [exams, setExams] = useState([])
  const [editingExamId, setEditingExamId] = useState(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(60)
  const [status, setStatus] = useState('draft')
  const [loading, setLoading] = useState(false)
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

  const loadQuestionTypes = async () => {
    try {
      const types = await examApiService.getQuestionTypes()
      setQuestionTypes(types)

      if (types.length > 0) {
        setSelectedQuestionTypeId(types[0].id)
      }
    } catch (error) {
      setError(error.message || 'Failed to load question types')
    }
  }

  useEffect(() => {
    loadExams()
    loadQuestionTypes()
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
    return question.questionText || question.text
  }

  const getQuestionOptions = (question) => {
    return question.options || []
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold">Teacher Exam Management</h1>
          <p className="text-muted mb-0">
            Create exams, edit exam details, and change exam status.
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
        <div className="col-lg-5">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white fw-bold">
              {editingExamId ? 'Edit Exam' : 'Create New Exam'}
            </div>

            <div className="card-body">
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

                <div className="mb-3">
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

                <div className="mb-3">
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

                <div className="d-flex gap-2">
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
          </div>
        </div>

        <div className="col-lg-7">
          <div className="card shadow-sm">
            <div className="card-header bg-dark text-white fw-bold">
              Exams List
            </div>

            <div className="card-body">
              {exams.map((exam) => (
                <div className="border rounded p-3 mb-3" key={exam.id}>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h4 className="fw-bold mb-1">{exam.title}</h4>
                      <p className="text-muted mb-2">{exam.description}</p>
                      <p className="text-muted small mb-2">
                        Duration: {exam.durationMinutes || exam.duration_minutes || 0} minutes
                      </p>

                      <span className={`badge ${getStatusBadgeClass(exam.status)}`}>
                        {exam.status}
                      </span>
                    </div>

                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleEdit(exam)}
                    >
                      Edit
                    </button>
                  </div>

                  <div className="mt-3 d-flex flex-wrap gap-2 align-items-end">
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
                  </div>
                </div>
              ))}

              {exams.length === 0 && (
                <p className="text-muted mb-0">No exams found.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedExam && (
        <div className="card shadow-sm mt-4">
          <div className="card-header bg-success text-white fw-bold">
            Questions for {selectedExam.title}
          </div>

          <div className="card-body">
            {questionsLoading && (
              <div className="alert alert-info">Loading questions...</div>
            )}

            {questions.length === 0 && !questionsLoading && (
              <p className="text-muted">No questions added yet.</p>
            )}

            {questions.map((question, index) => (
              <div className="border rounded p-3 mb-3" key={question.id}>
                <h5 className="fw-bold">
                  {index + 1}. {getQuestionTitle(question)}
                </h5>

                <p className="text-muted small mb-2">
                  Points: {question.points}
                </p>

                <ul className="mb-0">
                  {getQuestionOptions(question).map((option) => (
                    <li key={option.id || option.position || option.optionText}>
                      {option.optionText || option.text}
                      {option.isCorrect && (
                        <span className="badge bg-success ms-2">Correct</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <hr />

            <h4 className="fw-bold mb-3">Add Multiple Choice Question</h4>

            <form onSubmit={handleAddQuestion}>
              <div className="mb-3">
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
                      {type.name || type.code}
                    </option>
                  ))}
                </select>
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

              <div className="mb-3">
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
        </div>
      )}
    </div>
  )
}

export default TeacherExamsPage
