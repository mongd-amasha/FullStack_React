import { useState } from 'react'
import { authApiService } from '../services'

const loginPortals = {
  teacher: {
    label: 'Teacher Login',
    subtitle: 'Login to manage exams, questions, submissions, and grades.'
  },
  student: {
    label: 'Student Login',
    subtitle: 'Login to view exams, submit answers, and see your results.'
  }
}

const getRoleMismatchMessage = (role) => {
  const portal = loginPortals[role]

  if (!portal) {
    return 'This account does not match the selected login portal.'
  }

  const article = role === 'admin' ? 'an' : 'a'

  return `This account is ${article} ${role} account. Please use ${portal.label}.`
}

function LoginScreen({ onLogin, onGoToRegister }) {
  const [selectedPortal, setSelectedPortal] = useState('teacher')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const portal = loginPortals[selectedPortal]

  const selectPortal = (portalName) => {
    setSelectedPortal(portalName)
    setEmail('')
    setPassword('')
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const user = await authApiService.login(email, password)
      const userRole = String(user.role || '').trim().toLowerCase()

      if (userRole !== 'admin' && userRole !== selectedPortal) {
        authApiService.logout()
        setError(getRoleMismatchMessage(userRole))
        return
      }

      onLogin(user)
    } catch (error) {
      setError(error.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-shell">
        <section className="login-intro">
          <div>
            <p className="page-kicker mb-2">Exam Management System</p>
            <h1 className="fw-bold mb-3">Secure access for every role.</h1>
            <p className="mb-0">
              Teachers manage exams and grading while students complete
              assessments and review their results from a focused interface.
            </p>

            <div className="login-highlight-list">
              <div className="login-highlight-item">
                Role-aware portal selection
              </div>
              <div className="login-highlight-item">
                JWT authentication with guarded screens
              </div>
              <div className="login-highlight-item">
                Exams, submissions, grading, and results
              </div>
            </div>
          </div>

          <p className="small mb-0">Full Stack Final Project</p>
        </section>

        <div className="login-card">
          <div className="p-4 p-md-5">
            <div className="login-portal-tabs mb-4">
              {Object.entries(loginPortals).map(([portalName, item]) => (
                <button
                  type="button"
                  key={portalName}
                  className={
                    selectedPortal === portalName
                      ? 'btn btn-primary'
                      : 'btn btn-outline-primary'
                  }
                  onClick={() => selectPortal(portalName)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <h2 className="fw-bold text-center mb-2">{portal.label}</h2>
            <p className="text-muted text-center mb-4">{portal.subtitle}</p>

            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <button
              type="button"
              className="btn btn-link w-100 mt-3"
              onClick={onGoToRegister}
            >
              Create new account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginScreen
