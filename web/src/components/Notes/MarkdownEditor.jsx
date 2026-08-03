/**
 * MarkdownEditor — Glassmorphic markdown editor with wikilink detection.
 *
 * Features:
 * - Transparent title input with large heading font
 * - Glass toolbar with Material icon buttons
 * - Wikilink autocomplete ([[note title]] support)
 * - Auto-save with debounce
 * - Live preview toggle
 * - Save status indicator (green dot + "Saved" + word count)
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

  // Word count
  const wordCount = useMemo(() => {
    return content.trim() ? content.trim().split(/\s+/).length : 0
  }, [content])

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
      case 'underline':
        formatted = `<u>${selected}</u>`
        newCursorPos = start + 3
        break
      case 'bullet-list':
        formatted = `\n- ${selected}`
        newCursorPos = start + 3
        break
      case 'numbered-list':
        formatted = `\n1. ${selected}`
        newCursorPos = start + 4
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
      .replace(/\[\[([^\]]+)\]\]/g, '<span class="wikilink">[[$1]]</span>')
      .replace(/\n/g, '<br>')
  }

  // Filtered notes for autocomplete
  const filteredNotes = wikilinkDropdown.open
    ? availableNotes.filter((n) => n.title.toLowerCase().includes(wikilinkDropdown.query.toLowerCase()))
    : []

  return (
    <div className="notes-editor-container">
      {/* Title + Toolbar area */}
      <div className="notes-editor-title-area">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note Title..."
          className="notes-title-input"
        />

        {/* Toolbar */}
        <div className="notes-editor-toolbar">
          <div className="notes-toolbar-buttons">
            <button type="button" className="notes-toolbar-btn" onClick={() => applyFormat('bold')} title="Bold">
              <span className="material-symbols-outlined">format_bold</span>
            </button>
            <button type="button" className="notes-toolbar-btn" onClick={() => applyFormat('italic')} title="Italic">
              <span className="material-symbols-outlined">format_italic</span>
            </button>
            <button type="button" className="notes-toolbar-btn" onClick={() => applyFormat('underline')} title="Underline">
              <span className="material-symbols-outlined">format_underlined</span>
            </button>
            <div className="notes-toolbar-divider" />
            <button type="button" className="notes-toolbar-btn" onClick={() => applyFormat('bullet-list')} title="Bullet List">
              <span className="material-symbols-outlined">format_list_bulleted</span>
            </button>
            <button type="button" className="notes-toolbar-btn" onClick={() => applyFormat('numbered-list')} title="Numbered List">
              <span className="material-symbols-outlined">format_list_numbered</span>
            </button>
            <div className="notes-toolbar-divider" />
            <button type="button" className="notes-toolbar-btn" onClick={() => applyFormat('link')} title="Link">
              <span className="material-symbols-outlined">link</span>
            </button>
            <button type="button" className="notes-toolbar-btn" onClick={() => applyFormat('code')} title="Code">
              <span className="material-symbols-outlined">code</span>
            </button>
            <button type="button" className="notes-toolbar-btn" onClick={() => setShowPreview(!showPreview)} title={showPreview ? 'Edit' : 'Preview'}>
              <span className="material-symbols-outlined">{showPreview ? 'edit' : 'image'}</span>
            </button>
          </div>

          {/* Status indicator */}
          <div className="notes-editor-status">
            <span className={`status-dot ${isDirty ? 'unsaved' : ''}`} />
            <span>{saving ? 'Saving…' : isDirty ? 'Unsaved' : 'Saved'}</span>
            <span>•</span>
            <span>{wordCount} words</span>
          </div>
        </div>
      </div>

      {/* Editor / Preview */}
      <div className="notes-editor-content notes-custom-scroll" style={{ position: 'relative' }}>
        {showPreview ? (
          <div
            className="notes-markdown-preview"
            dangerouslySetInnerHTML={{ __html: renderPreview(content) }}
          />
        ) : (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            placeholder="Start writing your note... Use [[note title]] for wikilinks"
            className="notes-editor-textarea"
          />
        )}

        {/* Wikilink autocomplete dropdown */}
        {wikilinkDropdown.open && (
          <div className="notes-wikilink-dropdown">
            <div className="wl-header">Link to note</div>
            {filteredNotes.length === 0 ? (
              <div className="wl-empty">
                No notes found. Press Enter to create: "[[{wikilinkDropdown.query}]]"
              </div>
            ) : (
              filteredNotes.map((n) => (
                <button
                  key={n.id}
                  onClick={() => insertWikilink(n.title)}
                >
                  <span className="wl-title">{n.title}</span>
                  <span className="wl-path">Note #{n.id}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}