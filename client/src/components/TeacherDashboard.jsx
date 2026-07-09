import { useState } from 'react'
import { getExams, getStudents } from '../api/examService'
import { canAccessScreen, normalizeRole } from '../utils/roleAccess'

function TeacherDashboard({
  currentUser,
  onOpenStudentDetails,
  onOpenTeacherExams,
  onOpenStudentExams
}) {
  const [exams, setExams] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const role = normalizeRole(currentUser?.role)
  const canViewStudentScores = role === 'teacher' || role === 'admin'
  const canOpenStudentDetails = canAccessScreen(role, 'students')
  const canOpenTeacherExams = canAccessScreen(role, 'teacherExams')
  const canOpenStudentExams = canAccessScreen(role, 'studentExams')
  const dashboardTitle =
    role === 'student'
      ? 'Student Dashboard'
      : role === 'admin'
        ? 'Admin Dashboard'
        : 'Teacher Exams Dashboard'
  const dashboardDescription =
    role === 'student'
      ? 'View your exams, submissions, and profile information.'
      : 'Manage exams, review student scores, and prepare online tests.'

  const loadDashboardData = async () => {
    setLoading(true)

    const examsData = await getExams()
    setExams(examsData)

    if (canViewStudentScores) {
      const studentsData = await getStudents()
      setStudents(studentsData)
    } else {
      setStudents([])
    }

    setLoading(false)
  }

  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h1 className="fw-bold">{dashboardTitle}</h1>
        <p className="text-muted">
          {dashboardDescription}
        </p>

        <button className="btn btn-primary btn-lg" onClick={loadDashboardData}>
          View Dashboard
        </button>

        {canOpenStudentDetails && (
          <button
            className="btn btn-outline-success btn-lg ms-3"
            onClick={onOpenStudentDetails}
          >
            Student Details
          </button>
        )}

        {canOpenTeacherExams && (
          <button
            className="btn btn-outline-primary btn-lg ms-3"
            onClick={onOpenTeacherExams}
          >
            Manage Exams
          </button>
        )}

        {canOpenStudentExams && (
          <button
            className="btn btn-outline-success btn-lg ms-3"
            onClick={onOpenStudentExams}
          >
            Student Exams
          </button>
        )}
      </div>

      {loading && (
        <div className="alert alert-info text-center">
          Loading dashboard data...
        </div>
      )}

      <div className="row g-4">
        <div className={canViewStudentScores ? 'col-md-6' : 'col-md-12'}>
          <div className="card shadow-sm h-100">
            <div className="card-header bg-primary text-white">
              Exams
            </div>

            <div className="card-body">
              {exams.length === 0 ? (
                <p className="text-muted">No exams loaded yet.</p>
              ) : (
                exams.map((exam) => (
                  <div key={exam.id} className="border-bottom pb-3 mb-3">
                    <h5>{exam.title}</h5>
                    <span className="badge bg-secondary mb-2">{exam.status}</span>
                    <ul className="mb-0 exam-questions">
                      {exam.questions.map((question, index) => (
                        <li key={index}>{question}</li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {canViewStudentScores && (
          <div className="col-md-6">
            <div className="card shadow-sm h-100">
              <div className="card-header bg-success text-white">
                Student Scores
              </div>

              <div className="card-body">
                {students.length === 0 ? (
                  <p className="text-muted">No students loaded yet.</p>
                ) : (
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr key={student.id}>
                          <td>{student.name}</td>
                          <td>{student.score}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TeacherDashboard
