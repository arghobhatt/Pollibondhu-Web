import React from 'react';
import { cn } from '../../lib/utils';
import { Filter } from 'lucide-react';

export function FilterBar({ children, className }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3 p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 mb-4", className)}>
      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 pr-2 border-r border-slate-200">
        <Filter className="w-3.5 h-3.5 text-slate-400" />
        <span>ফিল্টার:</span>
      </div>
      <div className="flex flex-wrap items-center gap-2 flex-1">
        {children}
      </div>
    </div>
  );
}
