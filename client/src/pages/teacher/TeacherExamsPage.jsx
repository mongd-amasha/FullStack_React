import { useEffect, useState } from 'react'
import { mockApiService } from '../../services'

function TeacherExamsPage({ currentUser, onBack }) {
  const [exams, setExams] = useState([])
  const [editingExamId, setEditingExamId] = useState(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('draft')

  useEffect(() => {
    loadExams()
  }, [])

  const loadExams = async () => {
    const examsData = await mockApiService.getExams()
    setExams([...examsData])
  }

  const clearForm = () => {
    setEditingExamId(null)
    setTitle('')
    setDescription('')
    setStatus('draft')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (editingExamId) {
      await mockApiService.updateExam(editingExamId, {
        title,
        description,
        status
      })
    } else {
      await mockApiService.createExam({
        title,
        description,
        status,
        teacherId: currentUser?.id || 1
      })
    }

    clearForm()
    loadExams()
  }

  const handleEdit = (exam) => {
    setEditingExamId(exam.id)
    setTitle(exam.title)
    setDescription(exam.description)
    setStatus(exam.status)
  }

  const handleStatusChange = async (examId, newStatus) => {
    await mockApiService.changeExamStatus(examId, newStatus)
    loadExams()
  }

  const getStatusBadgeClass = (examStatus) => {
    if (examStatus === 'active') {
      return 'bg-success'
    }

    if (examStatus === 'completed') {
      return 'bg-secondary'
    }

    return 'bg-warning text-dark'
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold">Teacher Exam Management</h1>
          <p className="text-muted mb-0">
            Create exams, edit exam details, and change exam status.
          </p>
        </div>

        <button className="btn btn-outline-primary" onClick={onBack}>
          Back to Dashboard
        </button>
      </div>

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
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-success">
                    {editingExamId ? 'Save Changes' : 'Create Exam'}
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

                  <div className="mt-3">
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
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                    </select>
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
    </div>
  )
}

export default TeacherExamsPage