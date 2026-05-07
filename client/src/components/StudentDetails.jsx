const students = [
  {
    id: 1,
    name: 'Daniel Cohen',
    email: 'daniel.cohen@example.com',
    score: 92,
    status: 'Passed',
    exam: 'React Basics Exam'
  },
  {
    id: 2,
    name: 'Maya Levi',
    email: 'maya.levi@example.com',
    score: 85,
    status: 'Passed',
    exam: 'JavaScript Fundamentals'
  },
  {
    id: 3,
    name: 'Yosef Haddad',
    email: 'yosef.haddad@example.com',
    score: 74,
    status: 'Needs Review',
    exam: 'Fullstack Web Final Test'
  },
  {
    id: 4,
    name: 'Lina Mansour',
    email: 'lina.mansour@example.com',
    score: 98,
    status: 'Excellent',
    exam: 'React Basics Exam'
  }
]

function StudentDetails({ onBack }) {
  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold">Student Details</h1>
          <p className="text-muted mb-0">
            Review student information, exam scores, and learning status.
          </p>
        </div>

        <button className="btn btn-outline-primary" onClick={onBack}>
          Back to Dashboard
        </button>
      </div>

      <div className="row g-4">
        {students.map((student) => (
          <div className="col-md-6" key={student.id}>
            <div className="card shadow-sm h-100 student-card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h4 className="fw-bold mb-1">{student.name}</h4>
                    <p className="text-muted mb-0">{student.email}</p>
                  </div>

                  <span className="badge bg-primary fs-6">
                    {student.score}
                  </span>
                </div>

                <p className="mb-2">
                  <strong>Exam:</strong> {student.exam}
                </p>

                <p className="mb-0">
                  <strong>Status:</strong>{' '}
                  <span className="badge bg-success">{student.status}</span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default StudentDetails