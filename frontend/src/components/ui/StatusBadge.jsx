import React from 'react';

export default function StatusBadge({ status }) {
  if (!status) return null;

  const normalized = status.toString().toLowerCase();

  let badgeClass = 'status-badge-pending';
  let label = status;

  if (['approved', 'resolved', 'paid', 'completed', 'active'].includes(normalized)) {
    badgeClass = 'status-badge-approved';
  } else if (['rejected', 'failed', 'cancelled', 'inactive'].includes(normalized)) {
    badgeClass = 'status-badge-rejected';
  } else if (['in progress', 'under investigation', 'processing'].includes(normalized)) {
    badgeClass = 'status-badge-pending';
  }

  return (
    <span className={badgeClass}>
      {label}
    </span>
  );
}
