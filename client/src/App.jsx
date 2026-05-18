import { useState } from 'react'
import LoginScreen from './components/LoginScreen'
import TeacherDashboard from './components/TeacherDashboard'
import StudentDetails from './components/StudentDetails'
import RegisterPage from './pages/auth/RegisterPage'
import TeacherExamsPage from './pages/teacher/TeacherExamsPage'
import StudentExamsPage from './pages/student/StudentExamsPage'
import NavigationMenu from './components/layout/NavigationMenu'
import './App.css'

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [screen, setScreen] = useState('login')

  const handleLogin = (user) => {
    setCurrentUser(user)
    setScreen('dashboard')
  }

  const handleRegister = (user) => {
    setCurrentUser(user)
    setScreen('dashboard')
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setScreen('login')
  }

  const renderWithNavigation = (pageContent) => {
    return (
      <>
        <NavigationMenu
          currentUser={currentUser}
          activeScreen={screen}
          onOpenDashboard={() => setScreen('dashboard')}
          onOpenStudentDetails={() => setScreen('students')}
          onOpenTeacherExams={() => setScreen('teacherExams')}
          onOpenStudentExams={() => setScreen('studentExams')}
          onLogout={handleLogout}
        />

        {pageContent}
      </>
    )
  }

  if (!currentUser && screen === 'register') {
    return (
      <RegisterPage
        onRegister={handleRegister}
        onBackToLogin={() => setScreen('login')}
      />
    )
  }

  if (!currentUser) {
    return (
      <LoginScreen
        onLogin={handleLogin}
        onGoToRegister={() => setScreen('register')}
      />
    )
  }

  if (screen === 'students') {
    return renderWithNavigation(
      <StudentDetails onBack={() => setScreen('dashboard')} />
    )
  }

  if (screen === 'teacherExams') {
    return renderWithNavigation(
      <TeacherExamsPage
        currentUser={currentUser}
        onBack={() => setScreen('dashboard')}
      />
    )
  }

  if (screen === 'studentExams') {
    return renderWithNavigation(
      <StudentExamsPage
        currentUser={currentUser}
        onBack={() => setScreen('dashboard')}
      />
    )
  }

  return renderWithNavigation(
    <TeacherDashboard
      onOpenStudentDetails={() => setScreen('students')}
      onOpenTeacherExams={() => setScreen('teacherExams')}
      onOpenStudentExams={() => setScreen('studentExams')}
    />
  )
}

export default App