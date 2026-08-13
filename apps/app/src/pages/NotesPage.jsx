/**
 * NotesPage — Main notes management page (Glassmorphic UI).
 *
 * Features:
 * - List view: glass note cards in responsive grid
 * - Graph view: light-themed knowledge graph with ambient glows
 * - Editor view: glass editor with backlinks sidebar
 * - Search with glass input + filter button
 * - Quick capture modal with glass styling
 * - Stub note management
 */
import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiFetch } from '../api/client'
import MarkdownEditor from '../components/Notes/MarkdownEditor'
import GraphView from '../components/Notes/GraphView'
import BacklinksPanel from '../components/Notes/BacklinksPanel'

export default function NotesPage() {
  const { id } = useParams() // Note ID if viewing single note
  const navigate = useNavigate()

  // View state
  const [view, setView] = useState('list') // 'list' or 'graph' or 'editor'
  const [notes, setNotes] = useState([])
  const [activeNote, setActiveNote] = useState(null)
  const [backlinks, setBacklinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobile, setIsMobile] = useState(false)

  // Quick capture state
  const [quickCaptureOpen, setQuickCaptureOpen] = useState(false)
  const [quickCaptureNote, setQuickCaptureNote] = useState(null)

  // Check mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Fetch notes
  const fetchNotes = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiFetch('/notes')
      setNotes(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to fetch notes:', err)
      setNotes([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch single note if ID provided
  // NOTE: do NOT call setView here — the URL (id param) already drives the view branch.
  const fetchNote = useCallback(async (noteId) => {
    try {
      const data = await apiFetch(`/notes/${noteId}`)
      setActiveNote(data)
      setBacklinks(Array.isArray(data.backlinks) ? data.backlinks : [])
    } catch (err) {
      console.error('Failed to fetch note:', err)
    }
  }, [])

  // Fetch backlinks for active note
  const fetchBacklinks = useCallback(async (noteId) => {
    try {
      const data = await apiFetch(`/notes/backlinks/${noteId}`)
      setBacklinks(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to fetch backlinks:', err)
    }
  }, [])

  // Load data based on route.
  // When navigating to a note, clear activeNote first so the loading screen
  // is shown and MarkdownEditor is not mounted with stale/null note data.
  useEffect(() => {
    if (id) {
      setActiveNote(null)
      setBacklinks([])
      fetchNote(parseInt(id))
    } else {
      // Back to list — also reset view to 'list' in case it drifted.
      setView('list')
      fetchNotes()
    }
  }, [id])

  // Create new note
  const handleCreateNote = async () => {
    const newNote = {
      title: 'Untitled Note',
      content: '',
    }
    try {
      const created = await apiFetch('/notes', {
        method: 'POST',
        body: JSON.stringify(newNote),
      })
      setNotes((prev) => [created, ...(Array.isArray(prev) ? prev : [])])
      navigate(`/notes/${created.id}`)
    } catch (err) {
      console.error('Failed to create note:', err)
    }
  }

  // Quick capture
  const handleQuickCapture = async (content) => {
    try {
      const created = await apiFetch('/notes', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Quick Capture',
          content,
          is_quick_capture: true,
        }),
      })
      setNotes((prev) => [created, ...(Array.isArray(prev) ? prev : [])])
      setQuickCaptureOpen(false)
      setQuickCaptureNote(null)
    } catch (err) {
      console.error('Quick capture failed:', err)
    }
  }

  // Update note
  const handleUpdateNote = async (updatedNote) => {
    setNotes((prev) => (Array.isArray(prev) ? prev : []).map((n) => (n.id === updatedNote.id ? updatedNote : n)))
    setActiveNote(updatedNote)
  }

  // Delete note
  const handleDeleteNote = async (noteId) => {
    if (!confirm('Delete this note?')) return
    try {
      await apiFetch(`/notes/${noteId}`, { method: 'DELETE' })
      setNotes((prev) => (Array.isArray(prev) ? prev : []).filter((n) => n.id !== noteId))
      navigate('/notes')
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  // Filter & Sort state
  const [courses, setCourses] = useState([])
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [sortBy, setSortBy] = useState('date_desc')
  const [showFilters, setShowFilters] = useState(false)

  // Fetch available courses for filter dropdown
  useEffect(() => {
    const fetchCoursesList = async () => {
      try {
        const data = await apiFetch('/courses')
        setCourses(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Failed to fetch courses for filter:', err)
      }
    }
    fetchCoursesList()
  }, [])

  // Search notes with advanced filters
  const handleSearch = useCallback(async (query, courseIdFilter, sortOrder) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (query && query.trim()) params.append('q', query.trim())
      if (courseIdFilter) params.append('course_id', courseIdFilter)
      if (sortOrder) params.append('sort_by', sortOrder)

      const queryString = params.toString()
      const url = queryString ? `/notes/search?${queryString}` : '/notes'
      const data = await apiFetch(url)
      setNotes(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Search failed:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Trigger search on filter/sort change (only when filter or query is present)
  useEffect(() => {
    if (!id && view === 'list') {
      if (searchQuery.trim() || selectedCourseId || sortBy !== 'date_desc') {
        const timer = setTimeout(() => {
          handleSearch(searchQuery, selectedCourseId, sortBy)
        }, 250)
        return () => clearTimeout(timer)
      }
    }
  }, [searchQuery, selectedCourseId, sortBy, id, view, handleSearch])

  // Timeline state
  const [timelineData, setTimelineData] = useState(null)
  const [timelineGroupBy, setTimelineGroupBy] = useState('day')
  const [timelineLoading, setTimelineLoading] = useState(false)

  // Fetch timeline data
  const fetchTimeline = useCallback(async () => {
    setTimelineLoading(true)
    try {
      let url = `/notes/timeline?group_by=${timelineGroupBy}`
      if (selectedCourseId) url += `&course_id=${selectedCourseId}`
      const data = await apiFetch(url)
      setTimelineData(data)
    } catch (err) {
      console.error('Failed to fetch timeline:', err)
    } finally {
      setTimelineLoading(false)
    }
  }, [timelineGroupBy, selectedCourseId])

  useEffect(() => {
    if (view === 'timeline') {
      fetchTimeline()
    }
  }, [view, timelineGroupBy, selectedCourseId, fetchTimeline])

  // Toggle pin status for a note
  const handleTogglePin = async (e, noteId, currentPinned) => {
    e.stopPropagation()
    try {
      const updated = await apiFetch(`/notes/${noteId}/pin`, {
        method: 'PATCH',
        body: JSON.stringify({ is_pinned: !currentPinned }),
      })
      setNotes((prev) => {
        const list = (Array.isArray(prev) ? prev : []).map((n) => (n.id === noteId ? updated : n))
        return list.sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0))
      })
      if (view === 'timeline') {
        fetchTimeline()
      }
    } catch (err) {
      console.error('Pin toggle failed:', err)
    }
  }

  // Format relative time
  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // ── List View ─────────────────────────────────────
  const renderListView = () => (
    <div className="notes-page">
      {/* Decorative blobs */}
      <div className="notes-blob-1" />
      <div className="notes-blob-2" />

      {/* Header */}
      <div className="notes-header">
        <h1>
          <span style={{ fontSize: '40px' }}>📝</span> Notes
        </h1>
        <div className="notes-header-actions">
          <button
            className="notes-action-btn"
            onClick={() => {
              setQuickCaptureNote('')
              setQuickCaptureOpen(true)
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--gradient-end)' }}>bolt</span>
            Quick Capture
          </button>
          <button
            className={`notes-action-btn ${view === 'timeline' ? 'primary' : ''}`}
            onClick={() => setView('timeline')}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>timeline</span>
            Timeline View
          </button>
          <button
            className="notes-action-btn"
            onClick={() => setView('graph')}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--secondary)' }}>hub</span>
            Graph View
          </button>
          <button
            className="notes-action-btn primary"
            onClick={handleCreateNote}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add</span>
            New Note
          </button>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        <div className="notes-search-wrapper" style={{ margin: 0 }}>
          <span className="material-symbols-outlined search-icon">search</span>
          <input
            type="text"
            className="notes-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes by title, content, or concept..."
          />
          <button 
            className="notes-search-filter-btn" 
            title="Filter and Sort options"
            onClick={() => setShowFilters(!showFilters)}
            style={{ backgroundColor: (selectedCourseId || showFilters) ? 'var(--surface-container-high)' : 'transparent' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: (selectedCourseId || showFilters) ? 'var(--primary)' : 'inherit' }}>tune</span>
          </button>
        </div>

        {/* Filter options toolbar */}
        {showFilters && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap',
            padding: '16px',
            backgroundColor: 'var(--surface-container-low, rgba(255,255,255,0.03))',
            borderRadius: '12px',
            border: '1px solid var(--outline-variant, rgba(255,255,255,0.08))',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--on-surface-variant)' }}>school</span>
              <label style={{ fontSize: '13px', color: 'var(--on-surface-variant)', fontWeight: '500' }}>Course:</label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--surface-container-high, #1e1e24)',
                  color: 'var(--on-surface)',
                  border: '1px solid var(--outline-variant, #444)',
                  fontSize: '13px',
                }}
              >
                <option value="">All Courses</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.code ? `${c.code} - ${c.name}` : c.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--on-surface-variant)' }}>sort</span>
              <label style={{ fontSize: '13px', color: 'var(--on-surface-variant)', fontWeight: '500' }}>Sort By:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--surface-container-high, #1e1e24)',
                  color: 'var(--on-surface)',
                  border: '1px solid var(--outline-variant, #444)',
                  fontSize: '13px',
                }}
              >
                {searchQuery.trim() && <option value="relevance">Relevance</option>}
                <option value="date_desc">Newest First</option>
                <option value="date_asc">Oldest First</option>
                <option value="title_asc">Title (A-Z)</option>
                <option value="title_desc">Title (Z-A)</option>
              </select>
            </div>

            {(selectedCourseId || searchQuery) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCourseId('');
                  setSortBy('date_desc');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--error, #ff5449)',
                  fontSize: '13px',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  marginLeft: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span> Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Notes list */}
      {loading ? (
        <div className="notes-loading">
          <span className="spinner" style={{ borderTopColor: 'var(--secondary)' }} />
          Loading notes...
        </div>
      ) : (Array.isArray(notes) ? notes : []).length === 0 ? (
        <div className="notes-empty-state">
          <div className="empty-icon">📝</div>
          <p>No notes yet. Create your first note to start linking knowledge.</p>
          <button className="notes-action-btn primary" onClick={handleCreateNote}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add</span>
            Create Note
          </button>
        </div>
      ) : (
        <div className="notes-card-grid">
          {(Array.isArray(notes) ? notes : []).map((note) => (
            <div
              key={note.id}
              className="notes-card"
              onClick={() => navigate(`/notes/${note.id}`)}
            >
              <div className="card-corner-glow" />
              <div className="notes-card-header">
                <div className="title-area">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {note.is_pinned && <span style={{ fontSize: '14px', color: '#f59e0b' }} title="Pinned note">📌</span>}
                    <h3>{note.title}</h3>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {note.course_id && (
                      <span className="notes-card-badge">
                        Course {note.course_id}
                      </span>
                    )}
                    {note.is_stub && (
                      <span className="notes-card-badge stub">
                        Stub
                      </span>
                    )}
                  </div>
                </div>
                <div className="notes-card-actions">
                  <button
                    className="notes-card-delete"
                    onClick={(e) => handleTogglePin(e, note.id, note.is_pinned)}
                    title={note.is_pinned ? "Unpin note" : "Pin note"}
                    style={{ color: note.is_pinned ? '#f59e0b' : 'inherit' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                      {note.is_pinned ? 'push_pin' : 'keep'}
                    </span>
                  </button>
                  <button
                    className="notes-card-delete"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteNote(note.id)
                    }}
                    title="Delete note"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>delete</span>
                  </button>
                </div>
              </div>
              <div className="notes-card-body">
                <p className={note.is_stub ? 'stub-content' : ''}>
                  {(note.content || '').slice(0, 200) || 'Empty note...'}
                </p>
              </div>
              <div className="notes-card-footer">
                <span>
                  {note.updated_at ? `Updated ${formatRelativeTime(note.updated_at)}` : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  // ── Timeline View ─────────────────────────────────
  const renderTimelineView = () => (
    <div className="notes-page">
      <div className="notes-blob-1" />
      <div className="notes-blob-2" />

      <div className="notes-header">
        <h1>
          <span style={{ fontSize: '40px' }}>⏳</span> Notes Timeline
        </h1>
        <div className="notes-header-actions">
          <div style={{ display: 'flex', backgroundColor: 'var(--surface-container-high)', borderRadius: '12px', padding: '4px', border: '1px solid var(--outline-variant)' }}>
            <button
              onClick={() => setView('list')}
              style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', background: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>list</span> List
            </button>
            <button
              style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: 'var(--on-primary)', fontWeight: '600', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>timeline</span> Timeline
            </button>
            <button
              onClick={() => setView('graph')}
              style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', background: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>hub</span> Graph
            </button>
          </div>

          <button className="notes-action-btn primary" onClick={handleCreateNote}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add</span> New Note
          </button>
        </div>
      </div>

      {/* Timeline Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '14px', color: 'var(--on-surface-variant)', fontWeight: '500' }}>Group Timeline By:</span>
          <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--surface-container-high)', padding: '4px', borderRadius: '10px' }}>
            {['day', 'week', 'month'].map((scale) => (
              <button
                key={scale}
                onClick={() => setTimelineGroupBy(scale)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: timelineGroupBy === scale ? 'var(--surface-container-highest)' : 'transparent',
                  color: timelineGroupBy === scale ? 'var(--primary)' : 'var(--on-surface-variant)',
                  fontWeight: timelineGroupBy === scale ? '600' : '400',
                  fontSize: '13px',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {scale}
              </button>
            ))}
          </div>
        </div>

        {courses.length > 0 && (
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: '8px', backgroundColor: 'var(--surface-container-high)', color: 'var(--on-surface)', border: '1px solid var(--outline-variant)', fontSize: '13px' }}
          >
            <option value="">All Courses</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.code ? `${c.code} - ${c.name}` : c.name}</option>
            ))}
          </select>
        )}
      </div>

      {timelineLoading ? (
        <div className="notes-loading">
          <span className="spinner" style={{ borderTopColor: 'var(--primary)' }} />
          Building timeline...
        </div>
      ) : !timelineData || timelineData.groups.length === 0 ? (
        <div className="notes-empty-state">
          <div className="empty-icon">⏳</div>
          <p>No notes found in timeline.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', position: 'relative' }}>
          {/* Vertical timeline spine */}
          <div style={{ position: 'absolute', left: '19px', top: '24px', bottom: '24px', width: '2px', backgroundColor: 'var(--outline-variant)', opacity: 0.4 }} />

          {timelineData.groups.map((group) => (
            <div key={group.group_key} style={{ position: 'relative', paddingLeft: '48px' }}>
              {/* Group node dot */}
              <div style={{ position: 'absolute', left: '10px', top: '4px', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'var(--surface-container-lowest)', border: '3px solid var(--primary)', boxShadow: '0 0 10px var(--primary)' }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: 'var(--on-surface)' }}>{group.group_label}</h3>
                <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)', backgroundColor: 'var(--surface-container-high)', padding: '2px 8px', borderRadius: '12px' }}>
                  {group.note_count} {group.note_count === 1 ? 'note' : 'notes'}
                </span>
              </div>

              <div className="notes-card-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                {group.notes.map((note) => (
                  <div key={note.id} className="notes-card" onClick={() => navigate(`/notes/${note.id}`)}>
                    <div className="card-corner-glow" />
                    <div className="notes-card-header">
                      <div className="title-area">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {note.is_pinned && <span style={{ fontSize: '14px', color: '#f59e0b' }} title="Pinned note">📌</span>}
                          <h3>{note.title}</h3>
                        </div>
                        {note.is_stub && <span className="notes-card-badge stub">Stub</span>}
                      </div>
                      <div className="notes-card-actions">
                        <button
                          className="notes-card-delete"
                          onClick={(e) => handleTogglePin(e, note.id, note.is_pinned)}
                          title={note.is_pinned ? "Unpin note" : "Pin note"}
                          style={{ color: note.is_pinned ? '#f59e0b' : 'inherit' }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                            {note.is_pinned ? 'push_pin' : 'keep'}
                          </span>
                        </button>
                        <button
                          className="notes-card-delete"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteNote(note.id)
                          }}
                          title="Delete note"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>delete</span>
                        </button>
                      </div>
                    </div>
                    <div className="notes-card-body">
                      <p>{(note.content || '').slice(0, 150) || 'Empty note...'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  // ── Editor View ───────────────────────────────────
  const renderEditorView = () => (
    <div className="notes-page" style={{ paddingBottom: '24px', display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 80px)' }}>
      {/* Ambient blobs */}
      <div className="notes-editor-blob-1" />
      <div className="notes-editor-blob-2" />

      {/* Editor Header */}
      <div className="notes-editor-header">
        <button className="notes-back-link" onClick={() => navigate('/notes')}>
          <span className="material-symbols-outlined">arrow_back</span>
          All Notes
        </button>

        <div className="notes-view-toggle">
          <button className="active">List</button>
          <button onClick={() => setView('graph')}>Graph</button>
        </div>

        <div className="notes-editor-actions">
          <button
            className="notes-save-btn"
            onClick={() => {
              // Trigger save by finding the MarkdownEditor's save handler
              // The editor auto-saves on blur, but this provides explicit save
              const editorEl = document.querySelector('.notes-editor-textarea')
              if (editorEl) editorEl.blur()
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>save</span>
            Save
          </button>
        </div>
      </div>

      {/* Editor + Backlinks layout */}
      <div className="notes-editor-layout" style={{ flex: 1 }}>
        {/* Editor — key ensures a full remount when switching between notes,
             so MarkdownEditor's useState re-initialises from the new note prop. */}
        <MarkdownEditor
          key={activeNote?.id}
          note={activeNote}
          onSave={handleUpdateNote}
          onCancel={() => navigate('/notes')}
          availableNotes={(Array.isArray(notes) ? notes : []).filter((n) => n.id !== activeNote?.id)}
        />

        {/* Backlinks sidebar */}
        <BacklinksPanel
          backlinks={backlinks}
          onNavigate={(noteId) => navigate(`/notes/${noteId}`)}
        />
      </div>
    </div>
  )

  // ── Graph View ───────────────────────────────────
  const renderGraph = () => (
    <div className="notes-page">
      {/* Graph Header */}
      <div className="notes-graph-header">
        <div className="notes-graph-title-area">
          <button
            className="notes-graph-back-btn"
            onClick={() => navigate('/notes')}
            title="Back to notes"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_back</span>
          </button>
          <div className="notes-graph-label">
            <span className="label-text">Knowledge Graph</span>
            <span className="live-dot" />
            <span className="live-text">Live Sync</span>
          </div>
        </div>

        <div className="notes-view-toggle">
          <button className="active">Graph</button>
          <button onClick={() => setView('list')}>List</button>
        </div>
      </div>

      <GraphView
        notes={Array.isArray(notes) ? notes : []}
        onNodeClick={(noteId) => navigate(`/notes/${noteId}`)}
      />
    </div>
  )

  // ── Quick Capture Modal ─────────────────────────
  const renderQuickCapture = () => (
    <div
      className="notes-qc-overlay"
      onClick={() => setQuickCaptureOpen(false)}
    >
      <div
        className="notes-qc-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <h3>
          <span className="material-symbols-outlined" style={{ color: 'var(--gradient-end)' }}>bolt</span>
          Quick Capture
        </h3>
        <textarea
          autoFocus
          value={quickCaptureNote || ''}
          onChange={(e) => setQuickCaptureNote(e.target.value)}
          placeholder="Type your quick note or idea... Use [[wikilink]] to link topic"
        />
        <div className="notes-qc-actions">
          <button className="cancel-btn" onClick={() => setQuickCaptureOpen(false)}>
            Cancel
          </button>
          <button
            className="save-btn"
            onClick={() => handleQuickCapture(quickCaptureNote || '')}
            disabled={!quickCaptureNote || !quickCaptureNote.trim()}
          >
            Save Note
          </button>
        </div>
      </div>
    </div>
  )

  // Main render
  // When viewing a specific note (id provided), always show editor
  if (id) {
    // Still loading the note
    if (!activeNote && loading) {
      return (
        <div className="notes-page">
          <div className="notes-loading">
            <span className="spinner" style={{ borderTopColor: 'var(--secondary)' }} />
            Loading note...
          </div>
        </div>
      )
    }
    return renderEditorView()
  }

  return (
    <>
      {view === 'list' && renderListView()}
      {view === 'timeline' && renderTimelineView()}
      {view === 'graph' && renderGraph()}

      {/* Floating Action Button on mobile */}
      {isMobile && (
        <button
          onClick={() => {
            setQuickCaptureNote('')
            setQuickCaptureOpen(true)
          }}
          className="notes-fab"
          title="Quick Capture"
        >
          <span className="material-symbols-outlined">bolt</span>
        </button>
      )}

      {/* Render modal when open */}
      {quickCaptureOpen && renderQuickCapture()}
    </>
  )
}