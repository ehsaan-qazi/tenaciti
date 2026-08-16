import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Tenaciti Workspace Caught Error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--surface, #0f172a)',
          color: 'var(--on-surface, #f8fafc)',
          fontFamily: "'Hanken Grotesk', system-ui, -apple-system, sans-serif",
          padding: '24px',
          textAlign: 'center',
        }}>
          <div style={{
            maxWidth: '480px',
            width: '100%',
            background: 'var(--surface-container, rgba(30, 41, 59, 0.7))',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--outline-variant, rgba(255, 255, 255, 0.1))',
            borderRadius: '24px',
            padding: '40px 32px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>error_outline</span>
            </div>

            <div>
              <h1 style={{
                fontSize: '22px',
                fontWeight: '700',
                margin: '0 0 8px 0',
                letterSpacing: '-0.02em',
              }}>
                Something went wrong
              </h1>
              <p style={{
                fontSize: '14px',
                color: 'var(--on-surface-variant, #94a3b8)',
                margin: 0,
                lineHeight: '1.5',
              }}>
                The workspace encountered an unexpected error. You can try refreshing the page or navigating back to your dashboard.
              </p>
            </div>

            {this.state.error?.message && (
              <div style={{
                width: '100%',
                background: 'rgba(0, 0, 0, 0.25)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                padding: '12px',
                fontSize: '12px',
                fontFamily: "'JetBrains Mono', monospace",
                color: '#f87171',
                textAlign: 'left',
                overflowX: 'auto',
                maxHeight: '120px',
              }}>
                {this.state.error.message}
              </div>
            )}

            <div style={{
              display: 'flex',
              gap: '12px',
              width: '100%',
              marginTop: '8px',
            }}>
              <button
                onClick={this.handleGoHome}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid var(--outline-variant, rgba(255, 255, 255, 0.15))',
                  background: 'transparent',
                  color: 'inherit',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                Dashboard
              </button>
              <button
                onClick={this.handleReload}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'var(--primary, #6366f1)',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                  transition: 'opacity 0.2s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                Reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
