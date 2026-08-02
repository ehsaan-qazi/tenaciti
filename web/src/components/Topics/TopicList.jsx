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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', backgroundColor: 'var(--surface-container-lowest)', padding: '12px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {!mergeMode && (
            <>
              <button onClick={onAddTopic} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: 'var(--primary)', color: 'var(--on-primary)', borderRadius: '8px', fontSize: '14px', fontWeight: '500', border: 'none', cursor: 'pointer', transition: 'background-color 0.2s' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add</span>
                Add Topic
              </button>
              <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--surface-container-high)', margin: '0 8px' }}></div>
              {total > 0 && (
                <button onClick={() => setMergeMode(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: 'var(--surface-container)', color: 'var(--on-surface)', borderRadius: '8px', fontSize: '14px', fontWeight: '500', border: 'none', cursor: 'pointer', transition: 'background-color 0.2s' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>merge</span>
                  Merge Mode
                </button>
              )}
            </>
          )}
        </div>
        {!mergeMode && confirmed < total && total > 0 && (
          <button onClick={onConfirmAll} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: 'var(--surface-container)', color: 'var(--on-surface)', borderRadius: '8px', fontSize: '14px', fontWeight: '500', border: 'none', cursor: 'pointer', transition: 'background-color 0.2s' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>done_all</span>
            Confirm All
          </button>
        )}
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
        <div style={{ marginTop: '32px', padding: '24px', backgroundColor: 'var(--surface-container-lowest)', borderRadius: '24px', border: '1px solid var(--surface-container)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', opacity: 0.7 }}>
          <div style={{ width: '192px', height: '128px', marginBottom: '16px', backgroundColor: 'var(--surface-container-low)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--outline)' }}>account_tree</span>
          </div>
          <p style={{ fontSize: '20px', fontWeight: '600', color: 'var(--on-surface)', margin: '0 0 8px 0' }}>Build Your Knowledge Graph</p>
          <p style={{ fontSize: '16px', color: 'var(--on-surface-variant)', maxWidth: '400px', margin: '0 0 24px 0' }}>Drag and drop topics to reorganize. Connect topics to notes and assignments to create a cohesive study plan.</p>
          <button onClick={onAddTopic} style={{ padding: '12px 24px', backgroundColor: 'var(--primary)', color: 'var(--on-primary)', borderRadius: '12px', fontSize: '16px', fontWeight: '500', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add</span> Add Topic Manually
          </button>
        </div>
      ) : (
        <>
          {/* Active / In-Progress Topics */}
          {topics.filter(t => !t.is_completed).length > 0 && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={topics.filter(t => !t.is_completed).map((t) => t.id)} strategy={verticalListSortingStrategy}>
                {topics.filter(t => !t.is_completed).map((topic, idx) => (
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

          {/* Completed Topics Section */}
          {topics.filter(t => t.is_completed).length > 0 && (
            <div style={{ marginTop: '1.75rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: '0.75rem',
                paddingBottom: '0.4rem',
                borderBottom: '1px solid var(--border)',
              }}>
                <span>✅ Completed Topics ({topics.filter(t => t.is_completed).length})</span>
              </div>
              <div className="completed-topics-list">
                {topics.filter(t => t.is_completed).map((topic, idx) => (
                  <TopicItem
                    key={topic.id}
                    topic={topic}
                    index={topics.filter(t => !t.is_completed).length + idx}
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
              </div>
            </div>
          )}
        </>
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