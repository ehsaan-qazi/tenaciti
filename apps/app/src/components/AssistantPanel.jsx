import React from 'react';

/**
 * AssistantPanel — Slot reservation for future Tenaciti AI Assistant.
 * Currently renders nothing / reserved zero-width slot per Milestone 7 specifications.
 */
export default function AssistantPanel({ isOpen = false, onClose }) {
  if (!isOpen) return null;

  return (
    <aside
      className="assistant-panel"
      style={{
        width: '400px',
        height: '100vh',
        backgroundColor: 'var(--surface-container-low)',
        borderLeft: '1px solid var(--outline-variant)',
        display: 'none',
      }}
      aria-label="AI Assistant"
    >
      {/* Reserved for future AI Assistant panel */}
    </aside>
  );
}
