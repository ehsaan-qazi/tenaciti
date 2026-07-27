/**
 * NotesPage — Main notes management page.
 *
 * Features:
 * - List view showing all notes
 * - Graph view showing note connections
 * - Search across notes
 * - Quick capture for mobile
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

  // ── List View ─────────────────────────────────────
  const renderListView = () => (
    <div className="notes-list-view">
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
      }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>📝 Notes</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="secondary-btn"
            onClick={() => {
              setQuickCaptureNote('')
              setQuickCaptureOpen(true)
            }}
            style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '12px' }}
          >
            ⚡ Quick Capture
          </button>
          <button
            className="secondary-btn"
            onClick={() => setView('graph')}
            style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '12px' }}
          >
            📊 Graph
          </button>
          <button
            className="primary-btn"
            onClick={handleCreateNote}
            style={{ width: 'auto' }}
          >
            ＋ New Note
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            handleSearch(e.target.value)
          }}
          placeholder="Search notes..."
          style={{
            width: '100%',
            padding: '0.5rem 0.75rem',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            borderRadius: '6px',
            color: 'var(--text-primary)',
          }}
        />
      </div>

      {/* Notes list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <span className="spinner" /> Loading notes...
        </div>
      ) : notes.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
          <p>No notes yet. Create your first note to start linking knowledge.</p>
          <button className="primary-btn" style={{ width: 'auto' }} onClick={handleCreateNote}>
            ＋ Create Note
          </button>
        </div>
      ) : (
        <div className="notes-grid">
          {notes.map((note) => (
            <div
              key={note.id}
              onClick={() => navigate(`/notes/${note.id}`)}
              style={{
                padding: '1rem',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-light)',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: note.is_stub ? 400 : 600 }}>
                  {note.title}
                  {note.is_stub && <span style={{ color: 'var(--amber)', marginLeft: '0.5rem', fontSize: '12px' }}>(stub)</span>}
                </h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteNote(note.id)
                  }}
                  className="icon-btn danger"
                  style={{ padding: 0, fontSize: '12px' }}
                >
                  🗑️
                </button>
              </div>
              <p style={{
                color: 'var(--text-secondary)',
                fontSize: '12px',
                marginTop: '0.5rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {(note.content || '').slice(0, 100)}...
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  // ── Editor View ───────────────────────────────────
  const renderEditorView = () => (
    <div className="notes-editor-view">
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
      }}>
        <button
          onClick={() => navigate('/notes')}
          className="secondary-btn"
          style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '12px' }}
        >
          ← Back
        </button>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setView('list')}
            className="secondary-btn"
            style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '12px' }}
          >
            📋 List
          </button>
          <button
            onClick={() => setView('graph')}
            className="secondary-btn"
            style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '12px' }}
          >
            📊 Graph
          </button>
        </div>
      </div>

      {/* Backlinks panel */}
      <BacklinksPanel
        backlinks={backlinks}
        onNavigate={(noteId) => navigate(`/notes/${noteId}`)}
      />

      {/* Editor — key ensures a full remount when switching between notes,
           so MarkdownEditor's useState re-initialises from the new note prop. */}
      <MarkdownEditor
        key={activeNote?.id}
        note={activeNote}
        onSave={handleUpdateNote}
        onCancel={() => navigate('/notes')}
        availableNotes={notes.filter((n) => n.id !== activeNote?.id)}
      />
    </div>
  )

  // ── Graph View ───────────────────────────────────
  const renderGraph = () => (
    <div className="notes-graph-view">
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
      }}>
        <button
          onClick={() => navigate('/notes')}
          className="secondary-btn"
          style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '12px' }}
        >
          ← Back
        </button>
        <button
          onClick={() => setView('list')}
          className="secondary-btn"
          style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '12px' }}
        >
          📋 List
        </button>
      </div>

      <GraphView
        notes={notes}
        onNodeClick={(noteId) => navigate(`/notes/${noteId}`)}
      />
    </div>
  )

  // ── Quick Capture for mobile ─────────────────────────
  const renderQuickCapture = () => (
    <div
      className="quick-capture-overlay"
      onClick={() => setQuickCaptureOpen(false)}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
    >
      <div
        className="quick-capture-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-light)',
          borderRadius: '12px',
          padding: '1.5rem',
          width: '100%',
          maxWidth: '480px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--text-primary)' }}>⚡ Quick Capture</h3>
        <textarea
          autoFocus
          value={quickCaptureNote || ''}
          onChange={(e) => setQuickCaptureNote(e.target.value)}
          placeholder="Type your quick note or idea... Use [[wikilink]] to link topic"
          style={{
            width: '100%',
            minHeight: '150px',
            padding: '0.75rem',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            borderRadius: '6px',
            color: 'var(--text-primary)',
            marginBottom: '1rem',
            resize: 'vertical',
            fontFamily: 'inherit',
          }}
        />
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button onClick={() => setQuickCaptureOpen(false)} className="secondary-btn" style={{ width: 'auto' }}>
            Cancel
          </button>
          <button
            onClick={() => handleQuickCapture(quickCaptureNote || '')}
            className="primary-btn"
            style={{ width: 'auto' }}
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
        <div className="page active">
          <div className="loading-screen">Loading note...</div>
        </div>
      )
    }
    return renderEditorView()
  }

  return (
    <div className="page active">
      <div className="page-header">
        <h1>Notes</h1>
      </div>
      {view === 'list' && renderListView()}
      {view === 'graph' && renderGraph()}

      {/* Floating Action Button on mobile */}
      {isMobile && (
        <button
          onClick={() => {
            setQuickCaptureNote('')
            setQuickCaptureOpen(true)
          }}
          className="quick-capture-fab"
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'var(--primary, #8a2be2)',
            color: '#ffffff',
            border: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            fontSize: '24px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 90,
          }}
          title="Quick Capture"
        >
          ⚡
        </button>
      )}

      {/* Render modal when open */}
      {quickCaptureOpen && renderQuickCapture()}
    </div>
  )
}