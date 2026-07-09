import { Component } from 'react'
import { getExams, getStudents } from '../api/examService'
import { canAccessScreen, normalizeRole } from '../utils/roleAccess'

class TeacherDashboard extends Component {
  state = {
    exams: [],
    students: [],
    loading: false
  }

  getRole() {
    return normalizeRole(this.props.currentUser?.role)
  }

  canViewStudentScores() {
    const role = this.getRole()

    return role === 'teacher' || role === 'admin'
  }

  loadDashboardData = async () => {
    this.setState({ loading: true })

    const examsData = await getExams()

    if (this.canViewStudentScores()) {
      const studentsData = await getStudents()

      this.setState({
        exams: examsData,
        students: studentsData,
        loading: false
      })
      return
    }

    this.setState({
      exams: examsData,
      students: [],
      loading: false
    })
  }

  render() {
    const {
      onOpenStudentDetails,
      onOpenTeacherExams,
      onOpenStudentExams
    } = this.props
    const { exams, students, loading } = this.state
    const role = this.getRole()
    const canViewStudentScores = this.canViewStudentScores()
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
    const actionItems = [
      {
        title: 'Refresh Overview',
        copy: 'Load the latest exam and student summary data.',
        onClick: this.loadDashboardData,
        visible: true
      },
      {
        title: 'Student Details',
        copy: role === 'student'
          ? 'Review your profile information.'
          : 'Review student profiles, exam scores, and learning status.',
        onClick: onOpenStudentDetails,
        visible: canOpenStudentDetails
      },
      {
        title: 'Manage Exams',
        copy: 'Create exams, add questions, review submissions, and grade work.',
        onClick: onOpenTeacherExams,
        visible: canOpenTeacherExams
      },
      {
        title: 'Student Exams',
        copy: 'Open the student exam-taking and results workspace.',
        onClick: onOpenStudentExams,
        visible: canOpenStudentExams
      }
    ]

    return (
      <div className="container page-container">
        <section className="dashboard-hero">
          <p className="page-kicker">Dashboard</p>
          <h1 className="page-title">{dashboardTitle}</h1>
          <p className="page-subtitle mb-0">
            {dashboardDescription}
          </p>

          <div className="dashboard-actions">
            {actionItems
              .filter((item) => item.visible)
              .map((item) => (
                <button
                  type="button"
                  className="action-card"
                  key={item.title}
                  onClick={item.onClick}
                >
                  <div className="action-card-title">{item.title}</div>
                  <p className="action-card-copy">{item.copy}</p>
                </button>
              ))}
          </div>
        </section>

        {loading && (
          <div className="alert alert-info">
            Loading dashboard data...
          </div>
        )}

        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-label">Loaded Exams</div>
            <div className="summary-value">{exams.length}</div>
            <div className="summary-note">Use Refresh Overview to load data.</div>
          </div>

          <div className="summary-card">
            <div className="summary-label">
              {canViewStudentScores ? 'Tracked Students' : 'Student Workspace'}
            </div>
            <div className="summary-value">
              {canViewStudentScores ? students.length : 'Ready'}
            </div>
            <div className="summary-note">
              {canViewStudentScores
                ? 'Visible to teachers and admins.'
                : 'Exam-taking actions stay student-safe.'}
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-label">Signed In As</div>
            <div className="summary-value text-capitalize">{role}</div>
            <div className="summary-note">Navigation is filtered by role.</div>
          </div>
        </div>

        <div className="row g-4">
          <div className={canViewStudentScores ? 'col-md-6' : 'col-md-12'}>
            <section className="section-card h-100">
              <div className="section-card-header">
                <h2 className="section-card-title">Exams Overview</h2>
              </div>

              <div className="section-card-body">
                {exams.length === 0 ? (
                  <div className="empty-state">No exams loaded yet.</div>
                ) : (
                  <div className="exam-list">
                    {exams.map((exam) => (
                      <article key={exam.id} className="exam-card">
                        <div className="exam-card-header">
                          <div>
                            <h3 className="h5 exam-card-title">{exam.title}</h3>
                            <ul className="mb-0 exam-questions">
                              {exam.questions.map((question, index) => (
                                <li key={index}>{question}</li>
                              ))}
                            </ul>
                          </div>

                          <span className="badge bg-secondary status-badge">
                            {exam.status}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>

          {canViewStudentScores && (
            <div className="col-md-6">
              <section className="section-card h-100">
                <div className="section-card-header">
                  <h2 className="section-card-title">Student Scores</h2>
                </div>

                <div className="section-card-body">
                  {students.length === 0 ? (
                    <div className="empty-state">No students loaded yet.</div>
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
              </section>
            </div>
          )}
        </div>
      </div>
    )
  }
}

export default TeacherDashboard
