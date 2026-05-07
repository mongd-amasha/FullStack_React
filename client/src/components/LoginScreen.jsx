function LoginScreen({ onLogin }) {
  const handleSubmit = (event) => {
    event.preventDefault()
    onLogin()
  }

  return (
    <div className="login-page">
      <div className="card login-card shadow">
        <div className="card-body p-4">
          <h2 className="fw-bold text-center mb-3">Teacher Login</h2>
          <p className="text-muted text-center mb-4">
            Login to manage exams and student scores.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                placeholder="teacher@example.com"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter password"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-100">
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginScreen