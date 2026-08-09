import { useState, useEffect } from 'react'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingScreen from '../components/LoadingScreen'
import '../styles/login.css'

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
    return <LoadingScreen message="Loading Tenaciti..." />
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

            <div className="card-head" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✉️</div>
              <h2>Check your inbox</h2>
              <p>We've sent an email verification link to:<br /><strong style={{ color: 'var(--ink)' }}>{user.email}</strong></p>
            </div>

            {error && <div className="error-message">{error}</div>}
            {message && (
              <div style={{ padding: '10px 14px', borderRadius: '14px', fontSize: '13px', fontWeight: 500, marginBottom: '16px', background: 'rgba(34, 197, 94, 0.1)', color: '#16a34a', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                {message}
              </div>
            )}

            <p style={{ fontSize: '13px', color: 'rgba(13,13,13,.56)', marginBottom: '24px', lineHeight: 1.6, textAlign: 'center' }}>
              Click the link in the email to activate your account. Once verified, this page will automatically redirect to your dashboard.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={handleManualCheck}
                className={`cta-btn ${refreshing ? 'loading' : ''}`}
                style={{ background: 'rgba(255,255,255,.72)', color: 'var(--ink)', border: '1px solid var(--line)', boxShadow: 'none' }}
              >
                <span>{refreshing ? 'Checking…' : 'I have verified my email'}</span>
                <span className="cta-spinner" style={{ borderColor: 'var(--muted)', borderTopColor: 'var(--ink)' }} hidden={!refreshing}></span>
              </button>

              <button
                onClick={handleResend}
                className={`cta-btn ${loading ? 'loading' : ''}`}
              >
                <span>{loading ? 'Sending…' : 'Resend verification email'}</span>
                <span className="cta-spinner" hidden={!loading}></span>
              </button>
            </div>

            <p className="switch-line" style={{ marginTop: '24px' }}>
              Wrong account?{' '}
              <button type="button" onClick={handleLogout}>
                Sign out
              </button>
            </p>

          </div>
        </main>

      </div>
    </div>
  )
}
