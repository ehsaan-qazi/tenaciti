import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../api/client'
import '../styles/login.css'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [tokenValid, setTokenValid] = useState(true)
  const [token, setToken] = useState(null)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { session } = useAuth()

  // Get token from URL
  useEffect(() => {
    const resetToken = searchParams.get('token')
    if (resetToken) {
      setToken(resetToken)
    } else {
      setTokenValid(false)
    }
  }, [searchParams])

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (session) {
      navigate('/', { replace: true })
    }
  }, [session, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      await apiFetch('/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Failed to reset password. The link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  // Shared wrapper for all states
  const PageWrapper = ({ children }) => (
    <div className="login-page-wrapper">
      <div className="layout" style={{ gridTemplateColumns: '1fr', justifyItems: 'center' }}>
        <main className="auth-panel" style={{ minHeight: '100vh' }}>
          <div className="auth-card">
            <div className="card-logo">
              <span className="logo-mark">
                <svg viewBox="0 0 503 217" xmlns="http://www.w3.org/2000/svg">
                  <g transform="translate(503 0) scale(-1 1)">
                    <path fill="currentColor" d="M268.8 7.5c-31.3 6.8-53.6 28.3-61.9 59.5-.6 2.5-1.2 9-1.3 14.5l-.1 10h31l.2-4.5c.7-12.8 6.2-25.8 14.3-33.9 5.5-5.5 14.4-10.4 22.5-12.6 8.7-2.2 189.5-2.3 189.5 0 0 .8-1 4-2.2 7.2-2.9 7.8-11.1 16.1-19.3 19.4l-6 2.4-65 .5-65 .5-5.7 2.3c-7.7 3.1-16.9 10-20.8 15.7-3.6 5.3-7.4 13.4-6.6 14.2.3.3 36.4.5 80.3.5 71.5 0 80.6-.2 87.3-1.7 26.7-6.1 48-26.5 55.5-53.1 1.2-4.1 1.9-11.6 2.2-24.2l.5-18.2-111.8.1c-85.6.1-113.2.4-117.6 1.4M70.5 115c-23.9 3.5-45.8 18.9-56.2 39.5-6.6 12.9-7.6 17.6-8.1 38.2L5.8 212h112.4c109.4 0 112.7-.1 120.4-2 17.2-4.4 32.2-13.9 42.9-27.2 11.6-14.6 16.2-26.8 17.2-45.6l.6-11.3-15.9.3-15.9.3-.6 6.5c-1.4 13.3-5.2 22.2-13.1 30.6a48.5 48.5 0 0 1-20.8 13.5c-7.4 2.6-10.8 2.6-130.2 2.1L41 179v-2.3c0-3.3 5.3-13.6 9.4-18.4 2.4-2.7 6.5-5.6 11.3-8l7.7-3.8 65-.5 65.1-.5 6-2.4c11.1-4.4 20-12.4 24.5-21.8 3.8-8 11.1-7.3-76.2-7.2-43.1.1-80.6.5-83.3.9"/>
                  </g>
                </svg>
              </span>
              <span>tenaciti</span>
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  )

  if (!tokenValid || !token) {
    return (
      <PageWrapper>
        <div className="card-head">
          <h2>Invalid Reset Link</h2>
          <p>This password reset link is invalid or has expired.</p>
        </div>
        <Link to="/forgot-password" className="cta-btn" style={{ textDecoration: 'none', textAlign: 'center' }}>
          Request a new reset link
        </Link>
        <p className="switch-line">
          <Link to="/login" style={{ color: 'inherit', fontWeight: 600 }}>← Back to Login</Link>
        </p>
      </PageWrapper>
    )
  }

  if (success) {
    return (
      <PageWrapper>
        <div className="card-head">
          <h2>Password Reset Successful</h2>
          <p>Your password has been updated. You can now log in with your new password.</p>
        </div>
        <Link to="/login" className="cta-btn" style={{ textDecoration: 'none', textAlign: 'center' }}>
          Go to Login
        </Link>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <div className="card-head">
        <h2>Reset your password</h2>
        <p>Enter your new password below.</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="password">New Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            required
            autoComplete="new-password"
            disabled={loading}
            minLength={8}
            maxLength={64}
          />
        </div>

        <div className="field">
          <label htmlFor="confirmPassword">Confirm New Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat your new password"
            required
            autoComplete="new-password"
            disabled={loading}
          />
        </div>

        <button type="submit" className={`cta-btn ${loading ? 'loading' : ''}`}>
          <span>{loading ? 'Resetting…' : 'Reset Password'}</span>
          <span className="cta-spinner" hidden={!loading}></span>
        </button>
      </form>

      <p className="switch-line">
        <Link to="/login" style={{ color: 'inherit', fontWeight: 600 }}>← Back to Login</Link>
      </p>
    </PageWrapper>
  )
}