import { useState } from 'react'
import { mockApiService, storageService } from '../../services'

function RegisterPage({ onRegister, onBackToLogin }) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')

  const handleSubmit = async (event) => {
    event.preventDefault()

    const newUser = await mockApiService.register({
      fullName,
      email,
      password,
      role
    })

    storageService.set('currentUser', newUser)
    onRegister(newUser)
  }

  return (
    <div className="login-page">
      <div className="card login-card shadow">
        <div className="card-body p-4">
          <h2 className="fw-bold text-center mb-3">Register</h2>
          <p className="text-muted text-center mb-4">
            Create a new mock user account.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Full name</label>
              <input
                type="text"
                className="form-control"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
              />
            </div>

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

            <div className="mb-3">
              <label className="form-label">Role</label>
              <select
                className="form-select"
                value={role}
                onChange={(event) => setRole(event.target.value)}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>

            <button type="submit" className="btn btn-success w-100">
              Register
            </button>
          </form>

          <button
            type="button"
            className="btn btn-link w-100 mt-3"
            onClick={onBackToLogin}
          >
            Back to login
          </button>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage