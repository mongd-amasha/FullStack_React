import { useState } from 'react'
import { mockApiService, storageService } from '../services'

function LoginScreen({ onLogin, onGoToRegister }) {
  const [email, setEmail] = useState('teacher@example.com')
  const [password, setPassword] = useState('123456')
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    const user = await mockApiService.login(email, password)

    if (!user) {
      setError('Invalid email or password')
      return
    }

    storageService.save('currentUser', user)
    onLogin(user)
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

            <button type="submit" className="btn btn-primary w-100">
              Login
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