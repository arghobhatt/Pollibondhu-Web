import React from 'react';

export default function LoadingSpinner({ message = 'তথ্য সংগৃহীত হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem' }}>
      <div style={{
        width: '36px',
        height: '36px',
        border: '3px solid rgba(16, 185, 129, 0.2)',
        borderTop: '3px solid #10b981',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        marginBottom: '1rem'
      }}></div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{message}</p>
    </div>
  );
}
