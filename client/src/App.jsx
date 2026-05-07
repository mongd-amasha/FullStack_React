import { useState } from 'react'
import LoginScreen from './components/LoginScreen'
import TeacherDashboard from './components/TeacherDashboard'
import StudentDetails from './components/StudentDetails'
import './App.css'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [screen, setScreen] = useState('dashboard')

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />
  }

  if (screen === 'students') {
    return <StudentDetails onBack={() => setScreen('dashboard')} />
  }

  return <TeacherDashboard onOpenStudentDetails={() => setScreen('students')} />
}

export default App