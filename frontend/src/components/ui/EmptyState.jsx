import React from 'react';

export default function EmptyState({ icon = '📂', title = 'কোন তথ্য পাওয়া যায়নি', description = 'বর্তমানে প্রদর্শনের জন্য কোন ডেটা বা ফাইল তথ্য নেই।', actionLabel, onAction }) {
  return (
    <div style={{ textAlign: 'center', padding: '2.5rem 1rem', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '0.75rem', border: '1px border-dashed rgba(255, 255, 255, 0.1)' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{icon}</div>
      <h4 style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.35rem' }}>{title}</h4>
      <p style={{ color: '#94a3b8', fontSize: '0.85rem', maxWidth: '380px', margin: '0 auto 1.25rem auto' }}>{description}</p>
      {actionLabel && onAction && (
        <button className="btn-secondary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
