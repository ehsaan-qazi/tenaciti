import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function VerifyEmailConfirmPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { verifyEmail, user } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  
  // Guard to prevent double-execution in React strict mode / dev mode
  const attemptRef = useRef(false)

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setError('Missing verification token in URL.')
      setLoading(false)
      return
    }

    if (attemptRef.current) return
    attemptRef.current = true

    const confirmToken = async () => {
      try {
        await verifyEmail(token)
        setSuccess(true)
        setLoading(false)
        
        // Auto-redirect after a brief delay
        setTimeout(() => {
          navigate('/', { replace: true })
        }, 2500)
      } catch (err) {
        setError(err.message || 'Invalid or expired verification link.')
        setLoading(false)
      }
    }

    confirmToken()
  }, [searchParams, verifyEmail, navigate])

  if (loading) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card" style={{ textAlign: 'center' }}>
            <div className="loading-spinner" style={{ margin: '20px auto' }} />
            <h2>Verifying your email...</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Please wait while we confirm your account.</p>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
            <div className="auth-header">
              <h1>Email Verified!</h1>
              <p>Your email has been confirmed and your account is fully active.</p>
            </div>
            <div className="alert alert-success" style={{ margin: '20px 0' }}>
              Redirecting to your dashboard in just a moment...
            </div>
            <div className="auth-footer">
              <Link to="/" className="btn btn-primary btn-block" style={{ padding: '12px 24px', textDecoration: 'none' }}>
                Go to Dashboard Now →
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <div className="auth-header">
            <h1>Verification Failed</h1>
            <p>{error}</p>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '20px 0' }}>
            The verification link may have expired (links last for 24 hours) or has already been used.
          </p>
          <div className="auth-footer" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {user ? (
              <Link to="/verify-email" className="btn btn-primary" style={{ padding: '12px 24px', textDecoration: 'none', background: 'linear-gradient(135deg, #7c6af7 0%, #6b58f0 100%)', color: '#fff', borderRadius: '8px' }}>
                Request a New Link →
              </Link>
            ) : (
              <Link to="/login" className="btn btn-primary" style={{ padding: '12px 24px', textDecoration: 'none', background: 'linear-gradient(135deg, #7c6af7 0%, #6b58f0 100%)', color: '#fff', borderRadius: '8px' }}>
                Go to Sign In →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
