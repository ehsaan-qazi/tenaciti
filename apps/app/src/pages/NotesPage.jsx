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
      setNotes(data)
    } catch (err) {
      console.error('Failed to fetch notes:', err)
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
      setBacklinks(data.backlinks || [])
    } catch (err) {
      console.error('Failed to fetch note:', err)
    }
  }, [])

  // Fetch backlinks for active note
  const fetchBacklinks = useCallback(async (noteId) => {
    try {
      const data = await apiFetch(`/notes/backlinks/${noteId}`)
      setBacklinks(data)
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
      setNotes([created, ...notes])
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
      setNotes([created, ...notes])
      setQuickCaptureOpen(false)
      setQuickCaptureNote(null)
    } catch (err) {
      console.error('Quick capture failed:', err)
    }
  }

  // Update note
  const handleUpdateNote = async (updatedNote) => {
    setNotes(notes.map((n) => n.id === updatedNote.id ? updatedNote : n))
    setActiveNote(updatedNote)
  }

  // Delete note
  const handleDeleteNote = async (noteId) => {
    if (!confirm('Delete this note?')) return
    try {
      await apiFetch(`/notes/${noteId}`, { method: 'DELETE' })
      setNotes(notes.filter((n) => n.id !== noteId))
      navigate('/notes')
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  // Search notes
  const handleSearch = async (query) => {
    if (!query.trim()) {
      fetchNotes()
      return
    }
    try {
      const data = await apiFetch(`/notes/search?q=${encodeURIComponent(query)}`)
      setNotes(data)
    } catch (err) {
      console.error('Search failed:', err)
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

      {/* Search */}
      <div className="notes-search-wrapper">
        <span className="material-symbols-outlined search-icon">search</span>
        <input
          type="text"
          className="notes-search-input"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            handleSearch(e.target.value)
          }}
          placeholder="Search notes, concepts, tags..."
        />
        <button className="notes-search-filter-btn" title="Filter options">
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>tune</span>
        </button>
      </div>

      {/* Notes list */}
      {loading ? (
        <div className="notes-loading">
          <span className="spinner" style={{ borderTopColor: 'var(--secondary)' }} />
          Loading notes...
        </div>
      ) : notes.length === 0 ? (
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
          {notes.map((note) => (
            <div
              key={note.id}
              className="notes-card"
              onClick={() => navigate(`/notes/${note.id}`)}
            >
              <div className="card-corner-glow" />
              <div className="notes-card-header">
                <div className="title-area">
                  <h3>{note.title}</h3>
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
          <button className="notes-more-btn" title="More options">
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>more_vert</span>
          </button>
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
          availableNotes={notes.filter((n) => n.id !== activeNote?.id)}
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
        notes={notes}
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