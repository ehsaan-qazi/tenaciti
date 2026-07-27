import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api/client';

export default function SelfAssessmentPage() {
  const [gaps, setGaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, positive, negative, overdue
  const [sortBy, setSortBy] = useState('submitted_at'); // submitted_at
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchGaps();
  }, []);

  const fetchGaps = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch('/self-assessment/user/summary');
      setGaps(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load self-assessment data');
    } finally {
      setLoading(false);
    }
  };

  const filteredGaps = gaps
    .filter(gap => {
      if (filter === 'positive') return (gap.confidence_gap || 0) > 0 || (gap.hours_gap || 0) < 0;
      if (filter === 'negative') return (gap.confidence_gap || 0) < 0 || (gap.hours_gap || 0) > 0;
      if (filter === 'overdue') return gap.hours_before_deadline !== null && gap.hours_before_deadline < 0;
      return true;
    })
    .sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      const dir = sortOrder === 'asc' ? 1 : -1;
      return aVal > bVal ? dir : -dir;
    });

  const getConfidenceGapColor = (gap) => {
    if (gap === null || gap === undefined) return 'var(--text-muted)';
    if (gap > 0) return 'var(--green)'; // quality > confidence = exceeded expectations
    if (gap < 0) return 'var(--red)';   // quality < confidence = underperformed
    return 'var(--amber)';
  };

  const getHoursGapColor = (gap) => {
    if (gap === null || gap === undefined) return 'var(--text-muted)';
    if (gap < 0) return 'var(--green)'; // actual < estimated = efficient
    if (gap > 0) return 'var(--amber)'; // actual > estimated = overran
    return 'var(--blue)';
  };

  const getTimelinessColor = (hours) => {
    if (hours === null || hours === undefined) return 'var(--text-muted)';
    if (hours > 24) return 'var(--green)';      // submitted > 1 day early
    if (hours > 0) return 'var(--blue)';        // submitted on day of deadline
    if (hours > -24) return 'var(--amber)';     // submitted within 24h after deadline
    return 'var(--red)';                        // submitted > 24h late
  };

  const formatHours = (hours) => {
    if (hours === null || hours === undefined) return '—';
    if (hours >= 24) return `${(hours / 24).toFixed(1)} days`;
    return `${hours.toFixed(1)} hrs`;
  };

  if (loading) {
    return (
      <div className="page active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="loading-spinner" style={{ width: '32px', height: '32px' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page active" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', gap: '1rem' }}>
        <div style={{ fontSize: '3rem' }}>⚠️</div>
        <h2 style={{ margin: 0 }}>Failed to load data</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>{error}</p>
        <button className="btn btn-primary" onClick={fetchGaps}>Retry</button>
      </div>
    );
  }

  const stats = {
    total: gaps.length,
    positiveConfidence: gaps.filter(g => (g.confidence_gap || 0) > 0).length,
    negativeConfidence: gaps.filter(g => (g.confidence_gap || 0) < 0).length,
    efficient: gaps.filter(g => (g.hours_gap || 0) < 0).length,
    overran: gaps.filter(g => (g.hours_gap || 0) > 0).length,
    early: gaps.filter(g => (g.hours_before_deadline || 0) > 0).length,
    late: gaps.filter(g => (g.hours_before_deadline || 0) < 0).length,
  };

  return (
    <div className="page active">
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">📝 Self-Assessment</h1>
          <p className="page-subtitle">Review your submission quality, time estimation accuracy, and deadline habits</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-card-label">Total Submissions</span>
            <span className="stat-card-icon">📃</span>
          </div>
          <div className="stat-card-value" style={{ fontSize: '2rem', color: 'var(--blue)' }}>{stats.total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-card-label">Exceeded Expectations</span>
            <span className="stat-card-icon">📈</span>
          </div>
          <div className="stat-card-value" style={{ fontSize: '2rem', color: 'var(--green)' }}>{stats.positiveConfidence}</div>
          <div className="stat-card-sub" style={{ color: 'var(--green)' }}>Quality &gt; Confidence</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-card-label">Underperformed</span>
            <span className="stat-card-icon">📉</span>
          </div>
          <div className="stat-card-value" style={{ fontSize: '2rem', color: 'var(--red)' }}>{stats.negativeConfidence}</div>
          <div className="stat-card-sub" style={{ color: 'var(--red)' }}>Quality &lt; Confidence</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-card-label">Efficient (Under Time)</span>
            <span className="stat-card-icon">⚡</span>
          </div>
          <div className="stat-card-value" style={{ fontSize: '2rem', color: 'var(--green)' }}>{stats.efficient}</div>
          <div className="stat-card-sub" style={{ color: 'var(--green)' }}>Actual &lt; Estimated</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-card-label">Overran Estimates</span>
            <span className="stat-card-icon">⏱️</span>
          </div>
          <div className="stat-card-value" style={{ fontSize: '2rem', color: 'var(--amber)' }}>{stats.overran}</div>
          <div className="stat-card-sub" style={{ color: 'var(--amber)' }}>Actual &gt; Estimated</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-card-label">On-Time / Early</span>
            <span className="stat-card-icon">⏰</span>
          </div>
          <div className="stat-card-value" style={{ fontSize: '2rem', color: 'var(--green)' }}>{stats.early}</div>
          <div className="stat-card-sub" style={{ color: 'var(--text-muted)' }}>{stats.late} late</div>
        </div>
      </div>

      {/* Filters & Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['all', 'positive', 'negative', 'overdue'].map(f => (
            <button
              key={f}
              className={`btn ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '12px', padding: '0.4rem 0.75rem' }}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : f === 'positive' ? '✅ Exceeded' : f === 'negative' ? '❌ Underperformed' : '⏰ Overdue'}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <label style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Sort by:</label>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="form-select" style={{ width: 'auto', padding: '0.4rem 0.75rem' }}>
            <option value="submitted_at">Submission Date</option>
            <option value="confidence_gap">Confidence Gap</option>
            <option value="hours_gap">Hours Gap</option>
            <option value="hours_before_deadline">Timeliness</option>
            <option value="node_title">Assessment Name</option>
          </select>
          <button className="btn btn-ghost btn-sm" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} style={{ padding: '0.4rem 0.5rem' }}>
            {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
          </button>
        </div>
      </div>

      {/* Gaps Table */}
      {filteredGaps.length === 0 ? (
        <div className="empty-state" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
          <h3 style={{ marginBottom: '0.5rem' }}>{filter === 'all' ? 'No submissions yet' : 'No matching submissions'}</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
            {filter === 'all'
              ? 'Submit assessments from your course roadmap to see your self-assessment analytics here.'
              : 'Try adjusting the filter to see more results.'}
          </p>
          {filter !== 'all' && <button className="btn btn-secondary" onClick={() => setFilter('all')}>Show All</button>}
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: 'var(--bg-tertiary)', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => { setSortBy('node_title'); setSortOrder(sortBy === 'node_title' && sortOrder === 'asc' ? 'desc' : 'asc'); }}>
                    Assessment {sortBy === 'node_title' ? (sortOrder === 'asc' ? ' ↑' : ' ↓') : ''}
                  </th>
                  <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontWeight: 600, cursor: 'pointer', userSelect: 'none', textAlign: 'center' }}
                    onClick={() => { setSortBy('confidence_gap'); setSortOrder(sortBy === 'confidence_gap' && sortOrder === 'asc' ? 'desc' : 'asc'); }}>
                    Confidence Gap {sortBy === 'confidence_gap' ? (sortOrder === 'asc' ? ' ↑' : ' ↓') : ''}
                  </th>
                  <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontWeight: 600, cursor: 'pointer', userSelect: 'none', textAlign: 'center' }}
                    onClick={() => { setSortBy('hours_gap'); setSortOrder(sortBy === 'hours_gap' && sortOrder === 'asc' ? 'desc' : 'asc'); }}>
                    Hours Gap {sortBy === 'hours_gap' ? (sortOrder === 'asc' ? ' ↑' : ' ↓') : ''}
                  </th>
                  <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontWeight: 600, cursor: 'pointer', userSelect: 'none', textAlign: 'center' }}
                    onClick={() => { setSortBy('hours_before_deadline'); setSortOrder(sortBy === 'hours_before_deadline' && sortOrder === 'asc' ? 'desc' : 'asc'); }}>
                    Timeliness {sortBy === 'hours_before_deadline' ? (sortOrder === 'asc' ? ' ↑' : ' ↓') : ''}
                  </th>
                  <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontWeight: 600, textAlign: 'center' }}>Quality</th>
                  <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontWeight: 600, textAlign: 'center' }}>Mood</th>
                  <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontWeight: 600, textAlign: 'center' }}>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {filteredGaps.map(gap => (
                  <tr key={gap.node_id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 500 }}>{gap.node_title}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Confidence at creation: {gap.confidence_at_creation ? `${gap.confidence_at_creation}/5` : 'N/A'}
                        {gap.estimated_hours && ` | Est: ${gap.estimated_hours} hrs`}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      {gap.confidence_gap !== null && gap.confidence_gap !== undefined ? (
                        <span style={{ fontWeight: 600, color: getConfidenceGapColor(gap.confidence_gap) }}>
                          {gap.confidence_gap > 0 ? '+' : ''}{gap.confidence_gap.toFixed(1)}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      {gap.hours_gap !== null && gap.hours_gap !== undefined ? (
                        <span style={{ fontWeight: 600, color: getHoursGapColor(gap.hours_gap) }}>
                          {gap.hours_gap > 0 ? '+' : ''}{gap.hours_gap.toFixed(1)} hrs
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      {gap.hours_before_deadline !== null && gap.hours_before_deadline !== undefined ? (
                        <span style={{ fontWeight: 600, color: getTimelinessColor(gap.hours_before_deadline) }}>
                          {gap.hours_before_deadline > 0 ? '✓ ' : ''}{formatHours(gap.hours_before_deadline)}
                          {gap.hours_before_deadline > 0 ? ' early' : gap.hours_before_deadline < 0 ? ' late' : ' on time'}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      {gap.quality_self_rating ? (
                        <span style={{ fontSize: '1.2rem' }}>
                          {'★'.repeat(gap.quality_self_rating)} {'☆'.repeat(5 - gap.quality_self_rating)}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      {gap.mood_energy ? (
                        <span style={{ fontSize: '1.2rem' }}>
                          {['😱', '😭', '😐', '😊', '😀'][gap.mood_energy - 1]}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                      {gap.submitted_at ? new Date(gap.submitted_at).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}