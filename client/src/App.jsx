import { useState } from 'react'
import LoginScreen from './components/LoginScreen'
import TeacherDashboard from './components/TeacherDashboard'
import StudentDetails from './components/StudentDetails'
import RegisterPage from './pages/auth/RegisterPage'
import TeacherExamsPage from './pages/teacher/TeacherExamsPage'
import './App.css'
import StudentExamsPage from './pages/student/StudentExamsPage'

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
    return <StudentDetails onBack={() => setScreen('dashboard')} />
  }

  if (screen === 'teacherExams') {
    return (
      <TeacherExamsPage
        currentUser={currentUser}
        onBack={() => setScreen('dashboard')}
      />
    )
  }

    if (screen === 'studentExams') {
    return (
      <StudentExamsPage
        currentUser={currentUser}
        onBack={() => setScreen('dashboard')}
      />
    )
  }

    return (
    <TeacherDashboard
      onOpenStudentDetails={() => setScreen('students')}
      onOpenTeacherExams={() => setScreen('teacherExams')}
      onOpenStudentExams={() => setScreen('studentExams')}
    />
  )
}

export default App