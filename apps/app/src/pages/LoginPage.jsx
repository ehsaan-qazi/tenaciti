import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/login.css';

const MARKETING_URL = import.meta.env.VITE_MARKETING_URL || 'https://tenaciti.app';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { loginWithGoogle, loginWithEmail, registerWithEmail } = useAuth();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const isSignup = activeTab === 'signup';

  const handleGoogle = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(err.message || 'Google login failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setError('');

    if (isSignup && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      if (isSignup) {
        await registerWithEmail(email, password, fullName);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err) {
      setError(err.message || (isSignup ? 'Registration failed' : 'Login failed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="layout">
        
        {/* Brand / Story Panel */}
        <aside className="brand-panel">
          <div className="brand-top">
            <span className="logo-mark">
              <svg viewBox="0 0 503 217" xmlns="http://www.w3.org/2000/svg">
                <g transform="translate(503 0) scale(-1 1)">
                  <path fill="currentColor" d="M268.8 7.5c-31.3 6.8-53.6 28.3-61.9 59.5-.6 2.5-1.2 9-1.3 14.5l-.1 10h31l.2-4.5c.7-12.8 6.2-25.8 14.3-33.9 5.5-5.5 14.4-10.4 22.5-12.6 8.7-2.2 189.5-2.3 189.5 0 0 .8-1 4-2.2 7.2-2.9 7.8-11.1 16.1-19.3 19.4l-6 2.4-65 .5-65 .5-5.7 2.3c-7.7 3.1-16.9 10-20.8 15.7-3.6 5.3-7.4 13.4-6.6 14.2.3.3 36.4.5 80.3.5 71.5 0 80.6-.2 87.3-1.7 26.7-6.1 48-26.5 55.5-53.1 1.2-4.1 1.9-11.6 2.2-24.2l.5-18.2-111.8.1c-85.6.1-113.2.4-117.6 1.4M70.5 115c-23.9 3.5-45.8 18.9-56.2 39.5-6.6 12.9-7.6 17.6-8.1 38.2L5.8 212h112.4c109.4 0 112.7-.1 120.4-2 17.2-4.4 32.2-13.9 42.9-27.2 11.6-14.6 16.2-26.8 17.2-45.6l.6-11.3-15.9.3-15.9.3-.6 6.5c-1.4 13.3-5.2 22.2-13.1 30.6a48.5 48.5 0 0 1-20.8 13.5c-7.4 2.6-10.8 2.6-130.2 2.1L41 179v-2.3c0-3.3 5.3-13.6 9.4-18.4 2.4-2.7 6.5-5.6 11.3-8l7.7-3.8 65-.5 65.1-.5 6-2.4c11.1-4.4 20-12.4 24.5-21.8 3.8-8 11.1-7.3-76.2-7.2-43.1.1-80.6.5-83.3.9"/>
                </g>
              </svg>
            </span>
            <span className="wordmark">tenaciti</span>
          </div>

          <div className="brand-copy">
            <p className="eyebrow">Authenticated Workspace</p>
            <h1>Your AI Academic<br/>Workspace.</h1>
            <p className="sub">Access your course roadmaps, connected notes, study goals, and academic progress in one unified workspace.</p>
          </div>

          <div className="graph-field" aria-hidden="true">
            <svg viewBox="0 0 400 260" preserveAspectRatio="none">
              <path d="M40 34 Q120 74 190 112" stroke="white" strokeOpacity=".32" strokeWidth="1" fill="none"/>
              <path d="M190 112 Q262 150 332 104" stroke="white" strokeOpacity=".26" strokeWidth="1" fill="none"/>
              <path d="M64 202 Q150 190 190 112" stroke="white" strokeOpacity=".22" strokeWidth="1" fill="none"/>
              <path d="M332 104 Q362 62 342 22" stroke="white" strokeOpacity=".2" strokeWidth="1" fill="none"/>
              <circle cx="40" cy="34" r="3" fill="white" fillOpacity=".55"/>
              <circle cx="190" cy="112" r="3.5" fill="white" fillOpacity=".65"/>
              <circle cx="332" cy="104" r="3" fill="white" fillOpacity=".5"/>
              <circle cx="64" cy="202" r="2.5" fill="white" fillOpacity=".45"/>
              <circle cx="342" cy="22" r="2.5" fill="white" fillOpacity=".4"/>
            </svg>
            <span className="dot d1"></span>
            <span className="dot d2"></span>
            <span className="dot d3"></span>

            <div className="chip c1">
              <span className="pip"></span>
              <span><strong>AI Study Roadmap</strong><span className="chip-sub">Syllabus extracted & scheduled</span></span>
            </div>
            <div className="chip c2">
              <span className="pip"></span>
              <span><strong>Knowledge Graph</strong><span className="chip-sub">Bi-directional notes linked</span></span>
            </div>
            <div className="chip c3">
              <span className="pip"></span>
              <span><strong>Progress & Streaks</strong><span className="chip-sub">Daily tracking active</span></span>
            </div>
          </div>

          <div className="brand-footer">
            <a href={MARKETING_URL} className="brand-learn-more" target="_blank" rel="noopener noreferrer">
              <span>Learn more about Tenaciti</span>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
            </a>
          </div>
        </aside>

        {/* Auth Panel */}
        <main className="auth-panel">
          <div className="auth-card">

            <div className="auth-card-top-nav">
              <a href={MARKETING_URL} className="back-to-site-link">
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>arrow_back</span>
                <span>tenaciti.app</span>
              </a>
            </div>

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

            <div className="tabs" role="tablist" aria-label="Choose login or signup">
              <button 
                className={`tab ${!isSignup ? 'active' : ''}`} 
                type="button" 
                onClick={() => { setError(''); setActiveTab('login'); }}
                role="tab" 
                aria-selected={!isSignup}
              >
                Log in
              </button>
              <button 
                className={`tab ${isSignup ? 'active' : ''}`} 
                type="button" 
                onClick={() => { setError(''); setActiveTab('signup'); }}
                role="tab" 
                aria-selected={isSignup}
              >
                Sign up
              </button>
              <span className="tab-indicator" style={{ transform: isSignup ? 'translateX(100%)' : 'translateX(0)' }}></span>
            </div>

            <div className="card-head">
              <h2>{isSignup ? 'Create your account' : 'Welcome back'}</h2>
              <p>{isSignup ? "Start turning your syllabus into a plan." : "Log in to pick up your roadmap where you left off."}</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button className="google-btn" type="button" onClick={handleGoogle}>
              <svg viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
              </svg>
              <span>{isSignup ? 'Sign up with Google' : 'Continue with Google'}</span>
            </button>

            <div className="divider">or continue with email</div>

            <form onSubmit={handleSubmit} noValidate>
              
              <div className={`field ${!isSignup ? 'is-hidden' : ''}`}>
                <label htmlFor="fullname">Full name</label>
                <input 
                  type="text" 
                  id="fullname" 
                  placeholder="Alex Rivera" 
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={!isSignup}
                  tabIndex={!isSignup ? -1 : 0}
                  required={isSignup}
                />
              </div>

              <div className="field">
                <label htmlFor="email">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  placeholder="you@school.edu" 
                  autoComplete="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="pw">Password</label>
                <div className="password-wrap">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    id="pw" 
                    placeholder="••••••••" 
                    autoComplete="current-password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button 
                    type="button" 
                    className="toggle-pw" 
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className={`field ${!isSignup ? 'is-hidden' : ''}`}>
                <label htmlFor="pw2">Confirm password</label>
                <input 
                  type="password" 
                  id="pw2" 
                  placeholder="••••••••" 
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={!isSignup}
                  tabIndex={!isSignup ? -1 : 0}
                  required={isSignup}
                />
              </div>

              <div className={`row-between ${isSignup ? 'is-hidden' : ''}`}>
                <label className="check"><input type="checkbox" name="remember" /><span>Remember me</span></label>
                <Link to="/forgot-password" className="link-muted">Forgot password?</Link>
              </div>

              <button type="submit" className={`cta-btn ${isLoading ? 'loading' : ''}`}>
                <span>{isSignup ? (isLoading ? 'Creating account…' : 'Create account') : (isLoading ? 'Logging in…' : 'Log in')}</span>
                <span className="cta-spinner" hidden={!isLoading}></span>
              </button>
            </form>

            <p className="switch-line">
              {isSignup ? 'Already have an account? ' : 'Don\'t have an account? '}
              <button type="button" onClick={() => { setError(''); setActiveTab(isSignup ? 'login' : 'signup'); }}>
                {isSignup ? 'Log in' : 'Sign up'}
              </button>
            </p>
            <p className="fine-print">By continuing, you agree to Tenaciti's <Link to="#">Terms of Service</Link> and <Link to="#">Privacy Policy</Link>.</p>

          </div>
        </main>

      </div>
    </div>
  );
}