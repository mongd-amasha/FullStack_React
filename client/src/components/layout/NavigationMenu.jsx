function NavigationMenu({
  currentUser,
  activeScreen,
  onOpenDashboard,
  onOpenStudentDetails,
  onOpenTeacherExams,
  onOpenStudentExams,
  onLogout
}) {
  const getButtonClass = (screenName) => {
    return activeScreen === screenName
      ? 'btn btn-primary'
      : 'btn btn-outline-primary'
  }

  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom shadow-sm">
      <div className="container">
        <span className="navbar-brand fw-bold">
          FullStack Exams App
        </span>

        <div className="d-flex flex-wrap gap-2 align-items-center">
          <button
            className={getButtonClass('dashboard')}
            onClick={onOpenDashboard}
          >
            Dashboard
          </button>

          <button
            className={getButtonClass('teacherExams')}
            onClick={onOpenTeacherExams}
          >
            Teacher Exams
          </button>

          <button
            className={getButtonClass('studentExams')}
            onClick={onOpenStudentExams}
          >
            Student Exams
          </button>

          <button
            className={getButtonClass('students')}
            onClick={onOpenStudentDetails}
          >
            Student Details
          </button>

          <span className="text-muted ms-2">
            {currentUser?.name || currentUser?.email}
          </span>

          <button className="btn btn-outline-danger" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}

export default NavigationMenu