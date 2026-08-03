import React from 'react';

export default function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div className="glass-loading-screen">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px', flexDirection: 'column', gap: '16px' }}>
        <span className="spinner" style={{ borderTopColor: 'var(--primary)', width: '32px', height: '32px' }} />
        <p style={{ color: 'var(--on-surface-variant)' }}>{message}</p>
      </div>
    </div>
  );
}
