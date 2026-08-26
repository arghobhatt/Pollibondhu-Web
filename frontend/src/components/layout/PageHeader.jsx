import React from 'react';
import { cn } from '../../lib/utils';

export default function PageHeader({ title, description, badge, action, className }) {
  return (
    <div className={cn("bg-white border border-slate-200/80 rounded-xl p-5 shadow-subtle mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4", className)}>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
          {badge && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs text-slate-500 font-normal leading-relaxed">{description}</p>
        )}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
