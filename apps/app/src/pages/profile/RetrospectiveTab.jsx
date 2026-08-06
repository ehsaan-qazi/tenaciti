import React, { useState } from 'react';
import { generateRetrospectiveReport } from '../../api/profileApi';

export default function RetrospectiveTab() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeframe, setTimeframe] = useState('all_time');

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const data = await generateRetrospectiveReport(timeframe);
      setReport(data);
    } catch (err) {
      console.error('Failed to generate report', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="no-print">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Retrospective Generator</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <select 
            value={timeframe} 
            onChange={e => setTimeframe(e.target.value)}
            style={{ 
              background: 'var(--bg-elevated)', border: '1px solid var(--border)', 
              color: 'var(--text-primary)', padding: '0.5rem 1rem', borderRadius: '8px' 
            }}
          >
            <option value="all_time">All Time</option>
            <option value="current_semester">Current Semester</option>
          </select>
          <button className="primary-btn" onClick={handleGenerate} disabled={loading} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
          {report && (
            <button className="secondary-btn" onClick={handlePrint} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
              🖨️ Print / PDF
            </button>
          )}
        </div>
      </div>

      {!report && !loading && (
        <div style={{ 
          textAlign: 'center', padding: '4rem 2rem', background: 'var(--bg-elevated)', 
          borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border)', color: 'var(--text-muted)' 
        }}>
          Select a timeframe and click Generate to build your retrospective report.
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
          Analyzing your study data...
        </div>
      )}

      {report && (
        <div className="print-area" style={{ 
          background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)', padding: '2rem', 
          border: '1px solid var(--border)' 
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>Study Retrospective</h1>
            <div style={{ color: 'var(--text-secondary)' }}>
              Generated on {new Date(report.generated_at).toLocaleDateString()} • {report.timeframe === 'all_time' ? 'All Time Overview' : 'Semester Overview'}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={statBoxStyle}>
              <div style={statLabelStyle}>Completion Rate</div>
              <div style={statValueStyle}>{report.overall_stats?.overall_completion_rate !== undefined ? `${report.overall_stats.overall_completion_rate.toFixed(1)}%` : 'N/A'}</div>
            </div>
            <div style={statBoxStyle}>
              <div style={statLabelStyle}>Longest Streak</div>
              <div style={statValueStyle}>{report.overall_stats?.longest_activity_streak || 0} days</div>
            </div>
            <div style={statBoxStyle}>
              <div style={statLabelStyle}>Nodes Completed</div>
              <div style={statValueStyle}>{report.overall_stats?.completed_nodes || 0}</div>
            </div>
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginTop: '2rem', marginBottom: '1rem', color: 'var(--blue)' }}>Qualitative Insights</h3>
          <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', color: 'var(--text-primary)', marginBottom: '2rem', lineHeight: 1.6 }}>
            {report.insights && report.insights.map((insight, idx) => (
              <li key={idx} style={{ marginBottom: '0.5rem' }}>{insight}</li>
            ))}
            {(!report.insights || report.insights.length === 0) && (
              <li style={{ color: 'var(--text-muted)' }}>No insights available yet.</li>
            )}
          </ul>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginTop: '2rem', marginBottom: '1rem', color: '#10b981' }}>Actionable Recommendations</h3>
          <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', color: 'var(--text-primary)', marginBottom: '2rem', lineHeight: 1.6 }}>
            {report.recommendations && report.recommendations.map((rec, idx) => (
              <li key={idx} style={{ marginBottom: '0.5rem' }}>{rec}</li>
            ))}
            {(!report.recommendations || report.recommendations.length === 0) && (
              <li style={{ color: 'var(--text-muted)' }}>No recommendations available yet.</li>
            )}
          </ul>

          {report.course_details && report.course_details.length > 0 && (
            <>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginTop: '2rem', marginBottom: '1rem' }}>Course Breakdown</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {report.course_details.map(course => (
                  <div key={course.course_id} style={{ 
                    padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', 
                    border: '1px solid rgba(255,255,255,0.05)' 
                  }}>
                    <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{course.course_name}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      Nodes: {course.nodes_completed} / {course.nodes_total} completed • 
                      Accuracy: {course.planning_accuracy_score !== null && course.planning_accuracy_score !== undefined ? `${course.planning_accuracy_score.toFixed(1)}%` : 'N/A'} • 
                      Notes: {course.notes_count}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

        </div>
      )}

      {/* Add print styles globally for this page */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background: white; color: black; }
          .no-print, nav, .sidebar { display: none !important; }
          .print-area { 
            background: white !important; 
            border: none !important; 
            padding: 0 !important;
            color: black !important;
          }
          .print-area * {
            color: black !important;
            text-shadow: none !important;
          }
        }
      `}} />
    </div>
  );
}

const statBoxStyle = {
  background: 'rgba(255,255,255,0.03)',
  padding: '1rem',
  borderRadius: '8px',
  border: '1px solid rgba(255,255,255,0.05)',
  textAlign: 'center'
};

const statLabelStyle = {
  fontSize: '0.875rem',
  color: 'var(--text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '0.5rem'
};

const statValueStyle = {
  fontSize: '2rem',
  fontWeight: 700,
  color: 'var(--text-primary)'
};
