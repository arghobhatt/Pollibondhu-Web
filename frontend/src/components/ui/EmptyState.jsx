import React from 'react';
import { cn } from '../../lib/utils';
import { FolderOpen } from 'lucide-react';

export function EmptyState({
  icon: Icon = FolderOpen,
  title = "কোন তথ্য পাওয়া যায়নি",
  description = "বর্তমানে দেখানোর মতো কোন রেকর্ড বা তথ্য নেই।",
  actionLabel,
  onAction,
  className
}) {
  return (
    <div className={cn("p-12 text-center bg-white rounded-xl border border-slate-200/80 shadow-subtle flex flex-col items-center justify-center space-y-3", className)}>
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
        <Icon className="w-6 h-6 stroke-[1.75]" />
      </div>
      <div className="space-y-1 max-w-sm">
        <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
        <p className="text-xs text-slate-500 font-normal leading-relaxed">{description}</p>
      </div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          type="button"
          className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg transition-colors shadow-sm"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
