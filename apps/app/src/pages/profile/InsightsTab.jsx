import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function InsightsTab({ procrastination, noteDensity }) {
  if (!procrastination || !noteDensity) return <div>Loading insights...</div>;

  const buckets = [
    { name: '0-6h', value: procrastination.bucket_0_6h, label: 'Last Minute (< 6h)' },
    { name: '6-24h', value: procrastination.bucket_6_24h, label: 'Same Day (6-24h)' },
    { name: '1-3d', value: procrastination.bucket_1_3d, label: 'Short Term (1-3d)' },
    { name: '3-7d', value: procrastination.bucket_3_7d, label: 'Medium Term (3-7d)' },
    { name: '7d+', value: procrastination.bucket_7d_plus, label: 'Long Term (> 7d)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Procrastination Fingerprint */}
      <section>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Procrastination Fingerprint</h2>
        <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginBottom: '1.5rem' }}>
            <div style={{ flex: '1 1 200px' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Archetype</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--purple-light)' }}>
                {procrastination.interpretation}
              </div>
            </div>
            <div style={{ flex: '1 1 120px' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Median Lead Time</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                {procrastination.median_hours_before_deadline !== null && procrastination.median_hours_before_deadline !== undefined ? `${procrastination.median_hours_before_deadline.toFixed(1)}h` : 'N/A'}
              </div>
            </div>
            <div style={{ flex: '1 1 120px' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>On Time Rate</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: procrastination.on_time_rate > 80 ? '#10b981' : '#f59e0b' }}>
                {procrastination.on_time_rate !== null && procrastination.on_time_rate !== undefined ? `${procrastination.on_time_rate.toFixed(1)}%` : 'N/A'}
              </div>
            </div>
          </div>
          
          <div style={{ height: '200px', marginTop: '1rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={buckets} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} 
                  formatter={(value) => [`${value} submissions`, 'Count']}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {buckets.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index < 2 ? '#f59e0b' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Note Density Correlation */}
      <section>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Note Density & Insights</h2>
        <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: '1px solid var(--border)' }}>
          <div style={{ marginBottom: '1.5rem', background: 'rgba(59,130,246,0.1)', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
            <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.5 }}>
              {noteDensity.summary}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Notes ↔ Grades (Pearson r)</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{noteDensity.correlation_notes_vs_grade !== null && noteDensity.correlation_notes_vs_grade !== undefined ? noteDensity.correlation_notes_vs_grade.toFixed(3) : 'N/A'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Links ↔ Grades</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{noteDensity.correlation_links_vs_grade !== null && noteDensity.correlation_links_vs_grade !== undefined ? noteDensity.correlation_links_vs_grade.toFixed(3) : 'N/A'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Notes ↔ Quality</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{noteDensity.correlation_notes_vs_quality !== null && noteDensity.correlation_notes_vs_quality !== undefined ? noteDensity.correlation_notes_vs_quality.toFixed(3) : 'N/A'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Links ↔ Quality</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{noteDensity.correlation_links_vs_quality !== null && noteDensity.correlation_links_vs_quality !== undefined ? noteDensity.correlation_links_vs_quality.toFixed(3) : 'N/A'}</div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
