import React, { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../../api/client';

export function UpcomingDeadlines() {
  const [data, setData] = useState({ overdue: [], upcoming: [] });
  const [loading, setLoading] = useState(true);

  const fetchDeadlines = useCallback(async () => {
    try {
      const result = await apiFetch('/streaks/deadlines?days_ahead=14');
      setData(result);
    } catch (err) {
      console.error('Failed to fetch deadlines:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeadlines();
  }, [fetchDeadlines]);

  const formatDays = (days) => {
    if (days < 0) return `${Math.abs(days).toFixed(1)} days ago`;
    if (days < 1) return 'Due today';
    if (days < 2) return 'Tomorrow';
    return `in ${days.toFixed(1)} days`;
  };

  const getNodeTypeColor = (type) => {
    const colors = {
      Assignment: 'var(--secondary)',
      Quiz: 'var(--gradient-start)',
      Exam: 'var(--error)',
      Project: 'var(--gradient-end)',
      Lab: 'var(--success)',
      Other: 'var(--on-surface-variant)',
    };
    return colors[type] || 'var(--on-surface-variant)';
  };

  if (loading) {
    return (
      <div className="glass-card" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="spinner" />
      </div>
    );
  }

  const allItems = [...data.overdue, ...data.upcoming];

  if (allItems.length === 0) {
    return (
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: 'var(--primary)' }}>Upcoming Deadlines</h3>
        </div>
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--on-surface-variant)' }}>
          <p>No upcoming deadlines. Add assessments to your roadmap!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: 'var(--primary)' }}>Upcoming Deadlines</h3>
        <button style={{ background: 'none', border: 'none', color: 'var(--secondary)', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}>View All</button>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {data.overdue.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--error)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              Overdue ({data.overdue.length})
            </div>
            {data.overdue.map((item) => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--error-container)', borderRadius: '12px', marginBottom: '8px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--surface-container-lowest)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--error)' }}>warning</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', color: 'var(--primary)', marginBottom: '2px' }}>{item.title}</div>
                  <div style={{ fontSize: '13px', color: 'var(--on-error-container)' }}>
                    Overdue by {formatDays(item.days_until)} • {item.node_type}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {data.upcoming.length > 0 && (
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              Upcoming ({data.upcoming.length})
            </div>
            {data.upcoming.slice(0, 8).map((item) => {
              const color = getNodeTypeColor(item.node_type);
              return (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', transition: 'background 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-container)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `color-mix(in srgb, ${color} 15%, transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span className="material-symbols-outlined" style={{ color }}>event</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', color: 'var(--primary)', marginBottom: '2px' }}>{item.title}</div>
                    <div style={{ fontSize: '13px', color: 'var(--on-surface-variant)' }}>
                      {formatDays(item.days_until)} • {item.node_type}
                    </div>
                  </div>
                  {item.weight_percent && (
                    <div style={{ fontSize: '12px', fontWeight: '500', background: 'var(--surface-container-high)', padding: '4px 8px', borderRadius: '4px', color: 'var(--on-surface-variant)' }}>
                      {item.weight_percent}%
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export function TopicCoverage() {
  const [data, setData] = useState({ courses: [] });
  const [loading, setLoading] = useState(true);

  const fetchCoverage = useCallback(async () => {
    try {
      const result = await apiFetch('/streaks/topic-coverage');
      setData(result);
    } catch (err) {
      console.error('Failed to fetch topic coverage:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoverage();
  }, [fetchCoverage]);

  if (loading) {
    return (
      <div className="glass-card" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="spinner" />
      </div>
    );
  }

  return (
    <div className="glass-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: 'var(--primary)' }}>Topic Coverage</h3>
      </div>
      
      {data.courses.length === 0 ? (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--on-surface-variant)' }}>
          <p>No topics extracted yet. Upload slides and extract topics (Pro) to track coverage.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {data.courses.map((course, idx) => (
            <div key={course.course_id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: '500', color: 'var(--primary)' }}>{course.course_code || course.course_name}</span>
                </div>
                <span style={{ fontSize: '14px', fontFamily: 'JetBrains Mono', color: 'var(--on-surface-variant)' }}>
                  {course.completed}/{course.total} ({course.progress_pct}%)
                </span>
              </div>
              <div style={{ height: '8px', width: '100%', background: 'var(--surface-container)', borderRadius: '9999px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${course.progress_pct}%`,
                    background: course.progress_pct === 100 
                      ? 'var(--success)' 
                      : `linear-gradient(90deg, var(--gradient-start), var(--gradient-mid))`,
                    borderRadius: '9999px',
                    transition: 'width 0.5s ease'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function WeeklyWorkload() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchWorkload = useCallback(async () => {
    try {
      const result = await apiFetch('/streaks/weekly-workload');
      setData(result);
    } catch (err) {
      console.error('Failed to fetch workload:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkload();
  }, [fetchWorkload]);

  if (loading) {
    return (
      <div className="glass-card" style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="spinner" />
      </div>
    );
  }

  if (!data || (data.this_week_hours === 0 && data.next_week_hours === 0)) {
    return (
      <div className="glass-card">
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: 'var(--primary)' }}>Weekly Workload</h3>
        <p style={{ color: 'var(--on-surface-variant)' }}>No upcoming deadlines with estimated hours.</p>
      </div>
    );
  }

  return (
    <div className="glass-card">
      <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: 'var(--primary)' }}>Weekly Workload</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{ background: 'var(--surface-container)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>This Week</span>
          <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary)', marginBottom: '4px' }}>{data.this_week_hours.toFixed(1)}<span style={{ fontSize: '16px', color: 'var(--on-surface-variant)' }}>h</span></div>
          <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>{data.this_week_items} assessment(s)</span>
        </div>
        <div style={{ background: 'var(--surface-container-high)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Next Week</span>
          <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary)', marginBottom: '4px' }}>{data.next_week_hours.toFixed(1)}<span style={{ fontSize: '16px', color: 'var(--on-surface-variant)' }}>h</span></div>
          <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>{data.next_week_items} assessment(s)</span>
        </div>
      </div>
    </div>
  );
}

export function StreakSummaryCards() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = useCallback(async () => {
    try {
      const result = await apiFetch('/streaks/summary');
      setData(result);
    } catch (err) {
      console.error('Failed to fetch streak summary:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  if (loading || !data) {
    return (
      <div style={{ display: 'flex', gap: '24px' }}>
        <div className="glass-card" style={{ flex: 1, height: '160px', animation: 'pulse 2s infinite' }} />
        <div className="glass-card" style={{ flex: 1, height: '160px', animation: 'pulse 2s infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      <div className="glass-card" style={{ background: 'var(--surface-container-lowest)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', background: 'radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <span style={{ fontSize: '24px', marginBottom: '8px' }}>🔥</span>
        <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--gradient-end)', lineHeight: 1, marginBottom: '4px' }}>{data.activity_streak}</div>
        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--primary)', marginBottom: '2px' }}>Activity Streak</div>
        <div style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>Best: {data.longest_activity_streak} days</div>
      </div>
      
      <div className="glass-card" style={{ background: 'var(--surface-container-lowest)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', background: 'radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <span style={{ fontSize: '24px', marginBottom: '8px' }}>🎯</span>
        <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--success)', lineHeight: 1, marginBottom: '4px' }}>{data.on_time_streak}</div>
        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--primary)', marginBottom: '2px' }}>On-Time Submissions</div>
        <div style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>Best: {data.longest_on_time_streak} items</div>
      </div>
    </div>
  );
}

export function StreakHeatmap() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchHeatmap = useCallback(async () => {
    try {
      const result = await apiFetch('/streaks/heatmap');
      setData(result);
    } catch (err) {
      console.error('Failed to fetch heatmap:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHeatmap();
  }, [fetchHeatmap]);

  const getLevelColor = (level) => {
    if (level === 0) return 'var(--surface-container)';
    if (level === 1) return 'color-mix(in srgb, var(--secondary) 25%, var(--surface-container))';
    if (level === 2) return 'color-mix(in srgb, var(--secondary) 50%, var(--surface-container))';
    if (level === 3) return 'color-mix(in srgb, var(--secondary) 75%, var(--surface-container))';
    return 'var(--secondary)';
  };

  const formatMonthLabel = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short' });
  };

  if (loading) {
    return (
      <div className="glass-card" style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="spinner" />
      </div>
    );
  }

  if (!data || data.cells.length === 0) {
    return (
      <div className="glass-card">
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: 'var(--primary)' }}>Activity Heatmap</h3>
        <p style={{ color: 'var(--on-surface-variant)' }}>No activity logged yet.</p>
      </div>
    );
  }

  const weeks = [];
  for (let i = 0; i < data.cells.length; i += 7) {
    weeks.push(data.cells.slice(i, i + 7));
  }

  const monthLabels = [];
  weeks.forEach((week, weekIdx) => {
    const firstDay = week[0];
    const lastDay = week[week.length - 1];
    const firstMonth = new Date(firstDay.date).getMonth();
    const lastMonth = new Date(lastDay.date).getMonth();
    if (weekIdx === 0 || firstMonth !== new Date(weeks[weekIdx - 1][0].date).getMonth()) {
      monthLabels.push({ week: weekIdx, label: formatMonthLabel(firstDay.date) });
    }
  });

  return (
    <div className="glass-card">
      <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: 'var(--primary)' }}>Activity Heatmap</h3>
      <div style={{ overflowX: 'auto', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '4px', minWidth: `${weeks.length * 16}px` }}>
          {/* Month labels */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingTop: '16px' }}>
            {monthLabels.map((m, idx) => (
              <div key={idx} style={{ height: '16px', fontSize: '12px', color: 'var(--on-surface-variant)', textAlign: 'right', width: '40px', paddingRight: '12px' }}>
                {m.label}
              </div>
            ))}
          </div>
          {/* Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[0, 1, 2, 3, 4, 5, 6].map((dayIdx) => (
              <div key={dayIdx} style={{ display: 'flex', gap: '4px' }}>
                {dayIdx === 0 && <div style={{ width: '48px', fontSize: '12px', color: 'var(--on-surface-variant)', textAlign: 'right', paddingRight: '12px' }}>Mon</div>}
                {dayIdx === 3 && <div style={{ width: '48px', fontSize: '12px', color: 'var(--on-surface-variant)', textAlign: 'right', paddingRight: '12px' }}>Thu</div>}
                {dayIdx === 6 && <div style={{ width: '48px', fontSize: '12px', color: 'var(--on-surface-variant)', textAlign: 'right', paddingRight: '12px' }}>Sun</div>}
                {!([0, 3, 6].includes(dayIdx)) && <div style={{ width: '48px' }} />}
                {weeks.map((week, weekIdx) => {
                  const cell = week[dayIdx];
                  if (!cell) return <div key={`${weekIdx}-${dayIdx}`} style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'transparent' }} />;
                  return (
                    <div
                      key={`${weekIdx}-${dayIdx}`}
                      style={{ width: '12px', height: '12px', borderRadius: '3px', background: getLevelColor(cell.level), cursor: 'help', transition: 'transform 0.1s' }}
                      title={`${cell.date}: ${cell.count} action(s)`}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', fontSize: '12px', color: 'var(--on-surface-variant)' }}>
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <div key={level} style={{ width: '12px', height: '12px', borderRadius: '3px', background: getLevelColor(level) }} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}