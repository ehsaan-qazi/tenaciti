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
      <div className="course-header">
        <div className="course-header-top">
          <button className="back-btn" onClick={() => navigate('/')}>←</button>
          <h1 className="course-title">{course.name}</h1>
        </div>
        <div className="course-subtitle">
          {course.code && <span>{course.code}</span>}
          <span>📅 {course.semester} {course.academic_year}</span>
          {course.credit_hours && <span>🎓 {course.credit_hours} credits</span>}
          <span>📄 {course.doc_upload_count} / {limits?.upload_limit_per_course || (user?.plan === 'pro' ? 20 : 3)} documents</span>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="tabs">
        {['overview', 'documents', 'roadmap', 'topics', 'notes'].map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'overview' && 'Overview'}
            {tab === 'documents' && `Documents (${documents.length})`}
            {tab === 'roadmap' && `Roadmap (${roadmap.length})`}
            {tab === 'topics' && `Topics (${topics.length})`}
            {tab === 'notes' && `Notes (${notes.length})`}
          </button>
        ))}
      </div>

      {uploadError && <div className="error-message" style={{ marginTop: '1rem' }}>{uploadError}</div>}
      {uploadSuccess && <div className="success-message" style={{ marginTop: '1rem' }}>✅ {uploadSuccess}</div>}

      {/* ═══════════════ OVERVIEW ═══════════════ */}
      {activeTab === 'overview' && (
        <div>
          <div className="settings-card">
            <h3>Progress</h3>

            {/* Roadmap progress */}
            <div className="quota-bar-container">
              <div className="quota-header">
                <span>Roadmap Confirmation</span>
                <span>{confirmedCount}/{roadmap.length} ({roadmapProgress}%)</span>
              </div>
              <div className="quota-bar">
                <div className="quota-fill" style={{ width: `${roadmapProgress}%` }} />
              </div>
              {roadmap.length === 0 && (
                <p className="quota-hint">Upload a syllabus and extract your roadmap to track assessments.</p>
              )}
            </div>

            {/* Topic progress */}
            <div className="quota-bar-container" style={{ marginTop: '1rem' }}>
              <div className="quota-header">
                <span>Topic Completion</span>
                <span>{completedTopics}/{topics.length} ({topicProgress}%)</span>
              </div>
              <div className="quota-bar">
                <div className="quota-fill" style={{ width: `${topicProgress}%`, background: 'linear-gradient(90deg, var(--purple), var(--green))' }} />
              </div>
              {topics.length === 0 && (
                <p className="quota-hint">Upload slides and extract topics to track your study progress. (Pro)</p>
              )}
            </div>
          </div>

          <div className="settings-card">
            <h3>Quick Actions</h3>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button className="primary-btn" style={{ width: 'auto' }} onClick={() => setActiveTab('documents')}>
                📤 Upload Document
              </button>
              {roadmap.length > 0 && (
                <button className="secondary-btn" onClick={() => setActiveTab('roadmap')}>
                  🗺️ View Roadmap
                </button>
              )}
              {topics.length > 0 && (
                <button className="secondary-btn" onClick={() => setActiveTab('topics')}>
                  📋 Study Topics
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ DOCUMENTS ═══════════════ */}
      {activeTab === 'documents' && (
        <div>
          <div
            className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_UPLOAD_EXT}
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            {uploading ? (
              <div>
                <div className="spinner" style={{ width: '32px', height: '32px', borderWidth: '3px', marginBottom: '0.75rem' }} />
                <div className="upload-zone-text">Uploading…</div>
              </div>
            ) : (
              <>
                <div className="upload-zone-icon">📁</div>
                <div className="upload-zone-text">
                  Drag &amp; drop your syllabus PDF or lecture PPTX here, or click to browse
                </div>
                <div className="upload-zone-hint">
                  PDF or PPTX • Max {limits?.max_file_size_mb || (user?.plan === 'pro' ? 25 : 10)} MB
                  {user?.plan !== 'pro' && ' • PPTX requires Pro'}
                </div>
              </>
            )}
          </div>

          {documents.length > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 600 }}>Uploaded Documents</h3>
              <div className="document-list">
                {documents.map((doc) => (
                  <div key={doc.id} className="document-item">
                    <div className="document-info">
                      <span className="document-icon">
                        {doc.mime_type?.includes('presentation') || doc.mime_type?.includes('powerpoint') ? '📊' : '📄'}
                      </span>
                      <div className="document-details">
                        <div className="document-name">{doc.original_filename}</div>
                        <div className="document-meta">{formatBytes(doc.size_bytes)} • {doc.doc_type}</div>
                      </div>
                    </div>
                    <div className="document-actions">
                      <span className={`status-badge ${doc.processing_status}`}>{doc.processing_status}</span>
                      <button
                        className="extract-btn"
                        onClick={() => handleExtractRoadmap(doc.id)}
                        disabled={extracting === doc.id || polling || topicPolling}
                      >
                        {extracting === doc.id || polling
                          ? <><span className="spinner" /> Extracting…</>
                          : <>🗺️ Extract Roadmap</>}
                      </button>
                      <button
                        className="extract-btn secondary"
                        onClick={() => handleExtractTopics(doc.id)}
                        disabled={topicExtracting === doc.id || topicPolling || polling}
                      >
                        {topicExtracting === doc.id
                          ? <><span className="spinner" /> Extracting…</>
                          : <>📋 Extract Topics</>}
                      </button>
                      <button className="icon-btn danger" title="Delete" onClick={() => handleDeleteDocument(doc.id)}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════ ROADMAP ═══════════════ */}
      {activeTab === 'roadmap' && (
        <div>
          {roadmap.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗺️</div>
              <p>No roadmap yet. Upload a syllabus and extract your assessments!</p>
              <button className="primary-btn" style={{ width: 'auto' }} onClick={() => setActiveTab('documents')}>
                📤 Upload Syllabus
              </button>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '1.5rem' }}>
                <div className="quota-bar-container">
                  <div className="quota-header">
                    <span>Roadmap Confirmation</span>
                    <span>{confirmedCount}/{roadmap.length} confirmed ({roadmapProgress}%)</span>
                  </div>
                  <div className="quota-bar">
                    <div className="quota-fill" style={{ width: `${roadmapProgress}%` }} />
                  </div>
                </div>
                <p className="quota-hint">Review each assessment, fill any missing dates/weights, then confirm to lock it in.</p>
              </div>

              <div className="roadmap-list">
                {roadmap.map((node) => (
                  <div
                    key={node.id}
                    className={`roadmap-item ${node.is_confirmed ? 'confirmed' : ''} ${node.is_placeholder ? 'placeholder' : ''}`}
                  >
                    {editingId === node.id ? (
                      <div className="roadmap-edit">
                        <input
                          className="roadmap-input"
                          value={draft.title}
                          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                          placeholder="Assessment title"
                        />
                        <div className="roadmap-edit-row">
                          <select value={draft.node_type} onChange={(e) => setDraft({ ...draft, node_type: e.target.value })}>
                            {NODE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                          </select>
                          <input type="date" value={draft.deadline} onChange={(e) => setDraft({ ...draft, deadline: e.target.value })} />
                          <input
                            type="number" step="0.5" min="0" placeholder="Weight %"
                            value={draft.weight_percent}
                            onChange={(e) => setDraft({ ...draft, weight_percent: e.target.value })}
                          />
                        </div>
                        <div className="roadmap-edit-actions">
                          <button className="primary-btn" style={{ width: 'auto' }} onClick={() => saveEdit(node.id)}>Save</button>
                          <button className="secondary-btn" onClick={cancelEdit}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="roadmap-view">
                        <div className="roadmap-main">
                          <span className={`status-badge node-type ${node.node_type.toLowerCase()}`}>{node.node_type}</span>
                          <span className="roadmap-title">{node.title}</span>
                          {node.is_placeholder && <span className="badge placeholder-badge">⚠ Needs info</span>}
                          {node.is_confirmed && <span className="badge confirmed-badge">✓ Confirmed</span>}
                        </div>
                        <div className="roadmap-meta">
                          <span>📅 {node.deadline ? toDateInputValue(node.deadline) : '—'}</span>
                          <span>⚖️ {node.weight_percent != null ? `${node.weight_percent}%` : '—'}</span>
                          {node.extraction_confidence != null && (
                            <span title="AI confidence">🤖 {Math.round(node.extraction_confidence * 100)}%</span>
                          )}
                        </div>
                        <div className="roadmap-actions">
                          {!node.is_confirmed && (
                            <button className="primary-btn" style={{ width: 'auto' }} onClick={() => handleConfirmNode(node.id)}>
                              ✓ Confirm
                            </button>
                          )}
                          {node.is_confirmed && node.status !== 'Submitted' && node.status !== 'Graded' && (
                            <button className="primary-btn" style={{ width: 'auto', background: 'var(--amber)', borderColor: 'var(--amber)', color: 'var(--bg-primary)' }} onClick={() => openSubmitModal(node)}>
                              📝 Submit
                            </button>
                          )}
                          {node.status === 'Submitted' && <span className="badge" style={{ background: 'var(--amber-dim)', color: 'var(--amber)' }}>📤 Submitted</span>}
                          {node.status === 'Graded' && <span className="badge" style={{ background: 'var(--green-dim)', color: 'var(--green)' }}>✅ Graded</span>}
                          {/* Inline gap metrics for submitted/graded nodes */}
                          {(node.status === 'Submitted' || node.status === 'Graded') && gapData[node.id] && (
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                              {gapData[node.id].confidence_gap != null && (
                                <span className="badge" style={{
                                  background: gapData[node.id].confidence_gap >= 0 ? 'var(--green-dim)' : 'var(--red-dim, rgba(239,68,68,0.15))',
                                  color: gapData[node.id].confidence_gap >= 0 ? 'var(--green)' : 'var(--red)',
                                  fontSize: '10px',
                                }}>
                                  {gapData[node.id].confidence_gap >= 0 ? '▲' : '▼'} Quality: {gapData[node.id].confidence_gap > 0 ? '+' : ''}{gapData[node.id].confidence_gap}
                                </span>
                              )}
                              {gapData[node.id].hours_gap != null && (
                                <span className="badge" style={{
                                  background: gapData[node.id].hours_gap <= 0 ? 'var(--green-dim)' : 'var(--amber-dim)',
                                  color: gapData[node.id].hours_gap <= 0 ? 'var(--green)' : 'var(--amber)',
                                  fontSize: '10px',
                                }}>
                                  ⏱ {gapData[node.id].hours_gap > 0 ? '+' : ''}{gapData[node.id].hours_gap}h
                                </span>
                              )}
                              {gapData[node.id].hours_before_deadline != null && (
                                <span className="badge" style={{
                                  background: gapData[node.id].hours_before_deadline >= 0 ? 'var(--green-dim)' : 'var(--red-dim, rgba(239,68,68,0.15))',
                                  color: gapData[node.id].hours_before_deadline >= 0 ? 'var(--green)' : 'var(--red)',
                                  fontSize: '10px',
                                }}>
                                  {gapData[node.id].hours_before_deadline >= 0 ? '⏰ Early' : '⏰ Late'}: {Math.abs(gapData[node.id].hours_before_deadline).toFixed(1)}h
                                </span>
                              )}
                            </div>
                          )}
                          <button className="secondary-btn" onClick={() => startEdit(node)}>✏️ Edit</button>
                          <button className="icon-btn danger" onClick={() => handleDeleteNode(node.id)}>🗑️</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
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
        <div>
          <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
            <button className="secondary-btn" style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '12px' }} onClick={() => setActiveTab('notes')}>
              📋 List
            </button>
            <button className="secondary-btn" style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '12px' }} onClick={() => navigate('/notes')}>
              📊 Full Notes Page
            </button>
          </div>

          {notesLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <span className="spinner" /> Loading notes...
            </div>
          ) : notes.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
              <p>No notes yet for this course. Create notes to link your study material.</p>
              <button className="primary-btn" style={{ width: 'auto' }} onClick={() => {
                apiFetch('/notes', {
                  method: 'POST',
                  body: JSON.stringify({ title: 'New Note', content: '', course_id: parseInt(id) })
                }).then((note) => navigate(`/notes/${note.id}`))
              }}>
                ＋ Create Note
              </button>
            </div>
          ) : (
            <div className="notes-list">
              {notes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => navigate(`/notes/${note.id}`)}
                  className={`topic-item ${note.is_stub ? 'placeholder' : ''}`}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="topic-title-text">{note.title}</span>
                  {note.is_stub && <span className="badge placeholder-badge">(stub)</span>}
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
