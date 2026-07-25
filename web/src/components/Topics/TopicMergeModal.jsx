/**
 * TopicMergeModal — Confirmation dialog for merging selected topics.
 *
 * Props:
 *   isOpen       — boolean
 *   onClose      — () => void
 *   topics       — array of selected topic objects
 *   selectedIds  — array of selected topic IDs
 *   onConfirm    — (targetId: number, newTitle: string) => Promise<void>
 */
import { useState, useEffect } from 'react'

export default function TopicMergeModal({ isOpen, onClose, topics, selectedIds, onConfirm }) {
  const [newTitle, setNewTitle] = useState('')
  const [targetId, setTargetId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen && selectedIds.length > 0) {
      const first = selectedIds[0]
      setTargetId(String(first))
      const firstTopic = topics.find((t) => t.id === first)
      setNewTitle(firstTopic?.title || '')
      setError('')
    }
  }, [isOpen, selectedIds, topics])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (selectedIds.length < 2) {
      setError('Select at least 2 topics to merge')
      return
    }
    if (!targetId) {
      setError('Select a target topic to keep')
      return
    }
    setLoading(true)
    setError('')
    try {
      await onConfirm(parseInt(targetId, 10), newTitle.trim() || undefined)
      onClose()
    } catch (err) {
      setError(err.message || 'Merge failed')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const sourcesToDelete = topics.filter((t) => t.id !== parseInt(targetId, 10))

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">🔀 Merge Topics</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Target selection */}
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
              Target topic (will be kept):
            </label>
            <select
              value={targetId}
              onChange={(e) => {
                setTargetId(e.target.value)
                const t = topics.find((x) => x.id === parseInt(e.target.value, 10))
                if (t) setNewTitle(t.title)
              }}
              style={{ width: '100%', padding: '0.5rem 0.75rem', background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px' }}
            >
              {topics.map((t) => (
                <option key={t.id} value={String(t.id)}>
                  {t.title}{t.is_confirmed ? ' ✓' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* New title */}
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
              Merged title:
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Enter merged topic title"
              style={{ width: '100%', padding: '0.5rem 0.75rem', background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'Inter, sans-serif' }}
            />
          </div>

          {/* Sources to be deleted */}
          {sourcesToDelete.length > 0 && (
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                These topics will be deleted:
              </label>
              <ul style={{ margin: 0, padding: '0 0 0 1.25rem', maxHeight: '120px', overflowY: 'auto' }}>
                {sourcesToDelete.map((t) => (
                  <li key={t.id} style={{ fontSize: '12px', color: 'var(--text-secondary)', padding: '0.2rem 0' }}>
                    {t.title}{t.is_completed ? ' ✅' : ''}{t.is_confirmed ? ' ✓' : ''}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {error && <div className="error-message" style={{ marginBottom: '0.75rem' }}>{error}</div>}

          <div className="modal-actions">
            <button type="button" className="secondary-btn" onClick={onClose} disabled={loading}>Cancel</button>
            <button
              type="submit"
              className="primary-btn"
              disabled={loading || selectedIds.length < 2}
              style={{ width: 'auto' }}
            >
              {loading ? 'Merging…' : `Merge ${selectedIds.length} Topics`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}