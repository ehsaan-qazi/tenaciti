import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import tenacitiLogo from '../assets/tenaciti_flipped.svg';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navItem = (path, icon, label) => {
    const active = isActive(path);
    return (
      <div
        className="nav-item-glass"
        onClick={() => navigate(path)}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '8px 12px',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'all 0.2s',
          backgroundColor: active ? 'var(--primary)' : 'transparent',
          color: active ? 'var(--on-primary)' : 'var(--on-surface-variant)',
          fontWeight: active ? '600' : '400',
          marginBottom: '4px'
        }}
        onMouseEnter={(e) => {
          if (!active) {
            e.currentTarget.style.backgroundColor = 'var(--surface-container-high)';
            e.currentTarget.style.color = 'var(--on-surface)';
          }
        }}
        onMouseLeave={(e) => {
          if (!active) {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--on-surface-variant)';
          }
        }}
      >
        <span className="material-symbols-outlined" style={{ marginRight: '10px', fontSize: '20px' }}>{icon}</span>
        <span style={{ fontSize: '14px' }}>{label}</span>
      </div>
    );
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <aside className="glass-sidebar">
      <div 
        onClick={() => navigate('/')} 
        style={{ 
          height: '64px', 
          display: 'flex', 
          alignItems: 'center', 
          padding: '0 24px', 
          cursor: 'pointer',
          gap: '12px'
        }}
      >
        <img src={tenacitiLogo} alt="Tenaciti Logo" style={{ width: '32px', height: '32px' }} />
        <span style={{ fontSize: '18px', fontWeight: '600', color: 'var(--primary)', letterSpacing: '-0.02em', fontFamily: 'Hanken Grotesk' }}>Tenaciti</span>
      </div>

      <nav style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column' }}>
        {navItem('/', 'dashboard', 'Dashboard')}
        {navItem('/courses', 'auto_stories', 'Courses')}
        {navItem('/notes', 'note_alt', 'Notes')}
        {navItem('/goals', 'target', 'Goals')}
        {navItem('/self-assessment', 'psychology_alt', 'Self-Assessment')}
        {navItem('/gpa', 'grade', 'GPA')}

        <div style={{ marginTop: 'auto', marginBottom: '8px' }}>
          {navItem('/settings', 'settings', 'Settings')}
          <div
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              color: 'var(--error)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--error-container)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <span className="material-symbols-outlined" style={{ marginRight: '10px', fontSize: '20px' }}>logout</span>
            <span style={{ fontSize: '14px' }}>Sign Out</span>
          </div>
        </div>
      </nav>
    </aside>
  );
}
