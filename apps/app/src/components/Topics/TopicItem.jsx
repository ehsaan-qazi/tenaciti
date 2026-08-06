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

  const isCompleted = topic.is_completed
  const isConfirmed = topic.is_confirmed
  const isUnconfirmed = !isConfirmed

  let wrapperStyle = {
    display: 'flex', flexDirection: 'column', backgroundColor: 'var(--surface-container-lowest)', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'all 0.2s', cursor: 'default', border: '1px solid transparent', position: 'relative'
  }
  if (isUnconfirmed) {
    wrapperStyle = { ...wrapperStyle, backgroundColor: 'rgba(225, 227, 228, 0.3)', border: '1px dashed var(--outline-variant)' }
  }
  if (isSelectedForMerge) {
    wrapperStyle = { ...wrapperStyle, borderLeft: '4px solid var(--secondary)' }
  }
  if (isDragging) {
    wrapperStyle = { ...wrapperStyle, opacity: 0.5, transform: 'scale(0.98)', zIndex: 50, boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }
  }

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, ...wrapperStyle, marginBottom: '12px' }}
      className={`group ${classNames}`}
      onClick={handleItemClick}
    >
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px', gap: '16px' }}>
        
        {/* Drag handle */}
        {!mergeMode && (
          <div
            {...attributes}
            {...listeners}
            title="Drag to reorder"
            onClick={(e) => e.stopPropagation()}
            style={{ flexShrink: 0, cursor: 'grab', color: 'var(--surface-variant)', display: 'flex', alignItems: 'center', paddingTop: '4px' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '24px', transition: 'color 0.2s' }}>drag_indicator</span>
          </div>
        )}

        {/* Completion checkbox / Merge select */}
        <div style={{ flexShrink: 0 }}>
          {mergeMode ? (
            <button onClick={handleMergeClick} style={{ width: '24px', height: '24px', borderRadius: '4px', border: isSelectedForMerge ? 'none' : '2px solid var(--outline)', backgroundColor: isSelectedForMerge ? 'var(--secondary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isSelectedForMerge ? 'var(--on-primary)' : 'transparent', cursor: 'pointer' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px', fontWeight: 'bold' }}>check</span>
            </button>
          ) : (
            <button onClick={handleCheckClick} disabled={!isConfirmed} style={{ width: '24px', height: '24px', borderRadius: '4px', border: (isCompleted || !isConfirmed) ? 'none' : '2px solid var(--outline)', backgroundColor: isCompleted ? 'var(--success)' : (!isConfirmed ? 'transparent' : 'transparent'), display: 'flex', alignItems: 'center', justifyContent: 'center', color: isCompleted ? 'var(--on-primary)' : 'transparent', cursor: isConfirmed ? 'pointer' : 'not-allowed', opacity: !isConfirmed ? 0.5 : 1, transition: 'all 0.2s' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px', fontWeight: 'bold' }}>check</span>
            </button>
          )}
        </div>

        {/* Content area */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '16px' }}>
          {editing ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }} onClick={(e) => e.stopPropagation()}>
              <input
                ref={inputRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{ flex: 1, padding: '8px 12px', fontSize: '16px', color: 'var(--on-surface)', backgroundColor: 'var(--surface-container-low)', border: 'none', borderRadius: '8px', outline: 'none' }}
              />
              <button onClick={handleSaveEdit} style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--success)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check</span></button>
              <button onClick={handleCancelEdit} style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--surface-container)', color: 'var(--on-surface)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span></button>
            </div>
          ) : (
            <>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: isUnconfirmed ? 'var(--on-surface-variant)' : 'var(--on-surface)', fontStyle: isUnconfirmed ? 'italic' : 'normal', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <span style={{ color: 'var(--on-surface-variant)', marginRight: '8px', fontWeight: '500' }}>{index + 1}.</span>
                {topic.title}
              </h3>
              
              <div style={{ display: 'none' }} className="md-flex items-center gap-2"></div>
              {/* Desktop badges */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {topic.linked_node_id && (
                  <span style={{ padding: '4px 8px', backgroundColor: 'var(--surface-container)', borderRadius: '6px', fontSize: '12px', fontWeight: '500', color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>link</span>
                    Linked
                  </span>
                )}
                {isUnconfirmed && (
                  <span style={{ padding: '4px 8px', backgroundColor: 'var(--surface-container)', borderRadius: '6px', fontSize: '12px', fontWeight: '500', color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>auto_awesome</span>
                    Suggested
                  </span>
                )}
                {isSelectedForMerge && (
                  <span style={{ padding: '4px 8px', backgroundColor: 'rgba(138, 76, 252, 0.2)', borderRadius: '6px', fontSize: '12px', fontWeight: '500', color: 'var(--secondary)' }}>
                    Selected for Merge
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {/* Action buttons */}
        {!mergeMode && !editing && (
          <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '8px', opacity: isUnconfirmed ? 1 : 0.6, transition: 'opacity 0.2s' }} className="hover-opacity-100">
            {isUnconfirmed ? (
              <>
                <button onClick={(e) => { e.stopPropagation(); onConfirm(topic.id, true) }} style={{ padding: '6px 12px', borderRadius: '8px', backgroundColor: 'var(--primary)', color: 'var(--on-primary)', fontSize: '14px', fontWeight: '500', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check</span> Confirm
                </button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(topic.id) }} style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--on-surface-variant)', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }} title="Discard">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
                </button>
              </>
            ) : (
              <>
                <button onClick={(e) => { e.stopPropagation(); onStartLinkNode(topic) }} style={{ padding: '6px 12px', borderRadius: '8px', backgroundColor: 'var(--surface-container)', color: 'var(--on-surface)', fontSize: '14px', fontWeight: '500', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_link</span> Link
                </button>
                <button onClick={handleStartEdit} style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--on-surface-variant)', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }} title="Edit">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                </button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(topic.id) }} style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--on-surface-variant)', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }} title="Delete">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
