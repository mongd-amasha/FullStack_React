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
      return 'dashboard'
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

  const openScreen = (screenName) => {
    loggerService.info(`Opening screen: ${screenName}`)
    storageService.set('screen', screenName)
    setScreen(screenName)
  }

  const handleLogin = (user) => {
    loggerService.info(`User logged in: ${user.email}`)
    setAuthState({
      currentUser: user,
      token: authApiService.getToken()
    })
    openScreen('dashboard')
    setNotification(notifyService.success('Login completed successfully'))
  }

  const handleRegister = (user) => {
    loggerService.info(`User registered: ${user.email}`)
    setAuthState({
      currentUser: user,
      token: authApiService.getToken()
    })
    openScreen('dashboard')
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
      <>
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
      </>
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

  if (screen === 'students') {
    return renderWithNavigation(
      <StudentDetails onBack={() => openScreen('dashboard')} />
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
      onOpenStudentDetails={() => openScreen('students')}
      onOpenTeacherExams={() => openScreen('teacherExams')}
      onOpenStudentExams={() => openScreen('studentExams')}
    />
  )
}

export default App
