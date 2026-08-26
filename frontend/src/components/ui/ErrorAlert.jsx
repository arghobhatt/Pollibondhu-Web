import React from 'react';

export default function ErrorAlert({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div style={{
      background: 'rgba(239, 68, 68, 0.15)',
      border: '1px solid rgba(239, 68, 68, 0.4)',
      color: '#fca5a5',
      padding: '0.75rem 1rem',
      borderRadius: '0.5rem',
      fontSize: '0.85rem',
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>⚠️</span>
        <span>{message}</span>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{ background: 'transparent', border: 'none', color: '#fca5a5', cursor: 'pointer', fontWeight: 'bold' }}
        >
          ✕
        </button>
      )}
    </div>
  );
}
