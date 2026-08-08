import React from 'react';

export default function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div className="glass-loading-screen" style={{ 
      minHeight: '100vh', 
      background: 'var(--background, #f8f9fa)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
        <span className="spinner" style={{ width: '32px', height: '32px' }} />
        <p style={{ color: 'var(--on-surface-variant, #444748)', fontSize: '16px', fontFamily: 'Hanken Grotesk, sans-serif' }}>{message}</p>
      </div>
    </div>
  );
}
