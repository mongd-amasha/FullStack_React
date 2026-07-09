import { useState } from 'react'
import { authApiService } from '../services'

const loginPortals = {
  teacher: {
    label: 'Teacher Login',
    subtitle: 'Login to manage exams, questions, submissions, and grades.',
    email: 'dana.teacher@examapp.test',
    password: '123456'
  },
  student: {
    label: 'Student Login',
    subtitle: 'Login to view exams, submit answers, and see your results.',
    email: 'alice.student@examapp.test',
    password: '123456'
  },
  admin: {
    label: 'Admin Login',
    subtitle: 'Login to manage and review the whole system.',
    email: 'admin@examapp.test',
    password: '123456'
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
  const [email, setEmail] = useState(loginPortals.teacher.email)
  const [password, setPassword] = useState(loginPortals.teacher.password)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const portal = loginPortals[selectedPortal]

  const selectPortal = (portalName) => {
    const nextPortal = loginPortals[portalName]

    setSelectedPortal(portalName)
    setEmail(nextPortal.email)
    setPassword(nextPortal.password)
    setError('')
  }

  const applyDemoCredentials = (portalName) => {
    selectPortal(portalName)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const user = await authApiService.login(email, password)
      const userRole = String(user.role || '').trim().toLowerCase()

      if (userRole !== selectedPortal) {
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
              Teachers manage exams, students complete assessments, and admins
              review the complete system from one clean interface.
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

            <div className="login-demo mt-4">
              <p className="text-muted small fw-bold mb-2">Demo credentials</p>

              <div className="d-grid gap-2">
                {Object.entries(loginPortals).map(([portalName, item]) => (
                  <button
                    type="button"
                    key={portalName}
                    className="btn btn-light border text-start demo-credential-button"
                    onClick={() => applyDemoCredentials(portalName)}
                  >
                    <span className="fw-bold">{item.label}:</span>{' '}
                    <span>{item.email} / {item.password}</span>
                  </button>
                ))}
              </div>
            </div>

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
