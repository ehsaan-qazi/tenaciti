import React, { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../../api/client';

/**
 * UpcomingDeadlines - Shows overdue and upcoming roadmap node deadlines
 */
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
      Assignment: 'var(--purple)',
      Quiz: 'var(--blue)',
      Exam: 'var(--red)',
      Project: 'var(--amber)',
      Lab: 'var(--green)',
      Other: 'var(--text-secondary)',
    };
    return colors[type] || 'var(--text-secondary)';
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📅 Upcoming Deadlines</h3>
        </div>
        <div style={{ textAlign: 'center', padding: '1.5rem' }}>
          <span className="spinner" />
        </div>
      </div>
    );
  }

  const allItems = [...data.overdue, ...data.upcoming];

  if (allItems.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📅 Upcoming Deadlines</h3>
        </div>
        <div className="empty-state" style={{ padding: '1.5rem' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No upcoming deadlines. Add assessments to your roadmap!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">📅 Upcoming Deadlines</h3>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {data.overdue.length > 0 && (
          <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>
              ⚠️ Overdue ({data.overdue.length})
            </div>
            {data.overdue.map((item) => (
              <div key={item.id} className="deadline-row" style={{ background: 'var(--red-dim)', borderColor: 'rgba(248,113,113,0.2)' }}>
                <div className="deadline-dot" style={{ background: 'var(--red)' }} />
                <div className="deadline-info" style={{ flex: 1 }}>
                  <div className="deadline-title">{item.title}</div>
                  <div className="deadline-meta">
                    <span style={{ color: 'var(--red)', fontWeight: 600 }}>Overdue by {formatDays(item.days_until)}</span>
                    <span>•</span>
                    <span style={{ color: getNodeTypeColor(item.node_type) }}>{item.node_type}</span>
                    {item.weight_percent && <span>•</span>}
                    {item.weight_percent && <span>⚖️ {item.weight_percent}%</span>}
                    {item.is_placeholder && <span className="badge" style={{ background: 'var(--amber-dim)', color: 'var(--amber)' }}>⚠ Placeholder</span>}
                    {!item.is_confirmed && !item.is_placeholder && <span className="badge" style={{ background: 'var(--blue-dim)', color: 'var(--blue)' }}>Unconfirmed</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {data.upcoming.length > 0 && (
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>
              📅 Upcoming ({data.upcoming.length})
            </div>
            {data.upcoming.slice(0, 8).map((item) => (
              <div key={item.id} className="deadline-row">
                <div className="deadline-dot" style={{ background: getNodeTypeColor(item.node_type) }} />
                <div className="deadline-info" style={{ flex: 1 }}>
                  <div className="deadline-title">{item.title}</div>
                  <div className="deadline-meta">
                    <span style={{ color: item.days_until <= 2 ? 'var(--amber)' : 'var(--green)', fontWeight: 500 }}>
                      {item.days_until <= 2 ? '⏰ ' : ''}{formatDays(item.days_until)}
                    </span>
                    <span>•</span>
                    <span style={{ color: getNodeTypeColor(item.node_type) }}>{item.node_type}</span>
                    {item.weight_percent && <span>•</span>}
                    {item.weight_percent && <span>⚖️ {item.weight_percent}%</span>}
                    {item.is_placeholder && <span className="badge" style={{ background: 'var(--amber-dim)', color: 'var(--amber)' }}>⚠ Placeholder</span>}
                    {!item.is_confirmed && !item.is_placeholder && <span className="badge" style={{ background: 'var(--blue-dim)', color: 'var(--blue)' }}>Unconfirmed</span>}
                  </div>
                </div>
              </div>
            ))}
            {data.upcoming.length > 8 && (
              <div style={{ textAlign: 'center', padding: '0.5rem', color: 'var(--text-muted)', fontSize: '12px' }}>
                + {data.upcoming.length - 8} more upcoming...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * TopicCoverage - Per-course topic completion progress bars
 */
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
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📋 Topic Coverage</h3>
        </div>
        <div style={{ textAlign: 'center', padding: '1.5rem' }}>
          <span className="spinner" />
        </div>
      </div>
    );
  }

  if (data.courses.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📋 Topic Coverage</h3>
        </div>
        <div className="empty-state" style={{ padding: '1.5rem' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No topics extracted yet. Upload slides and extract topics (Pro) to track coverage.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">📋 Topic Coverage</h3>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {data.courses.map((course) => (
          <div key={course.course_id} className="course-coverage">
            <div className="course-coverage-top">
              <span className="course-coverage-name">{course.course_name} {course.course_code && `(${course.course_code})`}</span>
              <span className="course-coverage-count">{course.completed}/{course.total} ({course.progress_pct}%)</span>
            </div>
            <div className="progress-bar" style={{ height: '8px' }}>
              <div
                className="progress-fill"
                style={{
                  width: `${course.progress_pct}%`,
                  background: course.progress_pct === 100 ? 'linear-gradient(90deg, var(--green), var(--green-dim))' : 'linear-gradient(90deg, var(--purple), var(--purple-light))',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * WeeklyWorkload - Estimated hours due this week
 */
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

  const formatWeekStart = (dateStr) => {
    const d = new Date(dateStr);
    const end = new Date(d);
    end.setDate(d.getDate() + 6);
    return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📊 Weekly Workload</h3>
        </div>
        <div style={{ textAlign: 'center', padding: '1.5rem' }}>
          <span className="spinner" />
        </div>
      </div>
    );
  }

  if (!data || (data.this_week_hours === 0 && data.next_week_hours === 0)) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📊 Weekly Workload</h3>
        </div>
        <div className="empty-state" style={{ padding: '1.5rem' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No upcoming deadlines with estimated hours. Add estimates to your roadmap nodes!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">📊 Weekly Workload</h3>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div style={{ background: 'var(--bg-base)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>
            This Week ({formatWeekStart(data.week_start)})
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--purple)', lineHeight: 1.2 }}>
            {data.this_week_hours.toFixed(1)}h
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {data.this_week_items} assessment{data.this_week_items !== 1 ? 's' : ''} due
          </div>
        </div>
        <div style={{ background: 'var(--bg-base)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>
            Next Week
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--blue)', lineHeight: 1.2 }}>
            {data.next_week_hours.toFixed(1)}h
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {data.next_week_items} assessment{data.next_week_items !== 1 ? 's' : ''} due
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * StreakSummary - Activity and on-time streak cards
 */
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

  if (loading) {
    return (
      <div className="card" style={{ gridColumn: 'span 2' }}>
        <div style={{ textAlign: 'center', padding: '1.5rem' }}>
          <span className="spinner" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <>
      <div className="stat-card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔥</div>
        <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--amber)', lineHeight: 1 }}>{data.activity_streak}</div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Activity Streak</div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Longest: {data.longest_activity_streak} days</div>
      </div>
      <div className="stat-card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⏰</div>
        <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--green)', lineHeight: 1 }}>{data.on_time_streak}</div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>On-Time Streak</div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Longest: {data.longest_on_time_streak} submissions</div>
      </div>
    </>
  );
}

/**
 * StreakHeatmap - GitHub-style 12-week activity calendar
 */
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
    if (level === 0) return 'var(--bg-elevated)';
    if (level === 1) return 'rgba(124,106,247,0.25)';
    if (level === 2) return 'rgba(124,106,247,0.5)';
    if (level === 3) return 'rgba(124,106,247,0.75)';
    return 'var(--purple)';
  };

  const formatMonthLabel = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short' });
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📈 Activity Heatmap (12 weeks)</h3>
        </div>
        <div style={{ textAlign: 'center', padding: '1.5rem' }}>
          <span className="spinner" />
        </div>
      </div>
    );
  }

  if (!data || data.cells.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📈 Activity Heatmap (12 weeks)</h3>
        </div>
        <div className="empty-state" style={{ padding: '1.5rem' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No activity logged yet. Start using Tenaciti to build your streak!</p>
        </div>
      </div>
    );
  }

  // Group cells by week (7 days)
  const weeks = [];
  for (let i = 0; i < data.cells.length; i += 7) {
    weeks.push(data.cells.slice(i, i + 7));
  }

  // Get unique month labels for the top
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
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">📈 Activity Heatmap (12 weeks)</h3>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: '2px', minWidth: `${weeks.length * 12}px` }}>
          {/* Month labels */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingTop: '16px' }}>
            {monthLabels.map((m, idx) => (
              <div key={idx} style={{ height: '16px', fontSize: '10px', color: 'var(--text-muted)', textAlign: 'right', width: '40px', paddingRight: '8px' }}>
                {m.label}
              </div>
            ))}
          </div>
          {/* Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {[0, 1, 2, 3, 4, 5, 6].map((dayIdx) => (
              <div key={dayIdx} style={{ display: 'flex', gap: '2px' }}>
                {dayIdx === 0 && (
                  <div style={{ width: '48px', fontSize: '10px', color: 'var(--text-muted)', textAlign: 'right', paddingRight: '8px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    Mon
                  </div>
                )}
                {dayIdx === 3 && (
                  <div style={{ width: '48px', fontSize: '10px', color: 'var(--text-muted)', textAlign: 'right', paddingRight: '8px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    Thu
                  </div>
                )}
                {dayIdx === 6 && (
                  <div style={{ width: '48px', fontSize: '10px', color: 'var(--text-muted)', textAlign: 'right', paddingRight: '8px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    Sun
                  </div>
                )}
                {!([0, 3, 6].includes(dayIdx)) && (
                  <div style={{ width: '48px' }} />
                )}
                {weeks.map((week, weekIdx) => {
                  const cell = week[dayIdx];
                  if (!cell) return <div key={`${weekIdx}-${dayIdx}`} style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'transparent' }} />;
                  return (
                    <div
                      key={`${weekIdx}-${dayIdx}`}
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '2px',
                        background: getLevelColor(cell.level),
                        cursor: 'help',
                      }}
                      title={`${cell.date}: ${cell.count} action${cell.count !== 1 ? 's' : ''}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', fontSize: '11px', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <div key={level} style={{ width: '12px', height: '12px', borderRadius: '2px', background: getLevelColor(level) }} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}