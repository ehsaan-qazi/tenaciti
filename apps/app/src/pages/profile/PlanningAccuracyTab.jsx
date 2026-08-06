import React from 'react';

export default function PlanningAccuracyTab({ data }) {
  if (!data) return <div>Loading planning accuracy...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Planning & Accuracy</h2>
      
      <div style={{
        background: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
        border: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Overall Accuracy</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {data.overall_accuracy_score !== null && data.overall_accuracy_score !== undefined ? `${data.overall_accuracy_score.toFixed(1)}%` : 'N/A'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total Gap</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: data.overall_hours_gap > 0 ? '#ef4444' : '#10b981' }}>
              {data.overall_hours_gap > 0 ? '+' : ''}{data.overall_hours_gap !== null && data.overall_hours_gap !== undefined ? `${data.overall_hours_gap.toFixed(1)}h` : 'N/A'}
            </div>
          </div>
        </div>

        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Course Breakdown</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                <th style={{ padding: '0.75rem' }}>Course</th>
                <th style={{ padding: '0.75rem' }}>Nodes</th>
                <th style={{ padding: '0.75rem' }}>Estimated</th>
                <th style={{ padding: '0.75rem' }}>Actual</th>
                <th style={{ padding: '0.75rem' }}>Accuracy</th>
              </tr>
            </thead>
            <tbody>
              {data.courses && data.courses.map((course) => (
                <tr key={course.course_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.75rem', fontWeight: 500 }}>{course.course_name}</td>
                  <td style={{ padding: '0.75rem' }}>{course.submitted_nodes} / {course.total_nodes}</td>
                  <td style={{ padding: '0.75rem' }}>{course.avg_estimated_hours !== null && course.avg_estimated_hours !== undefined ? `${course.avg_estimated_hours.toFixed(1)}h` : '-'}</td>
                  <td style={{ padding: '0.75rem' }}>{course.avg_actual_hours !== null && course.avg_actual_hours !== undefined ? `${course.avg_actual_hours.toFixed(1)}h` : '-'}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ 
                        flex: 1, 
                        height: '8px', 
                        background: 'rgba(255,255,255,0.1)', 
                        borderRadius: '4px',
                        overflow: 'hidden' 
                      }}>
                        <div style={{ 
                          height: '100%', 
                          width: course.accuracy_score !== null && course.accuracy_score !== undefined ? `${Math.min(100, Math.max(0, course.accuracy_score))}%` : '0%', 
                          background: course.accuracy_score > 80 ? '#10b981' : course.accuracy_score > 50 ? '#f59e0b' : '#ef4444' 
                        }} />
                      </div>
                      <span style={{ fontSize: '0.875rem' }}>{course.accuracy_score !== null && course.accuracy_score !== undefined ? `${course.accuracy_score.toFixed(1)}%` : 'N/A'}</span>
                    </div>
                  </td>
                </tr>
              ))}
              {(!data.courses || data.courses.length === 0) && (
                <tr>
                  <td colSpan="5" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No planning data available yet.
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
