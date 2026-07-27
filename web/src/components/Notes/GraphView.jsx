/**
 * GraphView — Obsidian-style interactive knowledge graph visualization.
 *
 * Design:
 * - Dynamic node sizing based on connection degree (like Obsidian)
 * - Scaled, crisp typography in graph coordinates (prevents overlapping/giant text)
 * - Subtle, translucent link lines
 * - Interactive hover highlighting (dims unlinked nodes on hover)
 * - Fine-tuned D3 force physics for spacious node distribution
 */
import { useRef, useEffect, useState, useMemo, useCallback } from 'react'
import ForceGraph2D from 'react-force-graph-2d'
import { apiFetch } from '../../api/client'

// ── Obsidian Dark Theme Palette ─────────────────────────────────────────────
const COURSE_PALETTE = [
  '#a78bfa', // Muted violet
  '#60a5fa', // Soft blue
  '#34d399', // Emerald
  '#fbbf24', // Amber
  '#f87171', // Coral red
  '#f472b6', // Pink
  '#38bdf8', // Sky blue
]
const DEFAULT_NODE_COLOR = '#8b5cf6' // Accent purple
const STUB_COLOR = '#6b7280'         // Muted grey for stubs
const LINK_COLOR = 'rgba(156, 163, 175, 0.25)' // Subtle thin link
const LINK_HOVER_COLOR = 'rgba(167, 139, 250, 0.7)' // Bright link on hover
const BG_COLOR = '#16161a'           // Dark Obsidian canvas background

