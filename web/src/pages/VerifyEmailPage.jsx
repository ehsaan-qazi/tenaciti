import { useState, useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function VerifyEmailPage() {
  const { user, resendVerification, refreshUser, logout, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  // Poll backend every 5 seconds in case the user clicked the link in another tab/device
  useEffect(() => {
    if (!user || user.is_email_verified) return
    
    const interval = setInterval(() => {
      refreshUser()
    }, 5000)

    return () => clearInterval(interval)
  }, [user, refreshUser])

  if (authLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <span>Loading Tenaciti...</span>
      </div>
    )
  }

  // If not logged in at all, go to login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // If already verified, go to dashboard
  if (user.is_email_verified) {
    return <Navigate to="/" replace />
  }

  const handleResend = async () => {
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const res = await resendVerification()
      setMessage(res.message || 'A new verification link has been sent!')
    } catch (err) {
      setError(err.message || 'Failed to send verification email. Please wait before retrying.')
    } finally {
      setLoading(false)
    }
  }

  const handleManualCheck = async () => {
    setRefreshing(true)
    setError(null)
    try {
      await refreshUser()
      setMessage('Checked status! If verified, you will be redirected automatically.')
    } catch (err) {
      setError('Could not verify status right now.')
    } finally {
      setRefreshing(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✉️</div>
            <h1>Check your inbox</h1>
            <p style={{ marginTop: '12px' }}>
              We've sent an email verification link to:<br />
              <strong style={{ color: 'var(--purple-light, #a78bfa)', fontSize: '15px' }}>
                {user.email}
              </strong>
            </p>
          </div>

          <div className="auth-form" style={{ marginTop: '24px' }}>
            {error && <div className="alert alert-error">{error}</div>}
            {message && <div className="alert alert-success">{message}</div>}

            <p style={{ fontSize: '14px', color: 'var(--text-secondary, #94a3b8)', marginBottom: '20px', lineHeight: 1.6 }}>
              Click the link in the email to activate your account. Once verified, this page will automatically redirect to your dashboard.
            </p>

            <button
              onClick={handleManualCheck}
              className="btn btn-primary btn-block"
              disabled={refreshing}
              style={{ marginBottom: '12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            >
              {refreshing ? 'Checking...' : "I've verified my email →"}
            </button>

            <button
              onClick={handleResend}
              className="btn btn-primary btn-block"
              disabled={loading}
              style={{ background: 'linear-gradient(135deg, #7c6af7 0%, #6b58f0 100%)', border: 'none', color: '#fff' }}
            >
              {loading ? 'Sending new link...' : 'Resend verification email'}
            </button>
          </div>

          <div className="auth-footer" style={{ marginTop: '28px', textAlign: 'center' }}>
            <button
              onClick={handleLogout}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline' }}
            >
              Sign in with a different account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
