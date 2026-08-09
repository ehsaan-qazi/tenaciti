import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../api/client'
import { Link } from 'react-router-dom'

export default function SettingsPage() {
  const { user, refreshUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [limits, setLimits] = useState(null)

  useEffect(() => {
    const fetchLimits = async () => {
      try {
        const data = await apiFetch('/billing/limits')
        setLimits(data)
      } catch (err) {
        console.error('Failed to fetch limits:', err)
      }
    }
    fetchLimits()
  }, [])

  const handleUpgrade = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await apiFetch('/billing/checkout-url')
      if (response.checkout_url) {
        window.location.href = response.checkout_url
      }
    } catch (err) {
      setError(err.message || 'Failed to get checkout URL')
    } finally {
      setLoading(false)
    }
  }

  const uploadLimit = limits?.upload_limit_per_course || (user?.plan === 'pro' ? 20 : 3)
  const isPro = user?.plan === 'pro'

  return (
    <div style={{ position: 'relative', padding: '32px 24px 64px', maxWidth: '900px', margin: '0 auto', width: '100%', fontFamily: 'Hanken Grotesk, sans-serif', color: 'var(--on-surface)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '48px', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em', color: 'var(--on-surface)', margin: '0 0 8px' }}>⚙️ Settings</h1>
          <p style={{ fontSize: '16px', color: 'var(--on-surface-variant)', margin: 0 }}>Manage your account and subscription</p>
        </div>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', background: 'var(--surface-container)', color: 'var(--on-surface)', fontSize: '14px', fontWeight: 500, transition: 'all 0.2s' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span> Dashboard
        </Link>
      </div>

      {/* Account Card */}
      <div style={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(24px)', borderRadius: '24px', padding: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid rgba(196, 199, 199, 0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <span className="material-symbols-outlined" style={{ color: 'var(--secondary)', fontSize: '20px' }}>person</span>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Account</h3>
        </div>
        <div className="dashboard-2col-grid" style={{ gap: '16px' }}>
          <div style={{ padding: '16px', background: 'var(--surface-container-low)', borderRadius: '16px' }}>
            <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</span>
            <p style={{ margin: '4px 0 0', fontSize: '15px', fontWeight: 500, color: 'var(--on-surface)' }}>{user?.email || '—'}</p>
          </div>
          <div style={{ padding: '16px', background: 'var(--surface-container-low)', borderRadius: '16px' }}>
            <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</span>
            <p style={{ margin: '4px 0 0', fontSize: '15px', fontWeight: 500, color: 'var(--on-surface)' }}>{user?.full_name || '—'}</p>
          </div>
        </div>
      </div>

      {/* Subscription Card */}
      <div style={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(24px)', borderRadius: '24px', padding: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid rgba(196, 199, 199, 0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <span className="material-symbols-outlined" style={{ color: 'var(--gradient-end)', fontSize: '20px' }}>workspace_premium</span>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Subscription Plan</h3>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ 
              display: 'inline-block', 
              padding: '6px 14px', 
              borderRadius: '999px', 
              fontSize: '12px', 
              fontWeight: 700, 
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              background: isPro ? 'linear-gradient(135deg, var(--gradient-start), var(--gradient-mid))' : 'var(--surface-container)', 
              color: isPro ? 'white' : 'var(--on-surface-variant)',
              border: isPro ? 'none' : '1px solid var(--outline-variant)',
            }}>
              {isPro ? '✨ Pro Plan' : 'Free Plan'}
            </span>
            <p style={{ margin: '12px 0 0', fontSize: '14px', color: 'var(--on-surface-variant)', lineHeight: 1.6, maxWidth: '500px' }}>
              {isPro
                ? 'You have access to all premium features including AI topic extraction.'
                : 'You are on the free tier. Upgrade to unlock AI topic extraction and higher upload limits.'}
            </p>
          </div>

          {!isPro && (
            <button
              onClick={handleUpgrade}
              disabled={loading}
              style={{ 
                padding: '12px 24px', 
                borderRadius: '12px', 
                background: 'var(--primary)', 
                color: 'var(--on-primary)', 
                border: 'none', 
                fontWeight: 600, 
                fontSize: '14px',
                cursor: loading ? 'not-allowed' : 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                opacity: loading ? 0.7 : 1,
                transition: 'all 0.2s'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>bolt</span>
              {loading ? 'Processing...' : 'Upgrade to Pro'}
            </button>
          )}
        </div>
        
        {error && (
          <div style={{ marginTop: '12px', padding: '12px 16px', background: 'var(--error-container)', borderRadius: '12px', color: 'var(--on-error-container)', fontSize: '14px' }}>
            {error}
          </div>
        )}
      </div>

      {/* Quota Card */}
      <div style={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(24px)', borderRadius: '24px', padding: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid rgba(196, 199, 199, 0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <span className="material-symbols-outlined" style={{ color: 'var(--success)', fontSize: '20px' }}>pie_chart</span>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Quota Overview</h3>
        </div>
        
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', color: 'var(--on-surface)' }}>Document Uploads</span>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--on-surface)' }}>0 / {uploadLimit} per course</span>
          </div>
          <div style={{ height: '8px', background: 'var(--surface-container)', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '0%', background: 'linear-gradient(to right, var(--gradient-start), var(--gradient-end))', borderRadius: '999px', transition: 'width 0.4s ease' }}></div>
          </div>
          <p style={{ margin: '8px 0 0', fontSize: '12px', color: 'var(--on-surface-variant)' }}>
            {isPro
              ? `Your Pro plan gives you ${uploadLimit} document uploads per course.`
              : `Free tier is limited to ${uploadLimit} document uploads per course. Upgrade for more.`}
          </p>
        </div>
      </div>
    </div>
  )
}
