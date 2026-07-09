import { useState } from 'react'
import './App.css'
import NavigationMenu from './components/layout/NavigationMenu'
import LoginScreen from './components/LoginScreen'
import StudentDetails from './components/StudentDetails'
import TeacherDashboard from './components/TeacherDashboard'
import RegisterPage from './pages/auth/RegisterPage'
import StudentExamsPage from './pages/student/StudentExamsPage'
import TeacherExamsPage from './pages/teacher/TeacherExamsPage'
import {
  authApiService,
  loggerService,
  notifyService,
  storageService
} from './services'
import {
  ACCESS_DENIED_SCREEN,
  canAccessScreen,
  getDefaultScreenForRole
} from './utils/roleAccess'

const getSavedAuth = () => {
  const savedUser = storageService.get('currentUser')
  const savedToken = storageService.get('token')

  if (!savedUser || !savedToken) {
    return {
      currentUser: null,
      token: null
    }
  }

  return {
    currentUser: savedUser,
    token: savedToken
  }
}

const getSavedScreen = () => {
  const savedScreen = storageService.get('screen')
  const savedAuth = getSavedAuth()

  if (savedAuth.currentUser && savedAuth.token) {
    if (!savedScreen || savedScreen === 'login' || savedScreen === 'register') {
      const defaultScreen = getDefaultScreenForRole(savedAuth.currentUser.role)

      storageService.set('screen', defaultScreen)
      return defaultScreen
    }

    if (!canAccessScreen(savedAuth.currentUser.role, savedScreen)) {
      const defaultScreen = getDefaultScreenForRole(savedAuth.currentUser.role)

      storageService.set('screen', defaultScreen)
      return defaultScreen
    }

    return savedScreen
  }

  return savedScreen === 'register' ? 'register' : 'login'
}

function App() {
  const [authState, setAuthState] = useState(getSavedAuth)
  const [screen, setScreen] = useState(getSavedScreen)
  const [notification, setNotification] = useState(null)
  const currentUser = authState.currentUser
  const token = authState.token

  const openScreen = (screenName, roleOverride = currentUser?.role) => {
    loggerService.info(`Opening screen: ${screenName}`)

    if (currentUser && token && !canAccessScreen(roleOverride, screenName)) {
      storageService.set('screen', getDefaultScreenForRole(roleOverride))
      setScreen(ACCESS_DENIED_SCREEN)
      return
    }

    storageService.set('screen', screenName)
    setScreen(screenName)
  }

  const handleLogin = (user) => {
    loggerService.info(`User logged in: ${user.email}`)
    setAuthState({
      currentUser: user,
      token: authApiService.getToken()
    })
    openScreen(getDefaultScreenForRole(user.role), user.role)
    setNotification(notifyService.success('Login completed successfully'))
  }

  const handleRegister = (user) => {
    loggerService.info(`User registered: ${user.email}`)
    setAuthState({
      currentUser: user,
      token: authApiService.getToken()
    })
    openScreen(getDefaultScreenForRole(user.role), user.role)
    setNotification(notifyService.success('Account created successfully'))
  }

  const handleLogout = () => {
    loggerService.info('User logged out')
    authApiService.logout()
    setAuthState({
      currentUser: null,
      token: null
    })
    setScreen('login')
    setNotification(null)
  }

  const renderWithNavigation = (pageContent) => {
    return (
      <div className="app-shell">
        <NavigationMenu
          currentUser={currentUser}
          activeScreen={screen}
          onOpenDashboard={() => openScreen('dashboard')}
          onOpenStudentDetails={() => openScreen('students')}
          onOpenTeacherExams={() => openScreen('teacherExams')}
          onOpenStudentExams={() => openScreen('studentExams')}
          onLogout={handleLogout}
        />

        {notification && (
          <div className="container mt-3">
            <div className={`alert alert-${notification.type} mb-0`}>
              {notification.message}
            </div>
          </div>
        )}

        {pageContent}
      </div>
    )
  }

  const renderAccessDenied = () => {
    return (
      <div className="container py-5">
        <div className="alert alert-warning shadow-sm">
          <h1 className="h4 fw-bold">Access Denied</h1>
          <p className="mb-3">
            You do not have permission to view this page.
          </p>

          <button
            className="btn btn-outline-primary"
            onClick={() => openScreen(getDefaultScreenForRole(currentUser?.role))}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if ((!currentUser || !token) && screen === 'register') {
    return (
      <RegisterPage
        onRegister={handleRegister}
        onBackToLogin={() => openScreen('login')}
      />
    )
  }

  if (!currentUser || !token) {
    return (
      <LoginScreen
        onLogin={handleLogin}
        onGoToRegister={() => openScreen('register')}
      />
    )
  }

  if (screen === ACCESS_DENIED_SCREEN) {
    return renderWithNavigation(renderAccessDenied())
  }

  if (!canAccessScreen(currentUser.role, screen)) {
    return renderWithNavigation(renderAccessDenied())
  }

  if (screen === 'students') {
    return renderWithNavigation(
      <StudentDetails
        currentUser={currentUser}
        onBack={() => openScreen('dashboard')}
      />
    )
  }

  if (screen === 'teacherExams') {
    return renderWithNavigation(
      <TeacherExamsPage
        currentUser={currentUser}
        onBack={() => openScreen('dashboard')}
      />
    )
  }

  if (screen === 'studentExams') {
    return renderWithNavigation(
      <StudentExamsPage
        currentUser={currentUser}
        onBack={() => openScreen('dashboard')}
      />
    )
  }

  return renderWithNavigation(
    <TeacherDashboard
      currentUser={currentUser}
      onOpenStudentDetails={() => openScreen('students')}
      onOpenTeacherExams={() => openScreen('teacherExams')}
      onOpenStudentExams={() => openScreen('studentExams')}
    />
  )
}

export default App
