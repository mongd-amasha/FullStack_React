const navigationItems = [
  {
    screen: 'dashboard',
    label: 'Dashboard',
    allowedRoles: ['student', 'teacher', 'admin']
  },
  {
    screen: 'teacherExams',
    label: 'Teacher Exams',
    allowedRoles: ['teacher', 'admin']
  },
  {
    screen: 'studentExams',
    label: 'Student Exams',
    allowedRoles: ['student']
  },
  {
    screen: 'students',
    label: 'Student Details',
    allowedRoles: ['student', 'teacher', 'admin'],
    labelByRole: {
      student: 'Profile'
    }
  }
]

export const ACCESS_DENIED_SCREEN = 'accessDenied'

export const normalizeRole = (role) => {
  return role ? String(role).toLowerCase() : ''
}

export const canAccessScreen = (role, screen) => {
  const normalizedRole = normalizeRole(role)
  const navigationItem = navigationItems.find((item) => item.screen === screen)

  return Boolean(
    navigationItem && navigationItem.allowedRoles.includes(normalizedRole)
  )
}

export const getDefaultScreenForRole = (role) => {
  const normalizedRole = normalizeRole(role)

  if (canAccessScreen(normalizedRole, 'dashboard')) {
    return 'dashboard'
  }

  return getNavigationItemsForRole(normalizedRole)[0]?.screen || 'dashboard'
}

export const getNavigationItemsForRole = (role) => {
  const normalizedRole = normalizeRole(role)

  return navigationItems
    .filter((item) => item.allowedRoles.includes(normalizedRole))
    .map((item) => ({
      screen: item.screen,
      label: item.labelByRole?.[normalizedRole] || item.label
    }))
}
