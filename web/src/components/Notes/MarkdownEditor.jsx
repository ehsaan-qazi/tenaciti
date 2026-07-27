/**
 * MarkdownEditor — Simple markdown editor with wikilink detection.
 *
 * Features:
 * - Textarea with markdown formatting toolbar
 * - Wikilink autocomplete ([[note title]] support)
 * - Auto-save with debounce
 * - Live preview toggle
 * - Sticky save/cancel buttons when dirty
 */
import { useState, useRef, useEffect, useMemo } from 'react'
import { apiFetch } from '../../api/client'

const WIKILINK_PATTERN = /\[\[([^\]]+)\]\]/g

export default function MarkdownEditor({
  note,
  onSave,
  onCancel,
  availableNotes = [], // For wikilink autocomplete
}) {
  const [content, setContent] = useState(note?.content || '')
  const [title, setTitle] = useState(note?.title || '')
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [wikilinkDropdown, setWikilinkDropdown] = useState({ open: false, query: '', position: { top: 0, left: 0 } })
  const textareaRef = useRef(null)
  const debounceRef = useRef(null)

  const isDirty = useMemo(() => {
    return content !== (note?.content || '') || title !== (note?.title || '')
  }, [content, title, note])

  // Auto-save on blur when dirty
  const handleSave = async () => {
    if (!isDirty || saving) return

    setSaving(true)
    try {
      const updated = await apiFetch(`/notes/${note.id}`, {
        method: 'PUT',
        body: JSON.stringify({ title, content }),
      })
      onSave(updated)
    } catch (err) {
      console.error('Save failed:', err)
    } finally {
      setSaving(false)
    }
  }

  // Handle wikilink autocomplete
  const handleTextChange = (e) => {
    const newContent = e.target.value
    setContent(newContent)

    // Check for [[ trigger
    const cursorPos = e.target.selectionStart
    const textBeforeCursor = newContent.slice(0, cursorPos)
    const lastBracket = textBeforeCursor.lastIndexOf('[')

    if (lastBracket !== -1 && textBeforeCursor[lastBracket + 1] === '[') {
      const query = textBeforeCursor.slice(lastBracket + 2)
      // Check if the previous character closes the link
      const nextChar = textBeforeCursor[lastBracket + 2 + query.length]
      if (!nextChar || (nextChar !== ']' && nextChar !== '[')) {
        const rect = getCaretPosition(textareaRef.current, cursorPos)
        setWikilinkDropdown({ open: true, query, position: rect })
        return
      }
    }
    setWikilinkDropdown({ open: false, query: '', position: { top: 0, left: 0 } })
  }

  const getCaretPosition = (element, position) => {
    // Simple approximation - use textarea rect
    const rect = element.getBoundingClientRect()
    return { top: rect.bottom, left: rect.left }
  }

  const insertWikilink = (noteTitle) => {
    const newContent = content + `[[${noteTitle}]]`
    setContent(newContent)
    setWikilinkDropdown({ open: false, query: '', position: { top: 0, left: 0 } })
    textareaRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setWikilinkDropdown({ open: false, query: '', position: { top: 0, left: 0 } })
    }
  }

  // Format buttons
  const applyFormat = (format) => {
    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = content.slice(start, end)
    let formatted, newCursorPos

    switch (format) {
      case 'bold':
        formatted = `**${selected}**`
        newCursorPos = start + 2
        break
      case 'italic':
        formatted = `*${selected}*`
        newCursorPos = start + 1
        break
      case 'link':
        formatted = `[${selected}](url)`
        newCursorPos = start + (selected ? selected.length + 3 : 1)
        break
      case 'code':
        formatted = `\`${selected}\``
        newCursorPos = start + 1
        break
      default:
        return
    }

    const newContent = content.slice(0, start) + formatted + content.slice(end)
    setContent(newContent)
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(newCursorPos, newCursorPos + (selected ? selected.length + 2 : 0))
    }, 0)
  }

  // Simple markdown preview renderer
  const renderPreview = (text) => {
    // Basic markdown to HTML - can be enhanced later
    return text
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/\[\[([^\]]+)\]\]/g, '<span class="wikilink">[[[$1]]]</span>')
      .replace(/\n/g, '<br>')
  }

  // Filtered notes for autocomplete
  const filteredNotes = wikilinkDropdown.open
    ? availableNotes.filter((n) => n.title.toLowerCase().includes(wikilinkDropdown.query.toLowerCase()))
    : []

  return (
    <div className="markdown-editor">
      {/* Title input */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Note title..."
        className="note-title-input"
        style={{
          width: '100%',
          padding: '0.75rem',
          fontSize: '1.25rem',
          fontWeight: 600,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-light)',
          borderRadius: '6px',
          marginBottom: '1rem',
          color: 'var(--text-primary)',
        }}
      />

      {/* Toolbar */}
      <div className="editor-toolbar" style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '0.5rem',
        padding: '0.5rem',
        background: 'var(--bg-surface)',
        borderRadius: '6px',
        border: '1px solid var(--border-light)',
      }}>
        <button type="button" onClick={() => applyFormat('bold')} title="Bold" className="secondary-btn">**</button>
        <button type="button" onClick={() => applyFormat('italic')} title="Italic" className="secondary-btn">*</button>
        <button type="button" onClick={() => applyFormat('link')} title="Link" className="secondary-btn">🔗</button>
        <button type="button" onClick={() => applyFormat('code')} title="Code" className="secondary-btn">`</button>
        <button type="button" onClick={() => setShowPreview(!showPreview)} className="secondary-btn">
          {showPreview ? '✏️ Edit' : '👁️ Preview'}
        </button>
      </div>

      {/* Editor / Preview */}
      <div style={{ position: 'relative' }}>
        {showPreview ? (
          <div
            className="markdown-preview"
            dangerouslySetInnerHTML={{ __html: renderPreview(content) }}
            style={{
              minHeight: '300px',
              padding: '1rem',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-light)',
              borderRadius: '6px',
              color: 'var(--text-primary)',
              overflow: 'auto',
            }}
          />
        ) : (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            placeholder="Start writing your note... Use [[note title]] for wikilinks"
            style={{
              width: '100%',
              minHeight: '300px',
              padding: '1rem',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-light)',
              borderRadius: '6px',
              color: 'var(--text-primary)',
              fontFamily: 'monospace',
              fontSize: '14px',
              resize: 'vertical',
            }}
          />
        )}

        {/* Wikilink autocomplete dropdown */}
        {wikilinkDropdown.open && (
          <div
            className="wikilink-dropdown"
            style={{
              position: 'absolute',
              top: wikilinkDropdown.position.top,
              left: wikilinkDropdown.position.left,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-light)',
              borderRadius: '6px',
              maxHeight: '200px',
              overflow: 'auto',
              zIndex: 100,
              minWidth: '200px',
            }}
          >
            {filteredNotes.length === 0 ? (
              <div style={{ padding: '0.5rem 1rem', color: 'var(--text-secondary)' }}>
                No notes found. Press Enter to create: "[[{wikilinkDropdown.query}]]"
              </div>
            ) : (
              filteredNotes.map((n) => (
                <button
                  key={n.id}
                  onClick={() => insertWikilink(n.title)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 1rem',
                    textAlign: 'left',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'var(--border-light)'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                  {n.title}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Action buttons when dirty */}
      {isDirty && (
        <div style={{
          position: 'sticky',
          bottom: 0,
          marginTop: '1rem',
          padding: '1rem',
          background: 'var(--bg-surface)',
          borderTop: '1px solid var(--border-light)',
          display: 'flex',
          gap: '0.5rem',
          justifyContent: 'flex-end',
        }}>
          <button onClick={onCancel} className="secondary-btn" disabled={saving}>
            Cancel
          </button>
          <button onClick={handleSave} className="primary-btn" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      )}
    </div>
  )
}