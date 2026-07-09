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
  const role = currentUser?.role || 'user'
  const userName = currentUser?.fullName || currentUser?.name || currentUser?.email
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
    <nav className="app-navbar">
      <div className="container app-navbar-inner">
        <div className="brand-block">
          <span className="navbar-brand fw-bold d-block">
            {configService.getAppName()}
          </span>
          <span className="api-mode-badge">
            {configService.getApiMode()}
          </span>
        </div>

        <div className="nav-actions">
          <div className="d-flex flex-wrap gap-2">
            {navigationItems.map((item) => (
              <button
                key={item.screen}
                className={`${getButtonClass(item.screen)} nav-button`}
                onClick={screenHandlers[item.screen]}
              >
                {item.label}
              </button>
            ))}
          </div>

          <span className="role-badge">{role}</span>

          <span className="user-chip">
            <span className="user-chip-name">{userName}</span>
          </span>

          <button className="btn btn-outline-danger nav-button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}

export default NavigationMenu
