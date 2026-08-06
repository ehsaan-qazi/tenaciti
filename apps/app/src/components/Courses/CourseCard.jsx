import React from 'react';

export default function CourseCard({ course, onClick }) {
  const colors = ['var(--secondary)', 'var(--gradient-start)', 'var(--gradient-end)', 'var(--primary)', 'var(--error)', 'var(--success)'];
  const colorIndex = course.id % colors.length;
  const accent = colors[colorIndex];

  return (
    <div
      className="glass-card"
      onClick={onClick}
      style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: `color-mix(in srgb, ${accent} 15%, transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span className="material-symbols-outlined" style={{ color: accent, fontSize: '28px' }}>
            auto_stories
          </span>
        </div>
        <button style={{ background: 'none', border: 'none', color: 'var(--on-surface-variant)' }}>
          <span className="material-symbols-outlined">more_vert</span>
        </button>
      </div>
      <div style={{ flex: 1 }}>
        <h3 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: '600', color: 'var(--primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {course.name}
        </h3>
        <span style={{ fontSize: '14px', fontFamily: 'JetBrains Mono', color: 'var(--on-surface-variant)' }}>
          {course.code || '—'}
        </span>
      </div>
      <div style={{ marginTop: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--on-surface-variant)' }}>Progress</span>
          <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--primary)' }}>0%</span>
        </div>
        <div style={{ height: '8px', width: '100%', background: 'var(--surface-container)', borderRadius: '9999px', overflow: 'hidden', marginBottom: '16px' }}>
          <div style={{ height: '100%', width: '0%', background: accent, borderRadius: '9999px' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--surface-container-high)', paddingTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--on-surface-variant)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>description</span>
            <span style={{ fontSize: '12px', fontWeight: '500' }}>{course.doc_upload_count || 0} Docs</span>
          </div>
        </div>
      </div>
    </div>
  );
}
