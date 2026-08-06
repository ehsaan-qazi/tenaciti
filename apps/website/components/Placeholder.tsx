import React from 'react';

export function Placeholder({ type, label, className = '' }: {
  type: 'screenshot' | 'video' | 'testimonial' | 'logo' | 'stat' | 'image';
  label: string;
  className?: string;
}) {
  const icons = {
    screenshot: '📷',
    video: '🎥',
    testimonial: '💬',
    logo: '🏢',
    stat: '📈',
    image: '🖼️',
  };

  return (
    <div className={`placeholder placeholder--${type} ${className}`} style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--surface-sunken, #f8f9fa)',
      border: '2px dashed var(--surface-border, #ccc)',
      borderRadius: '8px',
      padding: '2rem',
      color: 'var(--on-surface-variant, #666)',
      textAlign: 'center',
      minHeight: '200px',
    }}>
      <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{icons[type]}</div>
      <p style={{ fontWeight: '500', marginBottom: '0.5rem' }}>{label}</p>
      <span style={{ 
        fontSize: '0.75rem', 
        fontWeight: 'bold', 
        background: 'var(--surface-border, #e0e0e0)', 
        padding: '0.25rem 0.5rem', 
        borderRadius: '4px',
        letterSpacing: '0.05em'
      }}>COMING SOON</span>
    </div>
  );
}
