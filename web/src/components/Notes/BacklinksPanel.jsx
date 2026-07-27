/**
 * BacklinksPanel — Shows notes that link to the current note.
 *
 * Props:
 * - backlinks: Array of {id, title} for notes linking to current note
 * - onNavigate: (noteId) => void - Handler to navigate to linked note
 */
import { Link } from 'react-router-dom'

export default function BacklinksPanel({ backlinks, onNavigate }) {
  if (!backlinks || backlinks.length === 0) {
    return (
      <div style={{
        padding: '0.75rem',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-light)',
        borderRadius: '6px',
        marginBottom: '1rem',
      }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '12px', margin: 0 }}>
          No backlinks yet. Use [[note title]] in other notes to create connections.
        </p>
      </div>
    )
  }

  return (
    <div style={{
      padding: '0.75rem',
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-light)',
      borderRadius: '6px',
      marginBottom: '1rem',
    }}>
      <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
        🔗 Backlinks ({backlinks.length})
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {backlinks.map((link) => (
          <button
            key={link.id}
            onClick={() => onNavigate(link.id)}
            style={{
              textAlign: 'left',
              background: 'transparent',
              border: 'none',
              color: 'var(--purple-light)',
              cursor: 'pointer',
              padding: '0.25rem 0',
              fontSize: '13px',
            }}
            onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
          >
            → {link.title}
          </button>
        ))}
      </div>
    </div>
  )
}