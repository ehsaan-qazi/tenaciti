/**
 * TopicItem — A single draggable, editable topic row for the Topics tab.
 *
 * Features:
 * - Drag-and-drop (via @dnd-kit/sortable)
 * - Checkbox to toggle completion
 * - Inline title editing (no prompt())
 * - Confirm / Unconfirm badge
 * - Linked roadmap node badge
 * - Confidence rating badge when completed
 * - Merge selection mode
 * - All action buttons: edit, confirm, link, merge-select, delete
 */
import { useState, useRef, useEffect } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export default function TopicItem({
  topic,
  index,
  onEdit,
  onConfirm,
  onDelete,
  onToggleComplete,
  onStartLinkNode,
  mergeMode,
  isSelectedForMerge,
  onToggleMergeSelect,
}) {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(topic.title)
  const inputRef = useRef(null)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: topic.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  // Focus input when entering edit mode
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  const handleStartEdit = (e) => {
    e.stopPropagation()
    setEditValue(topic.title)
    setEditing(true)
  }

  const handleSaveEdit = (e) => {
    e?.stopPropagation()
    const trimmed = editValue.trim()
    if (trimmed && trimmed !== topic.title) {
      onEdit(topic.id, trimmed)
    }
    setEditing(false)
  }

  const handleCancelEdit = (e) => {
    e?.stopPropagation()
    setEditValue(topic.title)
    setEditing(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSaveEdit()
    if (e.key === 'Escape') handleCancelEdit()
  }

  const handleCheckClick = (e) => {
    e.stopPropagation()
    if (mergeMode) return
    onToggleComplete(topic.id, !topic.is_completed)
  }

  const handleMergeClick = (e) => {
    e.stopPropagation()
    onToggleMergeSelect(topic.id)
  }

  const handleItemClick = () => {
    if (mergeMode) onToggleMergeSelect(topic.id)
  }

  const classNames = [
    'topic-item',
    topic.is_completed ? 'completed' : '',
    topic.is_confirmed ? 'confirmed' : '',
    mergeMode ? 'merge-selectable' : '',
    isSelectedForMerge ? 'selected-for-merge' : '',
    isDragging ? 'dragging' : '',
  ].filter(Boolean).join(' ')

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={classNames}
      onClick={handleItemClick}
    >
      {/* Drag handle — only active when not in merge mode */}
      <div
        className="drag-handle"
        {...(mergeMode ? {} : attributes)}
        {...(mergeMode ? {} : listeners)}
        title={mergeMode ? '' : 'Drag to reorder'}
        onClick={(e) => e.stopPropagation()}
      >
        ⋮⋮
      </div>

      {/* Completion checkbox OR merge select checkbox */}
      {mergeMode ? (
        <div className="topic-merge-check" onClick={handleMergeClick}>
          <div className={`topic-merge-check-visual ${isSelectedForMerge ? 'selected' : ''}`}>
            {isSelectedForMerge ? '✓' : ''}
          </div>
        </div>
      ) : (
        <div className="topic-check-area" onClick={handleCheckClick}>
          <div className={`topic-check-visual ${topic.is_completed ? 'checked' : ''}`}>
            {topic.is_completed ? '✓' : ''}
          </div>
        </div>
      )}

      {/* Content area: title (or inline edit) + badges */}
      <div className="topic-content-area">
        <div className="topic-content-main">
          <span className="topic-index">{index + 1}.</span>

          {editing ? (
            <div className="topic-inline-edit" onClick={(e) => e.stopPropagation()}>
              <input
                ref={inputRef}
                className="topic-inline-input"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button className="topic-inline-save" onClick={handleSaveEdit} title="Save">✓</button>
              <button className="topic-inline-cancel" onClick={handleCancelEdit} title="Cancel">✕</button>
            </div>
          ) : (
            <span className="topic-title-text" title={topic.title}>
              {topic.title}
            </span>
          )}

          {/* Badges */}
          <div className="topic-badges">
            {topic.is_confirmed && (
              <span className="badge-confirmed" title="Confirmed">✓</span>
            )}
            {topic.linked_node_id && (
              <span className="badge-linked" title={`Linked to roadmap node #${topic.linked_node_id}`}>🔗</span>
            )}
            {topic.is_completed && topic.confidence_rating && (
              <span className="badge-confidence" title={`Confidence: ${topic.confidence_rating}/5`}>
                {'⭐'.repeat(topic.confidence_rating)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      {!mergeMode && (
        <div className="topic-actions" onClick={(e) => e.stopPropagation()}>
          {!editing && (
            <button
              className="topic-action-btn"
              onClick={handleStartEdit}
              title="Edit title"
            >
              ✏️
            </button>
          )}
          <button
            className="topic-action-btn confirm-btn"
            onClick={(e) => { e.stopPropagation(); onConfirm(topic.id, !topic.is_confirmed) }}
            title={topic.is_confirmed ? 'Unconfirm' : 'Confirm topic'}
          >
            {topic.is_confirmed ? '↩️' : '✓'}
          </button>
          <button
            className="topic-action-btn link-btn"
            onClick={(e) => { e.stopPropagation(); onStartLinkNode(topic) }}
            title="Link to roadmap node"
          >
            🔗
          </button>
          <button
            className="topic-action-btn danger"
            onClick={(e) => { e.stopPropagation(); onDelete(topic.id) }}
            title="Delete topic"
          >
            🗑️
          </button>
        </div>
      )}
    </div>
  )
}
