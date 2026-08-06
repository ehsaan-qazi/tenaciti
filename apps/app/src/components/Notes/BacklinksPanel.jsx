/**
 * BacklinksPanel — Shows notes that link to the current note.
 *
 * Props:
 * - backlinks: Array of {id, title, content?} for notes linking to current note
 * - onNavigate: (noteId) => void - Handler to navigate to linked note
 */

export default function BacklinksPanel({ backlinks, onNavigate }) {
  if (!backlinks || backlinks.length === 0) {
    return (
      <div className="notes-backlinks-panel">
        <span className="material-symbols-outlined backlinks-watermark">link</span>
        <h4>
          <span className="material-symbols-outlined">share</span>
          Backlinks (0)
        </h4>
        <p className="notes-backlinks-empty">
          No backlinks yet. Use <code style={{ 
            background: 'rgba(113, 42, 226, 0.1)', 
            padding: '2px 6px', 
            borderRadius: '4px',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '13px',
            color: 'var(--secondary)'
          }}>[[note title]]</code> in other notes to create connections.
        </p>
      </div>
    )
  }

  return (
    <div className="notes-backlinks-panel">
      <span className="material-symbols-outlined backlinks-watermark">link</span>
      <h4>
        <span className="material-symbols-outlined">share</span>
        Backlinks ({backlinks.length})
      </h4>
      <div className="notes-backlinks-list notes-custom-scroll">
        {backlinks.map((link, index) => (
          <div key={link.id}>
            <button
              className="notes-backlink-item"
              onClick={() => onNavigate(link.id)}
            >
              <div className="bl-header">
                <span className="bl-title">{link.title}</span>
                <span className="material-symbols-outlined bl-arrow">arrow_forward</span>
              </div>
              {link.content && (
                <p className="bl-snippet">
                  ...{(link.content || '').slice(0, 120)}...
                </p>
              )}
            </button>
            {index < backlinks.length - 1 && (
              <div className="notes-backlink-divider" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}