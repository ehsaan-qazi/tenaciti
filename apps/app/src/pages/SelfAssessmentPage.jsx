import React, { useState, useEffect, useMemo } from 'react';
import { apiFetch } from '../api/client';
import LoadingScreen from '../components/LoadingScreen';

export default function SelfAssessmentPage() {
  const [gaps, setGaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Controls state
  const [filter, setFilter] = useState('all'); // all, exceeded, underperformed, overdue
  const [sortBy, setSortBy] = useState('submitted_at'); // submitted_at, quality_gap, hours_gap
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  // ─── COMPUTED STATS ─────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = gaps.length;
    const exceeded = gaps.filter(g => (g.confidence_gap || 0) > 0).length;
    const underperformed = gaps.filter(g => (g.confidence_gap || 0) < 0).length;
    
    // Average hours saved (efficient) or extra (overran)
    const efficientGaps = gaps.filter(g => (g.hours_gap || 0) < 0);
    const efficientCount = efficientGaps.length;
    const avgHoursSaved = efficientCount > 0 
      ? Math.abs(efficientGaps.reduce((acc, g) => acc + (g.hours_gap || 0), 0) / efficientCount).toFixed(1)
      : 0;

    const overranGaps = gaps.filter(g => (g.hours_gap || 0) > 0);
    const overranCount = overranGaps.length;
    const avgHoursExtra = overranCount > 0
      ? (overranGaps.reduce((acc, g) => acc + (g.hours_gap || 0), 0) / overranCount).toFixed(1)
      : 0;

    const onTimeOrEarly = gaps.filter(g => (g.hours_before_deadline || 0) >= 0).length;

    return {
      total,
      exceeded,
      exceededPct: total ? Math.round((exceeded / total) * 100) : 0,
      underperformed,
      underperformedPct: total ? Math.round((underperformed / total) * 100) : 0,
      efficientCount,
      avgHoursSaved,
      overranCount,
      avgHoursExtra,
      onTimeOrEarly,
      onTimePct: total ? Math.round((onTimeOrEarly / total) * 100) : 0,
    };
  }, [gaps]);

  // ─── FILTER & SORT ─────────────────────────────────────────────────────────────
  const filteredAndSortedGaps = useMemo(() => {
    let result = [...gaps];

    // Filter
    if (filter === 'exceeded') {
      result = result.filter(g => (g.confidence_gap || 0) > 0);
    } else if (filter === 'underperformed') {
      result = result.filter(g => (g.confidence_gap || 0) < 0);
    } else if (filter === 'overdue') {
      result = result.filter(g => g.hours_before_deadline !== null && g.hours_before_deadline < 0);
    }

    // Sort
    result.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      // Map logical sort keys to actual fields if needed
      if (sortBy === 'quality_gap') { aVal = a.confidence_gap; bVal = b.confidence_gap; }
      
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      
      const dir = sortOrder === 'asc' ? 1 : -1;
      return aVal > bVal ? dir : (aVal < bVal ? -dir : 0);
    });

    return result;
  }, [gaps, filter, sortBy, sortOrder]);

  // ─── PAGINATION ─────────────────────────────────────────────────────────────
  const totalPages = Math.ceil(filteredAndSortedGaps.length / itemsPerPage) || 1;
  const currentData = filteredAndSortedGaps.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // ─── HELPERS ─────────────────────────────────────────────────────────────
  const formatTimeliness = (hours) => {
    if (hours === null || hours === undefined) return { label: '—', style: {} };
    if (hours >= 24) return { label: `${Math.round(hours / 24)} days early`, style: { bg: 'var(--surface-container-high)', text: 'var(--on-surface)' } };
    if (hours > 0) return { label: 'On Time', style: { bg: 'var(--surface-container-high)', text: 'var(--on-surface)' } };
    if (hours === 0) return { label: 'Deadline Day', style: { bg: 'var(--surface-container-high)', text: 'var(--on-surface)' } };
    return { label: `${Math.abs(Math.round(hours))} hr late`, style: { bg: 'var(--error-container)', text: 'var(--on-error-container)' } };
  };

  const getConfGapStyle = (gap) => {
    if (gap > 0) return { bg: 'rgba(34, 197, 94, 0.1)', text: 'var(--success)', icon: 'arrow_upward', sign: '+' };
    if (gap < 0) return { bg: 'rgba(239, 68, 68, 0.1)', text: 'var(--error)', icon: 'arrow_downward', sign: '' };
    return { bg: 'rgba(245, 158, 11, 0.1)', text: 'var(--gradient-end)', icon: 'horizontal_rule', sign: '' };
  };

  const getHrsGapStyle = (gap) => {
    if (gap < 0) return { bg: 'rgba(124, 58, 237, 0.1)', text: 'var(--gradient-start)', icon: 'timer', sign: '' };
    if (gap > 0) return { bg: 'rgba(245, 158, 11, 0.1)', text: 'var(--gradient-end)', icon: 'timer', sign: '+' };
    return { bg: 'var(--surface-container-high)', text: 'var(--on-surface-variant)', icon: 'timer', sign: '' };
  };

  const renderStars = (rating) => {
    const stars = [];
    const full = Math.floor(rating || 0);
    const half = (rating || 0) % 1 >= 0.5;
    for (let i = 0; i < 5; i++) {
      if (i < full) stars.push(<span key={i} className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>);
      else if (i === full && half) stars.push(<span key={i} className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star_half</span>);
      else stars.push(<span key={i} className="material-symbols-outlined text-outline-variant">star</span>);
    }
    return stars;
  };

  // Mock mood generator based on quality gap
  const getMockMood = (gap) => {
    if (gap === null || gap === undefined) return '😐';
    if (gap >= 10) return '🤩';
    if (gap > 0) return '😀';
    if (gap === 0) return '😊';
    if (gap >= -10) return '😐';
    if (gap >= -20) return '😭';
    return '🤯';
  };

  // ─── RENDER ─────────────────────────────────────────────────────────────
  if (loading) return <LoadingScreen message="Loading Self-Assessment Data..." />;

  if (error) {
    return (
      <div className="sa-page" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--error)' }}>error</span>
        <h2 style={{ margin: '16px 0 8px' }}>Failed to load data</h2>
        <p style={{ color: 'var(--on-surface-variant)', maxWidth: '400px' }}>{error}</p>
        <button className="notes-action-btn primary" style={{ background: 'var(--primary)', color: 'var(--on-primary)', marginTop: '16px', padding: '12px 24px' }} onClick={fetchGaps}>Retry</button>
      </div>
    );
  }

  return (
    <div className="sa-page">
      {/* Ambient Background Elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-start/10 rounded-full blur-[120px] -z-10 pointer-events-none translate-x-1/3 -translate-y-1/3" style={{ background: 'rgba(124, 58, 237, 0.1)' }}></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-end/10 rounded-full blur-[100px] -z-10 pointer-events-none -translate-x-1/4 translate-y-1/4" style={{ background: 'rgba(245, 158, 11, 0.1)' }}></div>
      
      {/* Header Section */}
      <div className="sa-header">
        <h1>📝 Self-Assessment</h1>
        <p>Review your submission quality, time estimation accuracy, and deadline habits to refine your study strategies.</p>
      </div>

      {/* Summary Stats Grid */}
      <div className="sa-stats-grid">
        
        {/* Stat 1: Total */}
        <div className="sa-stat-card group">
          <div className="glow-blob" style={{ background: 'var(--primary-fixed)' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative', zIndex: 10 }}>
            <div className="sa-stat-card-icon">📃</div>
            <span style={{ fontSize: '14px', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--on-surface-variant)', fontWeight: 500 }}>Total Submissions</span>
          </div>
          <div style={{ fontSize: '48px', fontWeight: 700, color: 'var(--primary)', lineHeight: 1.1, marginTop: '8px', position: 'relative', zIndex: 10 }}>{stats.total}</div>
        </div>

        {/* Stat 2: Exceeded */}
        <div className="sa-stat-card group">
          <div className="glow-blob" style={{ background: 'rgba(34, 197, 94, 0.1)' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative', zIndex: 10 }}>
            <div className="sa-stat-card-icon">📈</div>
            <span style={{ fontSize: '14px', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--on-surface-variant)', fontWeight: 500 }}>Exceeded Expectations</span>
          </div>
          <div style={{ fontSize: '48px', fontWeight: 700, color: 'var(--primary)', lineHeight: 1.1, marginTop: '8px', position: 'relative', zIndex: 10 }}>{stats.exceeded}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 'auto', position: 'relative', zIndex: 10 }}>
            <div style={{ flex: 1, height: '8px', background: 'var(--surface-container)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${stats.exceededPct}%`, background: 'var(--success)', borderRadius: '999px' }}></div>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)', fontWeight: 500 }}>{stats.exceededPct}%</span>
          </div>
        </div>

        {/* Stat 3: Underperformed */}
        <div className="sa-stat-card group">
          <div className="glow-blob" style={{ background: 'rgba(239, 68, 68, 0.1)' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative', zIndex: 10 }}>
            <div className="sa-stat-card-icon">📉</div>
            <span style={{ fontSize: '14px', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--on-surface-variant)', fontWeight: 500 }}>Underperformed</span>
          </div>
          <div style={{ fontSize: '48px', fontWeight: 700, color: 'var(--primary)', lineHeight: 1.1, marginTop: '8px', position: 'relative', zIndex: 10 }}>{stats.underperformed}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 'auto', position: 'relative', zIndex: 10 }}>
            <div style={{ flex: 1, height: '8px', background: 'var(--surface-container)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${stats.underperformedPct}%`, background: 'var(--error)', borderRadius: '999px' }}></div>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)', fontWeight: 500 }}>{stats.underperformedPct}%</span>
          </div>
        </div>

        {/* Stat 4: Efficient */}
        <div className="sa-stat-card group">
          <div className="glow-blob" style={{ background: 'rgba(124, 58, 237, 0.1)' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative', zIndex: 10 }}>
            <div className="sa-stat-card-icon">⚡</div>
            <span style={{ fontSize: '14px', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--on-surface-variant)', fontWeight: 500 }}>Efficient (Beat Est.)</span>
          </div>
          <div style={{ fontSize: '48px', fontWeight: 700, color: 'var(--primary)', lineHeight: 1.1, marginTop: '8px', position: 'relative', zIndex: 10 }}>{stats.efficientCount}</div>
          <div style={{ marginTop: 'auto', position: 'relative', zIndex: 10 }}>
            <span style={{ fontSize: '12px', color: 'var(--gradient-start)', fontWeight: 600 }}>Avg. {stats.avgHoursSaved} hrs saved</span>
          </div>
        </div>

        {/* Stat 5: Overran */}
        <div className="sa-stat-card group">
          <div className="glow-blob" style={{ background: 'rgba(245, 158, 11, 0.1)' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative', zIndex: 10 }}>
            <div className="sa-stat-card-icon">⏱️</div>
            <span style={{ fontSize: '14px', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--on-surface-variant)', fontWeight: 500 }}>Overran Estimates</span>
          </div>
          <div style={{ fontSize: '48px', fontWeight: 700, color: 'var(--primary)', lineHeight: 1.1, marginTop: '8px', position: 'relative', zIndex: 10 }}>{stats.overranCount}</div>
          <div style={{ marginTop: 'auto', position: 'relative', zIndex: 10 }}>
            <span style={{ fontSize: '12px', color: 'var(--gradient-end)', fontWeight: 600 }}>Avg. {stats.avgHoursExtra} hrs extra</span>
          </div>
        </div>

        {/* Stat 6: On Time */}
        <div className="sa-stat-card group">
          <div className="glow-blob" style={{ background: 'rgba(113, 42, 226, 0.1)' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative', zIndex: 10 }}>
            <div className="sa-stat-card-icon">⏰</div>
            <span style={{ fontSize: '14px', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--on-surface-variant)', fontWeight: 500 }}>On-Time / Early</span>
          </div>
          <div style={{ fontSize: '48px', fontWeight: 700, color: 'var(--primary)', lineHeight: 1.1, marginTop: '8px', position: 'relative', zIndex: 10 }}>{stats.onTimeOrEarly}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 'auto', position: 'relative', zIndex: 10 }}>
            <div style={{ flex: 1, height: '8px', background: 'var(--surface-container)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${stats.onTimePct}%`, background: 'var(--secondary)', borderRadius: '999px' }}></div>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)', fontWeight: 500 }}>{stats.onTimePct}%</span>
          </div>
        </div>

      </div>

      {/* Filters & Controls Bar */}
      <div className="sa-filters-bar">
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', width: '100%' }}>
          <button 
            onClick={() => { setFilter('all'); setCurrentPage(1); }}
            style={{ padding: '8px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', border: 'none', transition: '0.2s', background: filter === 'all' ? 'var(--primary)' : 'var(--surface-container)', color: filter === 'all' ? 'var(--on-primary)' : 'var(--on-surface)' }}
          >All</button>
          <button 
            onClick={() => { setFilter('exceeded'); setCurrentPage(1); }}
            style={{ padding: '8px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', border: 'none', transition: '0.2s', display: 'flex', alignItems: 'center', gap: '8px', background: filter === 'exceeded' ? 'var(--primary)' : 'var(--surface-container)', color: filter === 'exceeded' ? 'var(--on-primary)' : 'var(--on-surface)' }}
          ><span style={{ color: filter === 'exceeded' ? 'var(--success)' : 'var(--success)' }}>✅</span> Exceeded</button>
          <button 
            onClick={() => { setFilter('underperformed'); setCurrentPage(1); }}
            style={{ padding: '8px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', border: 'none', transition: '0.2s', display: 'flex', alignItems: 'center', gap: '8px', background: filter === 'underperformed' ? 'var(--primary)' : 'var(--surface-container)', color: filter === 'underperformed' ? 'var(--on-primary)' : 'var(--on-surface)' }}
          ><span style={{ color: filter === 'underperformed' ? 'var(--error)' : 'var(--error)' }}>❌</span> Underperformed</button>
          <button 
            onClick={() => { setFilter('overdue'); setCurrentPage(1); }}
            style={{ padding: '8px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', border: 'none', transition: '0.2s', display: 'flex', alignItems: 'center', gap: '8px', background: filter === 'overdue' ? 'var(--primary)' : 'var(--surface-container)', color: filter === 'overdue' ? 'var(--on-primary)' : 'var(--on-surface)' }}
          ><span style={{ color: filter === 'overdue' ? 'var(--gradient-end)' : 'var(--gradient-end)' }}>⏰</span> Overdue</button>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 'max-content' }}>
          <div style={{ position: 'relative' }}>
            <select 
              value={sortBy} 
              onChange={e => setSortBy(e.target.value)}
              style={{ appearance: 'none', background: 'var(--surface-container)', border: 'none', borderRadius: '12px', padding: '8px 40px 8px 16px', fontSize: '14px', fontWeight: 500, color: 'var(--on-surface)', outline: 'none', cursor: 'pointer' }}
            >
              <option value="submitted_at">Sort by Date</option>
              <option value="quality_gap">Sort by Quality Gap</option>
              <option value="hours_gap">Sort by Hrs Gap</option>
            </select>
            <span className="material-symbols-outlined" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--on-surface-variant)', pointerEvents: 'none', fontSize: '18px' }}>unfold_more</span>
          </div>
          <button 
            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            style={{ padding: '8px', borderRadius: '12px', background: 'var(--surface-container)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--on-surface)' }}
            title="Toggle Sort Order"
          >
            <span className="material-symbols-outlined" style={{ transform: sortOrder === 'asc' ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}>swap_vert</span>
          </button>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="sa-table-container">
        <div className="sa-table-wrapper">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Assessment</th>
                <th>Conf. Gap</th>
                <th>Hrs Gap</th>
                <th>Timeliness</th>
                <th>Quality</th>
                <th>Mood</th>
                <th>Submitted</th>
                <th style={{ width: '40px' }}></th>
              </tr>
            </thead>
            <tbody>
              {currentData.length > 0 ? currentData.map((gap) => {
                const confStyle = getConfGapStyle(gap.confidence_gap);
                const hrsStyle = getHrsGapStyle(gap.hours_gap);
                const timeliness = formatTimeliness(gap.hours_before_deadline);

                return (
                  <tr key={gap.id || Math.random()} className="sa-table-row group">
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--primary)', transition: 'color 0.2s' }}>{gap.assessment_title || 'Unnamed Assessment'}</span>
                        <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>Est. Conf: {gap.estimated_confidence || 0}% • Est. Hrs: {gap.estimated_hours || 0}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: confStyle.bg, color: confStyle.text, padding: '4px 8px', borderRadius: '6px', fontSize: '14px', fontWeight: 500 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{confStyle.icon}</span> 
                        {confStyle.sign}{gap.confidence_gap !== null ? `${gap.confidence_gap}%` : '—'}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: hrsStyle.bg, color: hrsStyle.text, padding: '4px 8px', borderRadius: '6px', fontSize: '14px', fontWeight: 500 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{hrsStyle.icon}</span> 
                        {hrsStyle.sign}{gap.hours_gap !== null ? `${gap.hours_gap}h` : '—'}
                      </div>
                    </td>
                    <td>
                      <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '999px', background: timeliness.style.bg, color: timeliness.style.text, fontSize: '12px', fontWeight: 500 }}>
                        {timeliness.label}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', color: 'var(--gradient-end)', fontSize: '18px' }}>
                        {renderStars(gap.actual_quality)}
                      </div>
                    </td>
                    <td style={{ fontSize: '24px' }}>
                      {getMockMood(gap.confidence_gap)}
                    </td>
                    <td>
                      <span style={{ fontSize: '16px', color: 'var(--on-surface-variant)' }}>
                        {gap.submitted_at ? new Date(gap.submitted_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </span>
                    </td>
                    <td>
                      <button style={{ background: 'none', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer', opacity: 0.5, transition: '0.2s' }} className="group-hover:opacity-100 hover:text-primary">
                        <span className="material-symbols-outlined">more_vert</span>
                      </button>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: 'var(--on-surface-variant)' }}>No self-assessment records found for these filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        {filteredAndSortedGaps.length > 0 && (
          <div style={{ padding: '16px', borderTop: '1px solid rgba(196, 199, 199, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.3)' }}>
            <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)', fontWeight: 500 }}>
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredAndSortedGaps.length)}-{Math.min(currentPage * itemsPerPage, filteredAndSortedGaps.length)} of {filteredAndSortedGaps.length} assessments
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{ padding: '8px', borderRadius: '8px', border: 'none', background: 'transparent', cursor: currentPage === 1 ? 'default' : 'pointer', color: currentPage === 1 ? 'var(--surface-variant)' : 'var(--on-surface-variant)' }}
              ><span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chevron_left</span></button>
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{ padding: '8px', borderRadius: '8px', border: 'none', background: 'transparent', cursor: currentPage === totalPages ? 'default' : 'pointer', color: currentPage === totalPages ? 'var(--surface-variant)' : 'var(--on-surface-variant)' }}
              ><span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chevron_right</span></button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}