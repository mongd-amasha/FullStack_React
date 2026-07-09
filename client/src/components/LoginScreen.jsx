import { useState } from 'react'
import { authApiService } from '../services'

function LoginScreen({ onLogin, onGoToRegister }) {
  const [email, setEmail] = useState('teacher@example.com')
  const [password, setPassword] = useState('123456')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const user = await authApiService.login(email, password)
      onLogin(user)
    } catch (error) {
      setError(error.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="card login-card shadow">
        <div className="card-body p-4">
          <h2 className="fw-bold text-center mb-3">Teacher Login</h2>
          <p className="text-muted text-center mb-4">
            Login to manage exams and student scores.
          </p>

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
  )
}

export default LoginScreen
