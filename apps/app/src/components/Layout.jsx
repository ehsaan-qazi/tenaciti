import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { searchGlobal } from '../api/searchApi';
import { getNotifications, getUnreadNotificationCount } from '../api/notificationApi';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef(null);

  // Notification state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  // Determine if we should use the new glassmorphic UI layout
  const isGlassmorphic = location.pathname === '/' || location.pathname.startsWith('/courses') || location.pathname.startsWith('/notes') || location.pathname.startsWith('/gpa') || location.pathname.startsWith('/self-assessment') || location.pathname.startsWith('/goals') || location.pathname.startsWith('/settings');

  const streakCount = user?.streak_count ?? null;

  // Auto-close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
    setShowSearchDropdown(false);
    setShowNotifications(false);
  }, [location.pathname]);

  // Debounced search fetch
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      setShowSearchDropdown(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await searchGlobal(searchQuery);
        setSearchResults(res?.items || []);
        setShowSearchDropdown(true);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch unread notification count
  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      try {
        const res = await getUnreadNotificationCount();
        setUnreadCount(res?.count || 0);
      } catch (err) {
        console.error('Notification count fetch failed:', err);
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 60000); // poll every 60s
    return () => clearInterval(interval);
  }, [user]);

  // Load notification details when dropdown is opened
  const toggleNotifications = async () => {
    if (!showNotifications) {
      try {
        const res = await getNotifications();
        setNotifications(res?.items || []);
      } catch (err) {
        console.error('Notification fetch failed:', err);
      }
    }
    setShowNotifications(!showNotifications);
    setShowSearchDropdown(false);
  };

  // Close dropdowns on outside click or Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (sidebarOpen) setSidebarOpen(false);
        setShowSearchDropdown(false);
        setShowNotifications(false);
      }
    };
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sidebarOpen]);

  // Handle navigating to search result entity
  const handleSearchResultClick = (item) => {
    setShowSearchDropdown(false);
    setSearchQuery('');
    if (item.entity_type === 'course') {
      navigate(`/courses/${item.entity_id}`);
    } else if (item.entity_type === 'note') {
      navigate(`/notes?id=${item.entity_id}`);
    } else if (item.entity_type === 'goal') {
      navigate('/goals');
    } else if (item.entity_type === 'roadmap_node') {
      if (item.course_id) navigate(`/courses/${item.course_id}`);
      else navigate('/courses');
    }
  };

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const getEntityIcon = (type) => {
    switch (type) {
      case 'course': return 'school';
      case 'note': return 'description';
      case 'goal': return 'flag';
      case 'roadmap_node': return 'assignment';
      default: return 'search';
    }
  };

  return (
    <>
      {/* Sidebar backdrop (mobile only — visible class controlled by state) */}
      <div 
        className={`sidebar-backdrop ${sidebarOpen ? 'visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      <div className={isGlassmorphic ? "glass-main-bg" : "main"}>
        {isGlassmorphic ? (
          <header className="glass-topbar">
            {/* Hamburger — visible only on mobile/tablet via CSS */}
            <button
              className="hamburger-btn"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={sidebarOpen}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>menu</span>
            </button>

            {/* Search */}
            <div 
              ref={searchRef}
              className="topbar-search" 
              style={{ flex: 1, maxWidth: '600px', display: 'flex', alignItems: 'center', position: 'relative' }}
            >
              <span className="material-symbols-outlined" style={{ position: 'absolute', left: '16px', color: 'var(--on-surface-variant)', fontSize: '20px' }}>search</span>
              <input 
                type="text" 
                className="glass-input-search" 
                placeholder="Search courses, notes, or goals..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim() && setShowSearchDropdown(true)}
              />
              {isSearching && (
                <span className="material-symbols-outlined spin" style={{ position: 'absolute', right: '16px', fontSize: '18px', color: 'var(--on-surface-variant)' }}>sync</span>
              )}

              {/* Search Results Dropdown */}
              {showSearchDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '8px',
                  backgroundColor: 'var(--surface-container-high, #1e1e24)',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                  border: '1px solid var(--outline-variant, #333)',
                  maxHeight: '400px',
                  overflowY: 'auto',
                  zIndex: 1000,
                  padding: '8px 0',
                }}>
                  {searchResults.length === 0 ? (
                    <div style={{ padding: '16px', textAlign: 'center', color: 'var(--on-surface-variant)' }}>
                      No results found for "{searchQuery}"
                    </div>
                  ) : (
                    searchResults.map((item) => (
                      <div
                        key={`${item.entity_type}_${item.entity_id}`}
                        onClick={() => handleSearchResultClick(item)}
                        style={{
                          padding: '10px 16px',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px',
                          cursor: 'pointer',
                          borderBottom: '1px solid var(--outline-variant, rgba(255,255,255,0.05))',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-container-highest, rgba(255,255,255,0.08))'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--primary)', marginTop: '2px' }}>
                          {getEntityIcon(item.entity_type)}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--on-surface)' }}>
                            {item.title}
                          </div>
                          {item.snippet && (
                            <div style={{ fontSize: '12px', color: 'var(--on-surface-variant)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {item.snippet}
                            </div>
                          )}
                        </div>
                        <span style={{ fontSize: '11px', textTransform: 'capitalize', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', color: 'var(--on-surface-variant)' }}>
                          {item.entity_type.replace('_', ' ')}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="topbar-actions-group" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <button className="topbar-action-help" style={{ background: 'none', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>help</span>
              </button>

              {/* Notification Bell */}
              <div ref={notifRef} style={{ position: 'relative' }}>
                <button 
                  onClick={toggleNotifications}
                  style={{ background: 'none', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center' }}
                  aria-label="Notifications"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>notifications</span>
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '-2px',
                      right: '-4px',
                      backgroundColor: 'var(--error, #ff5449)',
                      color: '#fff',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      borderRadius: '10px',
                      minWidth: '16px',
                      height: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 4px',
                      border: '2px solid var(--surface-container-lowest, #121212)'
                    }}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '12px',
                    width: '340px',
                    backgroundColor: 'var(--surface-container-high, #1e1e24)',
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                    border: '1px solid var(--outline-variant, #333)',
                    maxHeight: '420px',
                    overflowY: 'auto',
                    zIndex: 1000,
                  }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--outline-variant, rgba(255,255,255,0.1))', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--on-surface)' }}>Notifications</span>
                      <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>{notifications.length} updates</span>
                    </div>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--on-surface-variant)', fontSize: '13px' }}>
                        🎉 All caught up! No notifications.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            setShowNotifications(false);
                            if (n.course_id) navigate(`/courses/${n.course_id}`);
                          }}
                          style={{
                            padding: '12px 16px',
                            borderBottom: '1px solid var(--outline-variant, rgba(255,255,255,0.05))',
                            cursor: n.course_id ? 'pointer' : 'default',
                            transition: 'background 0.2s',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-container-highest, rgba(255,255,255,0.08))'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span 
                              className="material-symbols-outlined" 
                              style={{ 
                                fontSize: '18px', 
                                color: n.severity === 'error' ? 'var(--error, #ff5449)' : n.severity === 'warning' ? '#f59e0b' : n.severity === 'success' ? '#10b981' : 'var(--primary)'
                              }}
                            >
                              {n.severity === 'error' ? 'error' : n.severity === 'warning' ? 'warning' : n.severity === 'success' ? 'check_circle' : 'info'}
                            </span>
                            <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--on-surface)' }}>
                              {n.title}
                            </span>
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--on-surface-variant)', lineHeight: '1.4' }}>
                            {n.message}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div 
                style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                onClick={() => navigate('/settings')}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'var(--on-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold' }}>
                  {user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="material-symbols-outlined desktop-only" style={{ color: 'var(--on-surface-variant)' }}>expand_more</span>
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
