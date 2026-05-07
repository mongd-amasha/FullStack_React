import { useState } from 'react'
import LoginScreen from './components/LoginScreen'
import TeacherDashboard from './components/TeacherDashboard'
import './App.css'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />
  }

  return <TeacherDashboard />
}

export default App