/**
 * CoursePage — Individual course view with tabs:
 *   Overview | Documents | Roadmap | Topics
 *
 * Phase 3 features:
 * - Upload accepts PDF + PPTX
 * - Topic extraction (Pro) with polling banner
 * - Topics tab: drag-drop, inline edit, confirm, merge modal, link-node panel
 * - Confidence rating modal on topic completion
 * - Progress bars for both roadmap and topics in Overview
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiFetch, supabase } from '../api/client'
import TopicList from '../components/Topics/TopicList'
import ConfidenceModal from '../components/Topics/ConfidenceModal'

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function toDateInputValue(iso) {
  if (!iso) return ''
  return String(iso).slice(0, 10)
}

const NODE_TYPES = ['Assignment', 'Quiz', 'Exam', 'Project', 'Lab', 'Other']

const ALLOWED_UPLOAD_TYPES = {
  'application/pdf': true,
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': true,
  'application/vnd.ms-powerpoint': true,
}
const ALLOWED_UPLOAD_EXT = '.pdf,.pptx,.ppt'

// ── Self-Assessment Modal ─────────────────────────────────────────────────────

function SelfAssessmentModal({ node, onSubmit, onClose }) {
  const [form, setForm] = useState({
    actual_hours: '',
    quality_self_rating: 5,
    mood_energy: 3,
    reflection_note: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: name === 'actual_hours' ? parseFloat(value) || '' : parseInt(value) || value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await onSubmit(form)
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h2 className="modal-title">📝 Submit Assessment</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Assessment: {node.title}</label>
          </div>
          <div className="form-group">
            <label>Type: {node.node_type}</label>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Actual Hours Spent</label>
              <input
                type="number"
                step="0.5"
                min="0"
                name="actual_hours"
                value={form.actual_hours}
                onChange={handleChange}
                placeholder="e.g. 3.5"
                style={{ width: '100%', padding: '0.5rem', background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: '6px', color: 'var(--text-primary)' }}
              />
            </div>
            <div className="form-group">
              <label>Quality Self-Rating (1-5) *</label>
              <select name="quality_self_rating" value={form.quality_self_rating} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem', background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: '6px', color: 'var(--text-primary)' }}>
                <option value={5}>5 - Excellent</option>
                <option value={4}>4 - Good</option>
                <option value={3}>3 - Average</option>
                <option value={2}>2 - Below Average</option>
                <option value={1}>1 - Poor</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Mood/Energy (1-5)</label>
              <select name="mood_energy" value={form.mood_energy} onChange={handleChange} style={{ width: '100%', padding: '0.5rem', background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: '6px', color: 'var(--text-primary)' }}>
                <option value={5}>5 - Energized</option>
                <option value={4}>4 - Good</option>
                <option value={3}>3 - Neutral</option>
                <option value={2}>2 - Tired</option>
                <option value={1}>1 - Exhausted</option>
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Reflection Note (optional)</label>
              <textarea
                name="reflection_note"
                value={form.reflection_note}
                onChange={handleChange}
                rows={3}
                placeholder="What went well? What would you do differently? Any insights..."
                style={{ width: '100%', padding: '0.5rem', background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: '6px', color: 'var(--text-primary)', fontFamily: 'inherit', resize: 'vertical' }}
              />
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="secondary-btn" onClick={onClose} disabled={submitting}>Cancel</button>
            <button type="submit" className="primary-btn" disabled={submitting} style={{ width: 'auto' }}>
              {submitting ? 'Submitting…' : 'Submit & Log Self-Assessment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Add Topic Modal ───────────────────────────────────────────────────────────

function AddTopicModal({ courseId, onAdded, onClose }) {
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    setError('')
    try {
      await apiFetch(`/topics/courses/${courseId}`, {
        method: 'POST',
        body: JSON.stringify({ title: title.trim(), order_index: 0 }),
      })
      onAdded()
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to create topic')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">＋ Add Topic</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
              Topic title
            </label>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Introduction to Machine Learning"
              style={{ width: '100%', padding: '0.5rem 0.75rem', background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'Inter, sans-serif' }}
            />
          </div>
          {error && <div className="error-message" style={{ marginBottom: '0.75rem' }}>{error}</div>}
          <div className="modal-actions">
            <button type="button" className="secondary-btn" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="primary-btn" disabled={loading || !title.trim()} style={{ width: 'auto' }}>
              {loading ? 'Adding…' : 'Add Topic'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function CoursePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  // ── Data state ──
  const [course, setCourse] = useState(null)
  const [documents, setDocuments] = useState([])
  const [topics, setTopics] = useState([])
  const [roadmap, setRoadmap] = useState([])
  const [loading, setLoading] = useState(true)
  const [limits, setLimits] = useState(null)

  // ── Tab state ──
  const [activeTab, setActiveTab] = useState('overview')

  // ── Notes state ──
  const [notes, setNotes] = useState([])
  const [notesLoading, setNotesLoading] = useState(false)

  // ── Upload state ──
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

  // ── Roadmap extraction state ──
  const [extracting, setExtracting] = useState(null) // document ID
  const [polling, setPolling] = useState(false)

  // ── Roadmap edit state ──
  const [editingId, setEditingId] = useState(null)
  const [draft, setDraft] = useState({ title: '', node_type: 'Other', deadline: '', weight_percent: '' })

  // ── Topic extraction state ──
  const [topicExtracting, setTopicExtracting] = useState(null) // document ID
  const [topicPolling, setTopicPolling] = useState(false)

  // ── Topic UI state ──
  const [mergeMode, setMergeMode] = useState(false)
  const [selectedForMerge, setSelectedForMerge] = useState([])
  const [addTopicOpen, setAddTopicOpen] = useState(false)

  // ── Confidence modal state ──
  const [confidencePending, setConfidencePending] = useState(null) // { topicId, isCompleted }

  // ── Self-Assessment state ──
  const [submitModalOpen, setSubmitModalOpen] = useState(false)
  const [submittingNode, setSubmittingNode] = useState(null)
  const [submitForm, setSubmitForm] = useState({
    quality_self_rating: 3,
    mood_energy: 3,
    actual_hours: '',
    reflection_note: '',
  })
  const [submitLoading, setSubmitLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [gapData, setGapData] = useState({}) // { nodeId: SubmissionGapResponse }

  // ── Self-Assessment handlers ───────────────────────────────────────────────

  const openSubmitModal = (node) => {
    setSubmittingNode(node)
    setSubmitModalOpen(true)
    setSubmitError('')
  }

  const handleNodeSubmit = async (formData) => {
    if (!submittingNode) return
    try {
      await apiFetch(`/self-assessment/nodes/${submittingNode.id}/submit`, {
        method: 'POST',
        body: JSON.stringify(formData),
      })
      // Refresh roadmap to show new status
      await fetchRoadmap()
      // Fetch gap data for the submitted node
      try {
        const gap = await apiFetch(`/self-assessment/nodes/${submittingNode.id}/gap`)
        setGapData(prev => ({ ...prev, [submittingNode.id]: gap }))
      } catch { /* gap data is optional */ }
      setSubmitModalOpen(false)
      setSubmittingNode(null)
    } catch (err) {
      throw err // Let the modal handle the error display
    }
  }

  // Fetch gap data for all submitted/graded nodes on load
  const fetchGapData = useCallback(async (nodes) => {
    const submitted = nodes.filter(n => n.status === 'Submitted' || n.status === 'Graded')
    if (!submitted.length) return
    const gaps = {}
    await Promise.all(
      submitted.map(async (node) => {
        try {
          const gap = await apiFetch(`/self-assessment/nodes/${node.id}/gap`)
          gaps[node.id] = gap
        } catch { /* ignore missing assessments */ }
      })
    )
    setGapData(prev => ({ ...prev, ...gaps }))
  }, [])

  // ── Data fetchers ──────────────────────────────────────────────────────────

  const fetchCourse = useCallback(async () => {
    try {
      const data = await apiFetch(`/courses/${id}`)
      setCourse(data)
    } catch {
      navigate('/')
    }
  }, [id, navigate])

  const fetchDocuments = useCallback(async () => {
    try {
      const data = await apiFetch(`/documents/courses/${id}`)
      setDocuments(data)
    } catch (err) {
      console.error('Failed to fetch documents:', err)
    }
  }, [id])

  const fetchTopics = useCallback(async () => {
    try {
      const data = await apiFetch(`/topics/courses/${id}`)
      setTopics(data)
    } catch (err) {
      console.error('Failed to fetch topics:', err)
    }
  }, [id])

  const fetchRoadmap = useCallback(async () => {
    try {
      const data = await apiFetch(`/roadmap-nodes/courses/${id}`)
      setRoadmap(data)
    } catch (err) {
      console.error('Failed to fetch roadmap:', err)
    }
  }, [id])

  const fetchLimits = useCallback(async () => {
    try {
      const data = await apiFetch('/billing/limits')
      setLimits(data)
    } catch (err) {
      console.error('Failed to fetch limits:', err)
    }
  }, [])

  const fetchNotes = useCallback(async () => {
    setNotesLoading(true)
    try {
      const data = await apiFetch(`/notes/courses/${id}`)
      setNotes(data)
    } catch (err) {
      console.error('Failed to fetch notes:', err)
    } finally {
      setNotesLoading(false)
    }
  }, [id])

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true)
      const [,, , roadmapData] = await Promise.all([fetchCourse(), fetchDocuments(), fetchTopics(), fetchRoadmap(), fetchLimits(), fetchNotes()])
      setLoading(false)
    }
    loadAll()
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch gap data whenever roadmap changes (for submitted/graded nodes)
  useEffect(() => {
    if (roadmap.length > 0) {
      fetchGapData(roadmap)
    }
  }, [roadmap]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Upload ────────────────────────────────────────────────────────────────

  const handleFileUpload = async (file) => {
    if (!file) return

    if (!ALLOWED_UPLOAD_TYPES[file.type]) {
      setUploadError('Only PDF and PPTX files are supported')
      return
    }

    setUploading(true)
    setUploadError('')
    setUploadSuccess('')

    try {
      // Pick doc_type based on MIME
      const isSlides =
        file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
        file.type === 'application/vnd.ms-powerpoint'
      const docType = isSlides ? 'slides' : 'syllabus'

      const formData = new FormData()
      formData.append('file', file)
      formData.append('doc_type', docType)

      await apiFetch(`/documents/courses/${id}/upload`, {
        method: 'POST',
        body: formData,
      })

      setUploadSuccess(`"${file.name}" uploaded successfully!`)
      await fetchDocuments()
      await fetchCourse()
    } catch (err) {
      setUploadError(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleFileDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFileUpload(e.dataTransfer.files[0])
  }

  const handleFileSelect = (e) => {
    handleFileUpload(e.target.files[0])
  }

  // ── Roadmap extraction ────────────────────────────────────────────────────

  const pollExtraction = async (documentId) => {
    setPolling(true)
    try {
      for (let i = 0; i < 40; i++) {
        const st = await apiFetch(`/documents/${documentId}/extraction-status`)
        if (st.status === 'processed' || st.status === 'failed') {
          if (st.status === 'failed') setUploadError(st.error_message || 'Extraction failed')
          return st
        }
        await new Promise((r) => setTimeout(r, 1500))
      }
    } finally {
      setPolling(false)
    }
  }

  const handleExtractRoadmap = async (documentId) => {
    setExtracting(documentId)
    setUploadError('')
    try {
      await apiFetch(`/documents/${documentId}/extract-roadmap`, { method: 'POST' })
      await pollExtraction(documentId)
      await fetchRoadmap()
      await fetchDocuments()
      setActiveTab('roadmap')
    } catch (err) {
      setUploadError(err.message || 'Roadmap extraction failed')
    } finally {
      setExtracting(null)
    }
  }

  // ── Topic extraction ──────────────────────────────────────────────────────

  const pollTopicExtraction = async (documentId) => {
    setTopicPolling(true)
    try {
      for (let i = 0; i < 40; i++) {
        const st = await apiFetch(`/documents/${documentId}/topic-extraction-status`)
        if (st.status === 'processed' || st.status === 'failed') {
          if (st.status === 'failed') setUploadError(st.error_message || 'Topic extraction failed')
          return st
        }
        await new Promise((r) => setTimeout(r, 1500))
      }
    } catch (err) {
      console.error('Topic polling error:', err)
    } finally {
      setTopicPolling(false)
    }
  }

  const handleExtractTopics = async (documentId) => {
    setTopicExtracting(documentId)
    setUploadError('')
    try {
      await apiFetch(`/documents/${documentId}/extract`, { method: 'POST' })
      await pollTopicExtraction(documentId)
      await fetchTopics()
      await fetchDocuments()
      setActiveTab('topics')
    } catch (err) {
      setUploadError(err.message || 'Topic extraction failed')
    } finally {
      setTopicExtracting(null)
    }
  }

  // ── Topic management ──────────────────────────────────────────────────────

  const handleReorder = async (topicIds) => {
    try {
      await apiFetch('/topics/bulk-reorder', {
        method: 'POST',
        body: JSON.stringify({ topic_ids: topicIds }),
      })
      await fetchTopics()
    } catch (err) {
      setUploadError(err.message || 'Reorder failed')
    }
  }

  const handleConfirmTopic = async (topicId, isConfirmed) => {
    try {
      await apiFetch(`/topics/${topicId}/confirm`, {
        method: 'POST',
        body: JSON.stringify({ is_confirmed: isConfirmed }),
      })
      await fetchTopics()
    } catch (err) {
      setUploadError(err.message || 'Confirm failed')
    }
  }

  const handleConfirmAllTopics = async () => {
    const unconfirmed = topics.filter((t) => !t.is_confirmed)
    if (!unconfirmed.length) return
    try {
      await Promise.all(
        unconfirmed.map((t) =>
          apiFetch(`/topics/${t.id}/confirm`, {
            method: 'POST',
            body: JSON.stringify({ is_confirmed: true }),
          })
        )
      )
      await fetchTopics()
    } catch (err) {
      setUploadError(err.message || 'Confirm all failed')
    }
  }

  const handleDeleteTopic = async (topicId) => {
    if (!confirm('Delete this topic?')) return
    try {
      await apiFetch(`/topics/${topicId}`, { method: 'DELETE' })
      await fetchTopics()
    } catch (err) {
      setUploadError(err.message || 'Delete failed')
    }
  }

  /**
   * Unified edit handler called by TopicItem.
   * - If newTitle is provided → update title
   * - If linkedNodeId is provided (or null) → update link
   */
  const handleEditTopic = async (topicId, newTitle, linkedNodeId) => {
    try {
      if (newTitle !== null && newTitle !== undefined) {
        // Title edit
        await apiFetch(`/topics/${topicId}`, {
          method: 'PUT',
          body: JSON.stringify({ title: newTitle }),
        })
      } else if (linkedNodeId !== undefined) {
        // Link-node edit
        await apiFetch(`/topics/${topicId}/link-node`, {
          method: 'PATCH',
          body: JSON.stringify({ linked_node_id: linkedNodeId }),
        })
      }
      await fetchTopics()
    } catch (err) {
      setUploadError(err.message || 'Update failed')
    }
  }

  // ── Toggle completion with confidence modal ───────────────────────────────

  const handleToggleComplete = async (topicId, isCompleted) => {
    if (isCompleted) {
      // Show confidence modal before saving
      setConfidencePending({ topicId, isCompleted })
    } else {
      // Uncomplete immediately, no modal
      try {
        await apiFetch(`/topics/${topicId}/toggle`, {
          method: 'PATCH',
          body: JSON.stringify({ is_completed: false }),
        })
        await fetchTopics()
      } catch (err) {
        console.error('Toggle failed:', err)
      }
    }
  }

  const handleConfidenceConfirm = async (confidenceRating) => {
    if (!confidencePending) return
    const { topicId, isCompleted } = confidencePending
    setConfidencePending(null)
    try {
      await apiFetch(`/topics/${topicId}/toggle`, {
        method: 'PATCH',
        body: JSON.stringify({ is_completed: isCompleted, confidence_rating: confidenceRating }),
      })
      await fetchTopics()
    } catch (err) {
      console.error('Toggle with confidence failed:', err)
    }
  }

  const handleConfidenceSkip = async () => {
    if (!confidencePending) return
    const { topicId, isCompleted } = confidencePending
    setConfidencePending(null)
    try {
      await apiFetch(`/topics/${topicId}/toggle`, {
        method: 'PATCH',
        body: JSON.stringify({ is_completed: isCompleted }),
      })
      await fetchTopics()
    } catch (err) {
      console.error('Toggle failed:', err)
    }
  }

  // ── Merge ─────────────────────────────────────────────────────────────────

  const toggleMergeSelection = (topicId) => {
    setSelectedForMerge((prev) =>
      prev.includes(topicId) ? prev.filter((id) => id !== topicId) : [...prev, topicId]
    )
  }

  const handleConfirmMerge = async (targetId, newTitle) => {
    await apiFetch('/topics/merge', {
      method: 'POST',
      body: JSON.stringify({
        source_ids: selectedForMerge,
        target_id: targetId,
        new_title: newTitle || undefined,
      }),
    })
    setMergeMode(false)
    setSelectedForMerge([])
    await fetchTopics()
  }

  const handleCancelMerge = () => {
    setMergeMode(false)
    setSelectedForMerge([])
  }


  // ── Roadmap node actions ───────────────────────────────────────────────────

  const handleConfirmNode = async (nodeId) => {
    try {
      await apiFetch(`/roadmap-nodes/${nodeId}/confirm`, { method: 'POST' })
      await fetchRoadmap()
    } catch (err) {
      console.error('Confirm failed:', err)
    }
  }

  const handleDeleteNode = async (nodeId) => {
    try {
      await apiFetch(`/roadmap-nodes/${nodeId}`, { method: 'DELETE' })
      await fetchRoadmap()
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  const startEdit = (node) => {
    setEditingId(node.id)
    setDraft({
      title: node.title,
      node_type: node.node_type,
      deadline: toDateInputValue(node.deadline),
      weight_percent: node.weight_percent ?? '',
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setDraft({ title: '', node_type: 'Other', deadline: '', weight_percent: '' })
  }

  const saveEdit = async (nodeId) => {
    try {
      const patch = {
        title: draft.title.trim(),
        node_type: draft.node_type,
        deadline: draft.deadline || null,
        weight_percent: draft.weight_percent === '' ? null : parseFloat(draft.weight_percent),
      }
      await apiFetch(`/roadmap-nodes/${nodeId}`, { method: 'PUT', body: JSON.stringify(patch) })
      setEditingId(null)
      await fetchRoadmap()
    } catch (err) {
      setUploadError(err.message || 'Failed to save node')
    }
  }

  // ── Document delete ───────────────────────────────────────────────────────

  const handleDeleteDocument = async (docId) => {
    try {
      await apiFetch(`/documents/${docId}`, { method: 'DELETE' })
      await fetchDocuments()
      await fetchCourse()
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) return <div className="loading-screen">Loading course…</div>
  if (!course) return <div className="loading-screen">Course not found</div>

  const confirmedCount = roadmap.filter((n) => n.is_confirmed).length
  const roadmapProgress = roadmap.length > 0 ? Math.round((confirmedCount / roadmap.length) * 100) : 0
  const completedTopics = topics.filter((t) => t.is_completed).length
  const topicProgress = topics.length > 0 ? Math.round((completedTopics / topics.length) * 100) : 0

  const totalItems = roadmap.length + topics.length;
  const completedItems = confirmedCount + completedTopics;
  const courseProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const progressDasharray = `${courseProgress}, 100`;

  const pendingTopic = confidencePending
    ? topics.find((t) => t.id === confidencePending.topicId)
    : null

  return (
    <div className="page-container">
      {/* ── Confidence Rating Modal ── */}
      {confidencePending && pendingTopic && (
        <ConfidenceModal
          topicTitle={pendingTopic.title}
          onConfirm={handleConfidenceConfirm}
          onSkip={handleConfidenceSkip}
        />
      )}

      {/* ── Add Topic Modal ── */}
      {addTopicOpen && (
        <AddTopicModal
          courseId={id}
          onAdded={fetchTopics}
          onClose={() => setAddTopicOpen(false)}
        />
      )}

      {/* ── Course Header ── */}
      <div style={{ position: 'relative', overflow: 'hidden', backgroundColor: 'var(--surface)', padding: '24px', borderRadius: '24px', marginBottom: '24px', border: '1px solid var(--surface-container-high)', flexShrink: 0 }}>
        {/* Ambient Background Elements */}
        <div style={{ position: 'absolute', top: 0, right: 0, width: '300px', height: '300px', background: 'radial-gradient(circle, var(--gradient-start) 0%, transparent 70%)', opacity: 0.1, borderRadius: '50%', transform: 'translate(30%, -30%)', pointerEvents: 'none' }}></div>
        <div style={{ position: 'absolute', bottom: 0, left: '25%', width: '250px', height: '250px', background: 'radial-gradient(circle, var(--gradient-end) 0%, transparent 70%)', opacity: 0.1, borderRadius: '50%', transform: 'translateY(50%)', pointerEvents: 'none' }}></div>
        
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>
            {/* Title Section */}
            <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '800px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_back</span>
                </button>
                {course.code && <span style={{ padding: '4px 12px', backgroundColor: 'var(--surface-container-high)', borderRadius: '9999px', fontSize: '12px', fontWeight: '500', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{course.code}</span>}
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--success)' }}></span>
                <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--on-surface-variant)' }}>{course.semester} {course.academic_year}</span>
              </div>
              <h1 style={{ fontSize: '32px', fontWeight: '700', color: 'var(--on-surface)', margin: '0 0 16px 0', lineHeight: 1.2, letterSpacing: '-0.02em' }}>{course.name}</h1>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', color: 'var(--on-surface-variant)', fontSize: '14px' }}>
                {course.credit_hours && <span>🎓 {course.credit_hours} credits</span>}
                <span>📄 {course.doc_upload_count} / {limits?.upload_limit_per_course || (user?.plan === 'pro' ? 20 : 3)} documents</span>
              </div>
            </div>

            {/* Progress Section */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '16px', minWidth: '200px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', width: '100%' }}>
                <button style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--surface-container)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--on-surface-variant)', cursor: 'pointer', transition: 'all 0.2s' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>share</span>
                </button>
                <button style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--surface-container)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--on-surface-variant)', cursor: 'pointer', transition: 'all 0.2s' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>more_vert</span>
                </button>
              </div>
              <div style={{ padding: '16px', backgroundColor: 'var(--surface-container-lowest)', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>
                <div style={{ position: 'relative', width: '48px', height: '48px', flexShrink: 0 }}>
                  <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--surface-container-high)" strokeWidth="3" />
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--gradient-start)" strokeDasharray={progressDasharray} strokeWidth="3" style={{ transition: 'stroke-dasharray 1s ease-out' }} />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600', color: 'var(--on-surface)' }}>{courseProgress}%</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>Course Progress</span>
                  <span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--on-surface)' }}>{courseProgress > 80 ? 'On Track' : (courseProgress > 30 ? 'In Progress' : 'Getting Started')}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* ── Tabs ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px', borderBottom: '1px solid var(--surface-container-high)', overflowX: 'auto', paddingBottom: '2px' }}>
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'topics', label: `Topics (${topics.length})` },
              { id: 'documents', label: `Documents (${documents.length})` },
              { id: 'roadmap', label: `Roadmap (${roadmap.length})` },
              { id: 'notes', label: `Notes (${notes.length})` },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '0 4px 12px 4px',
                    fontSize: '16px',
                    fontWeight: isActive ? '600' : '400',
                    color: isActive ? 'var(--primary)' : 'var(--on-surface-variant)',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    position: 'relative',
                    whiteSpace: 'nowrap',
                    transition: 'color 0.2s'
                  }}
                >
                  {tab.label}
                  {isActive && (
                    <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '2px', backgroundColor: 'var(--primary)', borderRadius: '2px 2px 0 0' }}></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {uploadError && <div className="error-message" style={{ marginTop: '1rem' }}>{uploadError}</div>}
      {uploadSuccess && <div className="success-message" style={{ marginTop: '1rem' }}>✅ {uploadSuccess}</div>}

      {/* ═══════════════ OVERVIEW ═══════════════ */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', position: 'relative', zIndex: 10 }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', gridColumn: '1 / span 2' }}>
            {/* Progress Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
              
              {/* Roadmap Card */}
              <div style={{ backgroundColor: 'var(--surface-container-lowest)', borderRadius: '24px', padding: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', position: 'relative', overflow: 'hidden', cursor: 'pointer' }} onClick={() => setActiveTab('roadmap')}>
                <div style={{ position: 'absolute', top: 0, right: 0, width: '128px', height: '128px', background: 'linear-gradient(to bottom right, rgba(34,197,94,0.1), transparent)', borderBottomLeftRadius: '9999px', pointerEvents: 'none', transition: 'transform 0.3s' }}></div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
                      <span className="material-symbols-outlined">map</span>
                    </div>
                    <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: 'var(--on-surface)' }}>Roadmap</h3>
                  </div>
                  <span style={{ fontSize: '32px', fontWeight: '700', color: 'var(--success)', letterSpacing: '-0.02em' }}>{roadmapProgress}%</span>
                </div>
                <p style={{ margin: '0 0 8px 0', fontSize: '16px', color: 'var(--on-surface-variant)' }}>Confirmation Progress ({confirmedCount}/{roadmap.length})</p>
                <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--surface-variant)', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', backgroundColor: 'var(--success)', borderRadius: '9999px', width: `${roadmapProgress}%`, transition: 'width 1s ease-out' }}></div>
                </div>
                {roadmap.length === 0 && <p style={{ margin: '12px 0 0 0', fontSize: '12px', color: 'var(--on-surface-variant)' }}>Upload a syllabus to track assessments.</p>}
              </div>

              {/* Topics Card */}
              <div style={{ backgroundColor: 'var(--surface-container-lowest)', borderRadius: '24px', padding: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', position: 'relative', overflow: 'hidden', cursor: 'pointer' }} onClick={() => setActiveTab('topics')}>
                <div style={{ position: 'absolute', top: 0, right: 0, width: '128px', height: '128px', background: 'linear-gradient(to bottom right, rgba(124,58,237,0.1), transparent)', borderBottomLeftRadius: '9999px', pointerEvents: 'none', transition: 'transform 0.3s' }}></div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gradient-start)' }}>
                      <span className="material-symbols-outlined">school</span>
                    </div>
                    <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: 'var(--on-surface)' }}>Topics</h3>
                  </div>
                  <span style={{ fontSize: '32px', fontWeight: '700', color: 'var(--gradient-start)', letterSpacing: '-0.02em' }}>{topicProgress}%</span>
                </div>
                <p style={{ margin: '0 0 8px 0', fontSize: '16px', color: 'var(--on-surface-variant)' }}>Completion Rate ({completedTopics}/{topics.length})</p>
                <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--surface-variant)', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--gradient-start), var(--gradient-mid))', borderRadius: '9999px', width: `${topicProgress}%`, transition: 'width 1s ease-out' }}></div>
                </div>
                {topics.length === 0 && <p style={{ margin: '12px 0 0 0', fontSize: '12px', color: 'var(--on-surface-variant)' }}>Upload slides to extract topics. (Pro)</p>}
              </div>

            </div>

            {/* Recent Activity Mock */}
            <div style={{ backgroundColor: 'var(--surface-container-lowest)', borderRadius: '24px', padding: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: 'var(--on-surface)' }}>Recent Activity</h3>
                <button style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>View All</button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '16px', borderRadius: '16px', backgroundColor: 'var(--surface-container-low)' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)', flexShrink: 0, marginTop: '4px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>check_circle</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: '0 0 4px 0', fontSize: '16px', color: 'var(--on-surface)' }}><span style={{ fontWeight: '500' }}>Syllabus.pdf</span> extracted successfully.</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>Yesterday</span>
                      <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--surface-variant)' }}></span>
                      <span style={{ fontSize: '12px', color: 'var(--success)', backgroundColor: 'rgba(34,197,94,0.1)', padding: '2px 8px', borderRadius: '6px' }}>{roadmap.length} Items Found</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Add Study Material Hero */}
            <div style={{ backgroundColor: 'rgba(248,249,250,0.8)', backdropFilter: 'blur(16px)', borderRadius: '24px', padding: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.06)', border: '1px solid var(--surface-container-highest)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: '320px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ width: '80px', height: '80px', backgroundColor: 'var(--primary-fixed)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', marginBottom: '24px', transform: 'rotate(3deg)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '40px' }}>note_add</span>
              </div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '600', color: 'var(--on-surface)' }}>Add Study Material</h3>
              <p style={{ margin: '0 0 24px 0', fontSize: '16px', color: 'var(--on-surface-variant)', padding: '0 16px' }}>Upload lectures, syllabi, or notes to generate your study roadmap automatically.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                <button onClick={() => setActiveTab('documents')} style={{ width: '100%', padding: '14px', borderRadius: '12px', backgroundColor: 'var(--primary)', color: 'var(--on-primary)', fontSize: '16px', fontWeight: '500', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', transition: 'transform 0.2s' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>upload</span>
                  Upload Document
                </button>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => setActiveTab('roadmap')} style={{ flex: 1, padding: '12px', borderRadius: '12px', backgroundColor: 'var(--surface-container)', color: 'var(--on-surface)', fontSize: '14px', fontWeight: '500', border: 'none', cursor: 'pointer', transition: 'background-color 0.2s' }}>
                    View Roadmap
                  </button>
                  <button onClick={() => setActiveTab('topics')} style={{ flex: 1, padding: '12px', borderRadius: '12px', backgroundColor: 'var(--surface-container)', color: 'var(--on-surface)', fontSize: '14px', fontWeight: '500', border: 'none', cursor: 'pointer', transition: 'background-color 0.2s' }}>
                    Study Topics
                  </button>
                </div>
              </div>
            </div>

            {/* Next Step Card */}
            {topics.filter(t => !t.is_confirmed).length > 0 && (
              <div style={{ backgroundColor: 'var(--surface-container-lowest)', borderRadius: '24px', padding: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '-16px', right: '-16px', width: '64px', height: '64px', backgroundColor: 'var(--tertiary-fixed)', borderRadius: '50%', filter: 'blur(24px)', opacity: 0.5 }}></div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '600', color: 'var(--on-surface)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--gradient-end)' }}>tips_and_updates</span>
                  Next Step
                </h3>
                <p style={{ margin: '0 0 16px 0', fontSize: '16px', color: 'var(--on-surface-variant)' }}>You have {topics.filter(t => !t.is_confirmed).length} unconfirmed topics in your roadmap from the latest extraction.</p>
                <button onClick={() => setActiveTab('topics')} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: 0 }}>
                  Review Topics Now
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════ DOCUMENTS ═══════════════ */}
      {activeTab === 'documents' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: '100%',
              backgroundColor: dragOver ? 'var(--surface-container-low)' : 'var(--surface-container-lowest)',
              border: `2px dashed ${dragOver ? 'var(--primary)' : 'var(--outline-variant)'}`,
              borderRadius: '24px',
              padding: '48px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: dragOver ? '0 10px 40px rgba(0,0,0,0.08)' : '0 4px 20px rgba(0,0,0,0.02)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {dragOver && <div style={{ position: 'absolute', inset: 0, backgroundColor: 'var(--primary)', opacity: 0.05, pointerEvents: 'none' }}></div>}
            
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: dragOver ? 'var(--primary)' : 'var(--surface-container-high)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease', marginBottom: '16px', color: dragOver ? 'var(--on-primary)' : 'var(--on-surface-variant)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>{uploading ? 'cloud_upload' : 'upload_file'}</span>
            </div>
            
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: dragOver ? 'var(--primary)' : 'var(--on-surface)' }}>
                {uploading ? 'Uploading...' : 'Click or drag files to upload'}
              </h3>
              {!uploading && (
                <p style={{ margin: 0, fontSize: '16px', color: 'var(--on-surface-variant)' }}>PDF, PPTX up to {limits?.max_file_size_mb || (user?.plan === 'pro' ? 25 : 10)}MB</p>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_UPLOAD_EXT}
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </div>

          {documents.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: 'var(--on-surface)' }}>Uploaded Documents</h2>
                <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em', backgroundColor: 'var(--surface-container-high)', padding: '4px 8px', borderRadius: '4px' }}>
                  {documents.length} Files
                </span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {documents.map((doc) => {
                  const isProcessing = doc.processing_status === 'processing';
                  const isProcessed = doc.processing_status === 'processed';
                  const isError = doc.processing_status === 'failed';
                  const borderColor = isProcessing ? 'var(--gradient-end)' : (isError ? 'var(--error)' : 'var(--success)');
                  
                  return (
                    <div key={doc.id} style={{ width: '100%', backgroundColor: 'rgba(248,249,250,0.8)', backdropFilter: 'blur(16px)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.03)', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', backgroundColor: borderColor, opacity: isProcessing ? 0.5 : 1, transition: 'background-color 0.3s' }}></div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0 }}>
                        <div style={{ width: '48px', height: '48px', flexShrink: 0, borderRadius: '12px', backgroundColor: 'var(--surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '24px', color: doc.mime_type?.includes('presentation') ? 'var(--gradient-end)' : 'var(--error)' }}>
                            {doc.mime_type?.includes('presentation') ? 'slideshow' : 'picture_as_pdf'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                          <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: 'var(--on-surface)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.original_filename}</h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                            <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>{formatBytes(doc.size_bytes)}</span>
                            <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--outline-variant)' }}></span>
                            <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)', textTransform: 'capitalize' }}>{doc.doc_type}</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {isProcessing ? (
                          <div style={{ padding: '4px 10px', borderRadius: '9999px', backgroundColor: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--gradient-end)' }}>progress_activity</span>
                            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gradient-end)' }}>Processing...</span>
                          </div>
                        ) : (
                          <div style={{ padding: '4px 10px', borderRadius: '9999px', backgroundColor: isError ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: isError ? 'var(--error)' : 'var(--success)' }}></span>
                            <span style={{ fontSize: '12px', fontWeight: '600', color: isError ? 'var(--error)' : 'var(--success)', textTransform: 'capitalize' }}>{doc.processing_status}</span>
                          </div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            onClick={() => handleExtractRoadmap(doc.id)}
                            disabled={extracting === doc.id || polling || topicPolling}
                            style={{ padding: '6px 12px', borderRadius: '8px', backgroundColor: 'var(--surface-container)', color: 'var(--on-surface-variant)', fontSize: '14px', fontWeight: '500', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                          >
                            {extracting === doc.id || polling ? (
                              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>progress_activity</span>
                            ) : (
                              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>account_tree</span>
                            )}
                            Roadmap
                          </button>
                          
                          <button
                            onClick={() => handleExtractTopics(doc.id)}
                            disabled={topicExtracting === doc.id || topicPolling || polling}
                            style={{ padding: '6px 12px', borderRadius: '8px', backgroundColor: 'var(--surface-container)', color: 'var(--on-surface-variant)', fontSize: '14px', fontWeight: '500', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                          >
                            {topicExtracting === doc.id ? (
                              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>progress_activity</span>
                            ) : (
                              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>auto_awesome</span>
                            )}
                            Topics
                          </button>

                          <button onClick={() => handleDeleteDocument(doc.id)} style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'transparent', color: 'var(--on-surface-variant)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} title="Delete">
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════ ROADMAP ═══════════════ */}
      {activeTab === 'roadmap' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {roadmap.length === 0 ? (
            <div style={{ padding: '48px', backgroundColor: 'var(--surface-container-lowest)', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', border: '1px solid var(--surface-container)', opacity: 0.7 }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗺️</div>
              <p style={{ margin: '0 0 24px 0', fontSize: '18px', color: 'var(--on-surface)', fontWeight: '500' }}>No roadmap yet.</p>
              <p style={{ margin: '0 0 24px 0', fontSize: '16px', color: 'var(--on-surface-variant)' }}>Upload a syllabus and extract your assessments to build your roadmap.</p>
              <button onClick={() => setActiveTab('documents')} style={{ padding: '12px 24px', borderRadius: '12px', backgroundColor: 'var(--primary)', color: 'var(--on-primary)', fontSize: '16px', fontWeight: '500', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>upload</span>
                Upload Syllabus
              </button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', backgroundColor: 'var(--surface-container)', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>map</span>
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: 'var(--on-surface)' }}>Syllabus Roadmap</h2>
                    <p style={{ margin: 0, fontSize: '14px', color: 'var(--on-surface-variant)' }}>Review each assessment and confirm to lock it in.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--surface-container-high)', padding: '8px 16px', borderRadius: '9999px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--success)' }}>check_circle</span>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--on-surface)' }}>{confirmedCount}/{roadmap.length} Confirmed</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {roadmap.map((node) => {
                  const isConfirmed = node.is_confirmed;
                  const isPlaceholder = node.is_placeholder;
                  
                  // Determine color based on node_type
                  let typeColor = 'var(--outline)';
                  let bgColor = 'var(--surface-container)';
                  const nt = node.node_type.toLowerCase();
                  if (nt === 'assignment') { typeColor = '#3B82F6'; bgColor = 'rgba(59,130,246,0.1)'; }
                  else if (nt === 'exam' || nt === 'quiz') { typeColor = 'var(--error)'; bgColor = 'rgba(239,68,68,0.1)'; }
                  else if (nt === 'project' || nt === 'lab') { typeColor = 'var(--success)'; bgColor = 'rgba(34,197,94,0.1)'; }

                  return (
                    <div key={node.id} style={{ display: 'flex', alignItems: 'flex-start', padding: '16px', backgroundColor: 'var(--surface-container-lowest)', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', position: 'relative', overflow: 'hidden', gap: '16px', opacity: (node.status === 'Submitted' || node.status === 'Graded') ? 0.8 : 1 }}>
                      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '6px', backgroundColor: typeColor }}></div>
                      
                      {editingId === node.id ? (
                        <div style={{ flex: 1, paddingLeft: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <input
                            value={draft.title}
                            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                            placeholder="Assessment title"
                            style={{ width: '100%', padding: '8px 12px', fontSize: '16px', fontWeight: '600', color: 'var(--on-surface)', backgroundColor: 'var(--surface-container-low)', border: '1px solid var(--outline-variant)', borderRadius: '8px', outline: 'none' }}
                          />
                          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <select value={draft.node_type} onChange={(e) => setDraft({ ...draft, node_type: e.target.value })} style={{ padding: '8px 12px', fontSize: '14px', borderRadius: '8px', border: '1px solid var(--outline-variant)', backgroundColor: 'var(--surface-container-low)', color: 'var(--on-surface)' }}>
                              {NODE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <input type="date" value={draft.deadline} onChange={(e) => setDraft({ ...draft, deadline: e.target.value })} style={{ padding: '8px 12px', fontSize: '14px', borderRadius: '8px', border: '1px solid var(--outline-variant)', backgroundColor: 'var(--surface-container-low)', color: 'var(--on-surface)' }} />
                            <input
                              type="number" step="0.5" min="0" placeholder="Weight %"
                              value={draft.weight_percent}
                              onChange={(e) => setDraft({ ...draft, weight_percent: e.target.value })}
                              style={{ width: '100px', padding: '8px 12px', fontSize: '14px', borderRadius: '8px', border: '1px solid var(--outline-variant)', backgroundColor: 'var(--surface-container-low)', color: 'var(--on-surface)' }}
                            />
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => saveEdit(node.id)} style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: 'var(--primary)', color: 'var(--on-primary)', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>Save</button>
                            <button onClick={cancelEdit} style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: 'var(--surface-container)', color: 'var(--on-surface)', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '80px', paddingLeft: '12px' }}>
                            <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>{node.deadline ? new Date(node.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No Date'}</span>
                            <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>{node.weight_percent != null ? `${node.weight_percent}% Weight` : '—'}</span>
                          </div>

                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                              <span style={{ padding: '4px 12px', borderRadius: '9999px', backgroundColor: bgColor, color: typeColor, fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{node.node_type}</span>
                              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: (node.status === 'Submitted' || node.status === 'Graded') ? 'var(--on-surface-variant)' : 'var(--on-surface)', textDecoration: (node.status === 'Submitted' || node.status === 'Graded') ? 'line-through' : 'none' }}>{node.title}</h3>
                              {isPlaceholder && (
                                <span style={{ padding: '4px 8px', borderRadius: '6px', backgroundColor: 'var(--error-container)', color: 'var(--on-error-container)', fontSize: '11px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>warning</span> Needs Info
                                </span>
                              )}
                              {isConfirmed && node.status !== 'Submitted' && node.status !== 'Graded' && (
                                <span style={{ padding: '4px 8px', borderRadius: '6px', backgroundColor: 'var(--surface-container-high)', color: 'var(--success)', fontSize: '11px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check</span> Confirmed
                                </span>
                              )}
                              {node.status === 'Submitted' && (
                                <span style={{ padding: '4px 8px', borderRadius: '6px', backgroundColor: 'rgba(245,158,11,0.1)', color: 'var(--gradient-end)', fontSize: '11px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>outbox</span> Submitted
                                </span>
                              )}
                              {node.status === 'Graded' && (
                                <span style={{ padding: '4px 8px', borderRadius: '6px', backgroundColor: 'rgba(34,197,94,0.1)', color: 'var(--success)', fontSize: '11px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>done_all</span> Graded
                                </span>
                              )}
                            </div>

                            {/* Gap Metrics UI (new) */}
                            {(node.status === 'Submitted' || node.status === 'Graded') && gapData[node.id] && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: 'var(--surface-container-low)', padding: '12px', borderRadius: '12px', width: 'fit-content', border: '1px solid var(--outline-variant)' }}>
                                {gapData[node.id].hours_gap != null && (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--on-surface-variant)' }}>timer</span>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                      <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>Time Gap</span>
                                      <span style={{ fontSize: '14px', fontWeight: '500', color: gapData[node.id].hours_gap <= 0 ? 'var(--success)' : 'var(--error)' }}>
                                        {gapData[node.id].hours_gap > 0 ? '+' : ''}{gapData[node.id].hours_gap}h
                                      </span>
                                    </div>
                                  </div>
                                )}
                                {gapData[node.id].confidence_gap != null && (
                                  <>
                                    <div style={{ width: '1px', height: '32px', backgroundColor: 'var(--outline-variant)', opacity: 0.5 }}></div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--on-surface-variant)' }}>award_star</span>
                                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>Quality Gap</span>
                                        <span style={{ fontSize: '14px', fontWeight: '500', color: gapData[node.id].confidence_gap >= 0 ? 'var(--success)' : 'var(--error)' }}>
                                          {gapData[node.id].confidence_gap > 0 ? '+' : ''}{gapData[node.id].confidence_gap}
                                        </span>
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            )}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                            {!isConfirmed && (
                              <button onClick={() => handleConfirmNode(node.id)} style={{ padding: '10px 20px', borderRadius: '8px', backgroundColor: 'var(--primary)', color: 'var(--on-primary)', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}>
                                Confirm
                              </button>
                            )}
                            {isConfirmed && node.status !== 'Submitted' && node.status !== 'Graded' && (
                              <button onClick={() => openSubmitModal(node)} style={{ padding: '10px 20px', borderRadius: '8px', backgroundColor: 'transparent', border: '1px solid var(--outline-variant)', color: 'var(--on-surface)', cursor: 'pointer', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>upload</span>
                                Submit Assessment
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* ═══════════════ TOPICS ═══════════════ */}
      {activeTab === 'topics' && (
        <TopicList
          topics={topics}
          roadmapNodes={roadmap}
          isExtracting={topicPolling}
          onReorder={handleReorder}
          onConfirm={handleConfirmTopic}
          onEdit={handleEditTopic}
          onDelete={handleDeleteTopic}
          onToggleComplete={handleToggleComplete}
          onAddTopic={() => setAddTopicOpen(true)}
          onConfirmAll={handleConfirmAllTopics}
          mergeMode={mergeMode}
          setMergeMode={setMergeMode}
          selectedForMerge={selectedForMerge}
          toggleMergeSelection={toggleMergeSelection}
          confirmMerge={handleConfirmMerge}
          cancelMerge={handleCancelMerge}
        />
      )}

      {/* ═══════════════ NOTES ═══════════════ */}
      {activeTab === 'notes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setActiveTab('notes')} style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: 'var(--surface-container-high)', color: 'var(--on-surface)', fontSize: '14px', fontWeight: '500', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>list</span> List
            </button>
            <button onClick={() => navigate('/notes')} style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: 'var(--surface-container)', color: 'var(--on-surface-variant)', fontSize: '14px', fontWeight: '500', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'background-color 0.2s' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>open_in_new</span> Full Notes Page
            </button>
          </div>

          {notesLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px', color: 'var(--on-surface-variant)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '24px', animation: 'spin 1s linear infinite' }}>progress_activity</span>
              <span style={{ marginLeft: '12px', fontSize: '16px' }}>Loading notes...</span>
            </div>
          ) : notes.length === 0 ? (
            <div style={{ padding: '48px', backgroundColor: 'var(--surface-container-lowest)', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', border: '1px solid var(--surface-container)', opacity: 0.7 }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
              <p style={{ margin: '0 0 24px 0', fontSize: '18px', color: 'var(--on-surface)', fontWeight: '500' }}>No notes yet for this course.</p>
              <button onClick={() => {
                apiFetch('/notes', {
                  method: 'POST',
                  body: JSON.stringify({ title: 'New Note', content: '', course_id: parseInt(id) })
                }).then((note) => navigate(`/notes/${note.id}`))
              }} style={{ padding: '12px 24px', borderRadius: '12px', backgroundColor: 'var(--primary)', color: 'var(--on-primary)', fontSize: '16px', fontWeight: '500', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add</span>
                Create Note
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
              {notes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => navigate(`/notes/${note.id}`)}
                  style={{ padding: '20px', backgroundColor: 'var(--surface-container-lowest)', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: '12px', border: '1px solid transparent' }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = 'var(--surface-container-high)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.03)'; e.currentTarget.style.borderColor = 'transparent' }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: 'var(--on-surface)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{note.title}</h3>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--surface-container)', color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>description</span>
                    </div>
                  </div>
                  {note.is_stub && (
                    <span style={{ padding: '4px 8px', borderRadius: '6px', backgroundColor: 'var(--surface-container)', color: 'var(--on-surface-variant)', fontSize: '12px', fontWeight: '500', width: 'fit-content' }}>Stub</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════ SELF-ASSESSMENT MODAL ═══════════════ */}
      {submitModalOpen && submittingNode && (
        <SelfAssessmentModal
          node={submittingNode}
          onSubmit={handleNodeSubmit}
          onClose={() => {
            setSubmitModalOpen(false)
            setSubmittingNode(null)
          }}
        />
      )}
    </div>
  )
}
