import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Determine if we should use the new glassmorphic UI layout
  const isGlassmorphic = location.pathname === '/' || location.pathname.startsWith('/courses') || location.pathname.startsWith('/notes') || location.pathname.startsWith('/gpa');

  const streakCount = user?.streak_count ?? null;

  return (
    <>
      <Sidebar />
      <div className={isGlassmorphic ? "glass-main-bg" : "main"}>
        {isGlassmorphic ? (
          <header className="glass-topbar">
            <div style={{ flex: 1, maxWidth: '600px', display: 'flex', alignItems: 'center', position: 'relative' }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', left: '16px', color: 'var(--on-surface-variant)', fontSize: '20px' }}>search</span>
              {/* Requires functionality comment added per instructions */}
              <input 
                type="text" 
                className="glass-input-search" 
                placeholder="Search courses, notes, or goals..." 
                disabled
                title="Search requires backend implementation"
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <button style={{ background: 'none', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>help</span>
              </button>
              <button style={{ background: 'none', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer', position: 'relative' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>notifications</span>
                <span style={{ position: 'absolute', top: 0, right: 0, width: '8px', height: '8px', backgroundColor: 'var(--error)', borderRadius: '50%', border: '2px solid var(--surface-container-lowest)' }}></span>
              </button>
              <div 
                style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                onClick={() => navigate('/settings')}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'var(--on-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold' }}>
                  {user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="material-symbols-outlined" style={{ color: 'var(--on-surface-variant)' }}>expand_more</span>
              </div>
            </div>
          </header>
        ) : (
          <header className="topbar">
            <div className="breadcrumb">
              <span className="current" id="breadcrumb-text">Tenaciti</span>
            </div>
            <div className="topbar-actions">
              {streakCount !== null && (
                <div
                  className="streak-pill"
                  onClick={() => navigate('/')}
                  title="Activity Streak"
                  style={{ cursor: 'pointer' }}
                >
                  🔥 {streakCount} days
                </div>
              )}
              <div
                className="topbar-btn"
                title="Settings"
                onClick={() => navigate('/settings')}
                style={{ cursor: 'pointer' }}
              >
                ⚙️
              </div>
            </div>
          </header>
        )}
        <div className={isGlassmorphic ? "" : "content"}>
          <Outlet />
        </div>
      </div>
    </>
  );
}
