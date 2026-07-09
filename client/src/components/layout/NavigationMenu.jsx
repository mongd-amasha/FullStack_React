import { configService } from '../../services'
import { getNavigationItemsForRole } from '../../utils/roleAccess'

function NavigationMenu({
  currentUser,
  activeScreen,
  onOpenDashboard,
  onOpenStudentDetails,
  onOpenTeacherExams,
  onOpenStudentExams,
  onLogout
}) {
  const navigationItems = getNavigationItemsForRole(currentUser?.role)
  const screenHandlers = {
    dashboard: onOpenDashboard,
    students: onOpenStudentDetails,
    teacherExams: onOpenTeacherExams,
    studentExams: onOpenStudentExams
  }

  const getButtonClass = (screenName) => {
    return activeScreen === screenName
      ? 'btn btn-primary'
      : 'btn btn-outline-primary'
  }

  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom shadow-sm">
      <div className="container">
        <span className="navbar-brand fw-bold">
            {configService.getAppName()}
        </span>

        <span className="badge bg-secondary">
            {configService.getApiMode()}
        </span>

        <div className="d-flex flex-wrap gap-2 align-items-center">
          {navigationItems.map((item) => (
            <button
              key={item.screen}
              className={getButtonClass(item.screen)}
              onClick={screenHandlers[item.screen]}
            >
              {item.label}
            </button>
          ))}

          <span className="text-muted ms-2">
            {currentUser?.fullName || currentUser?.name || currentUser?.email}
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
