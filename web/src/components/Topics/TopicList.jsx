/**
 * TopicList — Full topic management UI.
 *
 * Responsibilities:
 * - Shows extraction-in-progress banner (polling)
 * - Progress bar (completed / total)
 * - Toolbar: Add Topic | Merge Mode | Confirm All
 * - Drag-and-drop reordering via @dnd-kit
 * - Merge selection mode with banner + TopicMergeModal
 * - Link-node dropdown panel (replaces prompt())
 * - Inline editing delegated to TopicItem
 * - Empty state
 */
import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import TopicItem from './TopicItem'
import TopicMergeModal from './TopicMergeModal'

export default function TopicList({
  topics,
  roadmapNodes,
  isExtracting,          // boolean — show extraction banner
  onReorder,
  onConfirm,
  onEdit,                // (topicId, newTitle) => void
  onDelete,
  onToggleComplete,
  onAddTopic,            // () => void — open add-topic flow
  onConfirmAll,          // () => void — confirm all unconfirmed
  mergeMode,
  setMergeMode,
  selectedForMerge,
  toggleMergeSelection,
  confirmMerge,          // (selectedIds, targetId, newTitle) => Promise
  cancelMerge,
}) {
  // Link-node panel state (local to TopicList)
  const [linkTopic, setLinkTopic] = useState(null) // topic being linked
  const [linkNodeId, setLinkNodeId] = useState('')

  // Merge modal state
  const [mergeModalOpen, setMergeModalOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // ── Drag-end handler ──
  const handleDragEnd = (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIdx = topics.findIndex((t) => t.id === active.id)
    const newIdx = topics.findIndex((t) => t.id === over.id)
    const newOrder = arrayMove(topics, oldIdx, newIdx)
    onReorder(newOrder.map((t) => t.id))
  }

  // ── Link-node panel ──
  const handleStartLinkNode = (topic) => {
    setLinkTopic(topic)
    setLinkNodeId(topic.linked_node_id ? String(topic.linked_node_id) : '')
  }

  const handleApplyLinkNode = () => {
    if (!linkTopic) return
    const nodeId = linkNodeId ? parseInt(linkNodeId, 10) : null
    onEdit(linkTopic.id, null, nodeId) // signal link-node change
    setLinkTopic(null)
  }

  const handleCancelLinkNode = () => {
    setLinkTopic(null)
  }

  // ── Merge Modal ──
  const handleOpenMergeModal = () => {
    if (selectedForMerge.length < 2) return
    setMergeModalOpen(true)
  }

  const handleMergeConfirm = async (targetId, newTitle) => {
    await confirmMerge(selectedForMerge, targetId, newTitle)
    setMergeModalOpen(false)
  }

  // Progress stats
  const total = topics.length
  const completed = topics.filter((t) => t.is_completed).length
  const confirmed = topics.filter((t) => t.is_confirmed).length
  const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="topic-list">
      {/* ── Extraction Banner ── */}
      {isExtracting && (
        <div className="topic-extraction-banner">
          <span className="spinner" />
          <span>Extracting topics from document… please wait</span>
        </div>
      )}

      {/* ── Progress Bar ── */}
      {total > 0 && (
        <>
          <div className="topic-progress-header">
            <span>Topic Progress</span>
            <span>{completed}/{total} completed · {confirmed} confirmed · {progressPct}%</span>
          </div>
          <div className="topic-progress-bar">
            <div className="topic-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </>
      )}

      {/* ── Toolbar ── */}
      <div className="topic-toolbar">
        <div className="topic-toolbar-left">
          <span className="topic-toolbar-title">
            {total} topic{total !== 1 ? 's' : ''}
          </span>
          {!mergeMode && (
            <>
              <button className="secondary-btn" style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '12px' }} onClick={onAddTopic}>
                ＋ Add
              </button>
              {total > 0 && (
                <button
                  className="secondary-btn"
                  style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '12px', color: 'var(--amber)' }}
                  onClick={() => setMergeMode(true)}
                >
                  🔀 Merge
                </button>
              )}
              {confirmed < total && total > 0 && (
                <button
                  className="secondary-btn"
                  style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '12px', color: 'var(--green)' }}
                  onClick={onConfirmAll}
                >
                  ✓ Confirm All
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Merge Mode Banner ── */}
      {mergeMode && (
        <div className="merge-banner">
          <div className="merge-banner-label">
            <span>🔀 Merge Mode — select topics to merge</span>
            {selectedForMerge.length > 0 && (
              <span className="merge-count-badge">{selectedForMerge.length}</span>
            )}
          </div>
          <div className="merge-actions">
            <button className="secondary-btn" style={{ width: 'auto', padding: '0.3rem 0.6rem', fontSize: '12px' }} onClick={cancelMerge}>
              Cancel
            </button>
            {selectedForMerge.length >= 2 && (
              <button className="primary-btn" style={{ width: 'auto', padding: '0.3rem 0.8rem', fontSize: '12px' }} onClick={handleOpenMergeModal}>
                Merge {selectedForMerge.length} Topics
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Link Node Panel ── */}
      {linkTopic && (
        <div className="link-node-banner">
          <span>Link <strong>{linkTopic.title}</strong> to roadmap node:</span>
          <select
            className="link-node-select"
            value={linkNodeId}
            onChange={(e) => setLinkNodeId(e.target.value)}
          >
            <option value="">— Unlink —</option>
            {roadmapNodes.map((n) => (
              <option key={n.id} value={String(n.id)}>
                {n.node_type}: {n.title}
              </option>
            ))}
          </select>
          <button
            className="primary-btn"
            style={{ width: 'auto', padding: '0.3rem 0.75rem', fontSize: '12px' }}
            onClick={handleApplyLinkNode}
          >
            Apply
          </button>
          <button
            className="secondary-btn"
            style={{ width: 'auto', padding: '0.3rem 0.6rem', fontSize: '12px' }}
            onClick={handleCancelLinkNode}
          >
            Cancel
          </button>
        </div>
      )}

      {/* ── Topic Items ── */}
      {topics.length === 0 ? (
        <div className="topic-empty">
          <div className="topic-empty-icon">📋</div>
          <p className="topic-empty-text">
            No topics yet. Upload lecture slides or a syllabus and use <strong>Extract Topics</strong> to get started. (Pro feature)
          </p>
          <button className="primary-btn" style={{ width: 'auto' }} onClick={onAddTopic}>
            ＋ Add Topic Manually
          </button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={topics.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            {topics.map((topic, idx) => (
              <TopicItem
                key={topic.id}
                topic={topic}
                index={idx}
                onEdit={onEdit}
                onConfirm={onConfirm}
                onDelete={onDelete}
                onToggleComplete={onToggleComplete}
                onStartLinkNode={handleStartLinkNode}
                mergeMode={mergeMode}
                isSelectedForMerge={selectedForMerge.includes(topic.id)}
                onToggleMergeSelect={toggleMergeSelection}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}

      {/* ── Merge Modal ── */}
      <TopicMergeModal
        isOpen={mergeModalOpen}
        onClose={() => setMergeModalOpen(false)}
        topics={topics.filter((t) => selectedForMerge.includes(t.id))}
        selectedIds={selectedForMerge}
        onConfirm={handleMergeConfirm}
      />
    </div>
  )
}