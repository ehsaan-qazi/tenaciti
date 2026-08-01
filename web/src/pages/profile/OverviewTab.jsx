import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function OverviewTab({ summary }) {
  if (!summary) return <div>Loading summary...</div>;

  const nodeCompletionRate = summary.total_nodes > 0 
    ? (summary.completed_nodes / summary.total_nodes) * 100 
    : 0;
  
  const completionData = [
    { name: 'Completed', value: summary.completed_nodes },
    { name: 'Pending', value: summary.total_nodes - summary.completed_nodes }
  ];
  const COLORS = ['#10b981', '#374151'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Profile Summary</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {/* Nodes Stat */}
        <div className="stat-card" style={cardStyle}>
          <div style={cardHeaderStyle}>Roadmap Nodes</div>
          <div style={cardValueStyle}>{summary.total_nodes}</div>
          <div style={cardSubStyle}>{summary.completed_nodes} completed ({nodeCompletionRate.toFixed(1)}%)</div>
          
          <div style={{ height: '80px', marginTop: '1rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={completionData} cx="50%" cy="50%" innerRadius={25} outerRadius={35} fill="#8884d8" paddingAngle={5} dataKey="value">
                  {completionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Time Stat */}
        <div className="stat-card" style={cardStyle}>
          <div style={cardHeaderStyle}>Average Time per Node</div>
          <div style={cardValueStyle}>{summary.avg_actual_hours !== null && summary.avg_actual_hours !== undefined ? `${summary.avg_actual_hours.toFixed(1)}h` : 'N/A'}</div>
          <div style={cardSubStyle}>Estimated: {summary.avg_estimated_hours !== null && summary.avg_estimated_hours !== undefined ? `${summary.avg_estimated_hours.toFixed(1)}h` : 'N/A'}</div>
        </div>

        {/* Topics Stat */}
        <div className="stat-card" style={cardStyle}>
          <div style={cardHeaderStyle}>Topics Coverage</div>
          <div style={cardValueStyle}>{summary.total_topics}</div>
          <div style={cardSubStyle}>
            {summary.completed_topics} fully covered ({
              summary.total_topics > 0 
                ? ((summary.completed_topics / summary.total_topics) * 100).toFixed(1) 
                : 0
            }%)
          </div>
        </div>

        {/* Notes Stat */}
        <div className="stat-card" style={cardStyle}>
          <div style={cardHeaderStyle}>Knowledge Base</div>
          <div style={cardValueStyle}>{summary.total_notes} notes</div>
          <div style={cardSubStyle}>{summary.total_note_links} connections</div>
        </div>
      </div>
    </div>
  );
}

const cardStyle = {
  background: 'var(--bg-elevated)',
  borderRadius: 'var(--radius-lg)',
  padding: '1.5rem',
  border: '1px solid var(--border)',
  display: 'flex',
  flexDirection: 'column'
};

const cardHeaderStyle = {
  fontSize: '0.875rem',
  color: 'var(--text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '0.5rem'
};

const cardValueStyle = {
  fontSize: '2rem',
  fontWeight: 700,
  color: 'var(--text-primary)'
};

const cardSubStyle = {
  fontSize: '0.875rem',
  color: 'var(--text-muted)',
  marginTop: '0.25rem'
};