export default function GraphView({ notes, onNodeClick }) {
  const containerRef = useRef(null)
  const fgRef = useRef(null)

  const [graphLinks, setGraphLinks] = useState([])
  const [filterCourse, setFilterCourse] = useState('all')
  const [loading, setLoading] = useState(false)
  const [dimensions, setDimensions] = useState({ width: 600, height: 500 })
  const [hoveredNode, setHoveredNode] = useState(null)

  // ── Measure container width/height ────────────────────────────────────────
  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth || 600,
          height: Math.max(450, window.innerHeight - 300),
        })
      }
    }
    measure()
    const ro = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(measure)
      : null
    if (ro && containerRef.current) ro.observe(containerRef.current)
    return () => ro && ro.disconnect()
  }, [])

  // ── Unique courses from notes ─────────────────────────────────────────────
  const courses = useMemo(() => {
    const seen = new Set()
    notes.forEach(n => { if (n.course_id) seen.add(n.course_id) })
    return Array.from(seen)
  }, [notes])

  // ── Course → colour map ───────────────────────────────────────────────────
  const courseColor = useMemo(() => {
    const map = {}
    courses.forEach((c, i) => { map[c] = COURSE_PALETTE[i % COURSE_PALETTE.length] })
    return map
  }, [courses])

  // ── Fetch all note links ──────────────────────────────────────────────────
  useEffect(() => {
    if (!notes.length) { setGraphLinks([]); return }
    setLoading(true)
    const fetchLinks = async () => {
      try {
        const results = await Promise.all(
          notes.map(n => apiFetch(`/notes/backlinks/${n.id}`).catch(() => []))
        )
        const links = []
        results.forEach((backlinks, idx) => {
          backlinks.forEach(src => {
            links.push({ source: src.id, target: notes[idx].id })
          })
        })
        setGraphLinks(links)
      } catch (err) {
        console.error('Failed to fetch links for graph:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchLinks()
  }, [notes])

  // ── Connection degree map & neighbor lookup for hover effect ──────────────
  const { degreeMap, neighborsMap } = useMemo(() => {
    const degrees = {}
    const neighbors = {}

    graphLinks.forEach(l => {
      const src = typeof l.source === 'object' ? l.source?.id : l.source
      const tgt = typeof l.target === 'object' ? l.target?.id : l.target

      degrees[src] = (degrees[src] || 0) + 1
      degrees[tgt] = (degrees[tgt] || 0) + 1

      if (!neighbors[src]) neighbors[src] = new Set()
      if (!neighbors[tgt]) neighbors[tgt] = new Set()
      neighbors[src].add(tgt)
      neighbors[tgt].add(src)
    })

    return { degreeMap: degrees, neighborsMap: neighbors }
  }, [graphLinks])

  // ── Filtered graph data ───────────────────────────────────────────────────
  const graphData = useMemo(() => {
    const filtered = filterCourse === 'all'
      ? notes
      : notes.filter(n => n.course_id === parseInt(filterCourse))

    const nodeIds = new Set(filtered.map(n => n.id))

    const nodes = filtered.map(n => ({
      id: n.id,
      title: n.title,
      is_stub: n.is_stub,
      course_id: n.course_id,
      degree: degreeMap[n.id] || 0,
    }))

    const links = graphLinks.filter(l => {
      const src = typeof l.source === 'object' ? l.source?.id : l.source
      const tgt = typeof l.target === 'object' ? l.target?.id : l.target
      return nodeIds.has(src) && nodeIds.has(tgt)
    })

    return { nodes, links }
  }, [notes, graphLinks, filterCourse, degreeMap])

  // ── Configure Force Engine parameters (Obsidian-style layout) ──────────────
  useEffect(() => {
    if (fgRef.current) {
      // Repulsion force between nodes
      fgRef.current.d3Force('charge')?.strength(-140)
      // Ideal link distance
      fgRef.current.d3Force('link')?.distance(55)
    }
  }, [graphData])

  // ── Obsidian-style Canvas Node Renderer ──────────────────────────────────
  const paintNode = useCallback((node, ctx, globalScale) => {
    const label = node.title || 'Untitled'

    // Dynamic node radius: Obsidian scales node size slightly with degree
    const baseR = node.is_stub ? 2.5 : 3.5
    const r = baseR + Math.min(node.degree * 0.7, 4)

    // Base color
    let color = node.is_stub
      ? STUB_COLOR
      : (courseColor[node.course_id] || DEFAULT_NODE_COLOR)

    // Hover state calculation
    const isHovered = hoveredNode && hoveredNode.id === node.id
    const isNeighbor = hoveredNode && neighborsMap[hoveredNode.id]?.has(node.id)
    const isDimmed = hoveredNode && !isHovered && !isNeighbor

    if (isDimmed) {
      color = node.is_stub ? '#374151' : color + '40' // Dim unlinked nodes
    }

    // 1. Draw outer halo on hover
    if (isHovered) {
      ctx.beginPath()
      ctx.arc(node.x, node.y, r + 3, 0, 2 * Math.PI)
      ctx.fillStyle = 'rgba(167, 139, 250, 0.35)'
      ctx.fill()
    }

    // 2. Draw node circle
    ctx.beginPath()
    ctx.arc(node.x, node.y, r, 0, 2 * Math.PI)
    ctx.fillStyle = color
    ctx.fill()

    // Dashed ring for stub nodes
    if (node.is_stub) {
      ctx.setLineDash([1.5, 1.5])
      ctx.strokeStyle = isDimmed ? '#4b5563' : '#9ca3af'
      ctx.lineWidth = 0.8
      ctx.stroke()
      ctx.setLineDash([])
    }

    // 3. Draw text label — fixed size in graph units (3.8px), scales with zoom
    // Only hide text if zoomed out very far (globalScale < 0.45)
    if (globalScale >= 0.45 || isHovered || isNeighbor) {
      const fontSize = 3.8 // Exact graph units font size (Obsidian standard)
      ctx.font = `${fontSize}px Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'

      // Soft text color (brighter when hovered/neighbor)
      ctx.fillStyle = isDimmed
        ? '#4b5563'
        : (isHovered ? '#ffffff' : '#d1d5db')

      const displayLabel = label.length > 24 ? label.slice(0, 22) + '…' : label
      ctx.fillText(displayLabel, node.x, node.y + r + 1.5)
    }
  }, [hoveredNode, neighborsMap, courseColor])

  // ── Dynamic Link Renderer ─────────────────────────────────────────────────
  const getLinkColor = useCallback((link) => {
    if (!hoveredNode) return LINK_COLOR
    const src = typeof link.source === 'object' ? link.source.id : link.source
    const tgt = typeof link.target === 'object' ? link.target.id : link.target
    if (src === hoveredNode.id || tgt === hoveredNode.id) {
      return LINK_HOVER_COLOR
    }
    return 'rgba(75, 85, 99, 0.1)' // Very faint for non-connected links during hover
  }, [hoveredNode])

  // Stats
  const stubCount = graphData.nodes.filter(n => n.is_stub).length

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <span className="spinner" style={{ marginRight: '0.5rem' }} />
        Building graph…
      </div>
    )
  }

  return (
    <div className="graph-view">
      {/* ── Controls row ── */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {/* Stats chips */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {[
            { label: 'notes', value: graphData.nodes.length },
            { label: 'connections', value: graphData.links.length },
            { label: 'stubs', value: stubCount },
          ].map(({ label, value }) => (
            <div key={label} style={{
              padding: '0.35rem 0.75rem',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-light)',
              borderRadius: '20px',
              fontSize: '12px',
              color: 'var(--text-secondary)',
            }}>
              <strong style={{ color: 'var(--text-primary)' }}>{value}</strong>{' '}{label}
            </div>
          ))}
        </div>

        {/* Course filter */}
        {courses.length > 0 && (
          <select
            value={filterCourse}
            onChange={e => setFilterCourse(e.target.value)}
            style={{
              padding: '0.35rem 0.6rem',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-light)',
              borderRadius: '6px',
              color: 'var(--text-primary)',
              fontSize: '12px',
              marginLeft: 'auto',
            }}
          >
            <option value="all">All Courses</option>
            {courses.map(c => (
              <option key={c} value={c}>Course {c}</option>
            ))}
          </select>
        )}
      </div>

      {/* ── Legend ── */}
      {courses.length > 0 && (
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          {courses.map((c, i) => (
            <div key={c} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '11px', color: 'var(--text-secondary)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: COURSE_PALETTE[i % COURSE_PALETTE.length], display: 'inline-block' }} />
              Course {c}
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '11px', color: 'var(--text-secondary)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: STUB_COLOR, display: 'inline-block', border: '1px dashed #9ca3af' }} />
            Stub
          </div>
        </div>
      )}

      {/* ── Canvas graph ── */}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          borderRadius: '10px',
          overflow: 'hidden',
          border: '1px solid var(--border-light)',
          background: BG_COLOR,
        }}
      >
        {graphData.nodes.length === 0 ? (
          <div style={{
            height: 350,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            background: BG_COLOR,
            flexDirection: 'column',
            gap: '0.5rem',
          }}>
            <span style={{ fontSize: '2rem' }}>🕸️</span>
            <p style={{ margin: 0 }}>No notes to display. Create notes with [[wikilinks]] to build connections.</p>
          </div>
        ) : (
          <ForceGraph2D
            ref={fgRef}
            width={dimensions.width}
            height={dimensions.height}
            graphData={graphData}
            backgroundColor={BG_COLOR}
            nodeCanvasObject={paintNode}
            nodePointerAreaPaint={(node, color, ctx) => {
              const r = 3.5 + Math.min(node.degree * 0.7, 4)
              ctx.beginPath()
              ctx.arc(node.x, node.y, r + 3, 0, 2 * Math.PI)
              ctx.fillStyle = color
              ctx.fill()
            }}
            linkColor={getLinkColor}
            linkWidth={link => (hoveredNode && (link.source.id === hoveredNode.id || link.target.id === hoveredNode.id)) ? 1.2 : 0.6}
            onNodeClick={node => onNodeClick(node.id)}
            onNodeHover={node => setHoveredNode(node || null)}
            nodeLabel={node => `${node.title}${node.is_stub ? ' (stub)' : ''}`}
            onEngineStop={() => {
              if (fgRef.current) {
                fgRef.current.zoomToFit(400, 100)
                setTimeout(() => {
                  if (fgRef.current) {
                    const currentZoom = fgRef.current.zoom()
                    fgRef.current.zoom(currentZoom * 0.95, 300)
                  }
                }, 420)
              }
            }}
          />
        )}
      </div>

      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
        Click a node to open note. Hover to highlight connections. Scroll to zoom. Drag to pan.
      </p>
    </div>
  )
}