import React from 'react';
import { cn } from '../../lib/utils';

export default function StatCard({ title, value, subtitle, icon: Icon, trend, color = 'emerald', className }) {
  const colorMap = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 icon-bg-emerald',
    cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200/60',
    amber: 'bg-amber-50 text-amber-700 border-amber-200/60',
    rose: 'bg-rose-50 text-rose-700 border-rose-200/60',
    slate: 'bg-slate-50 text-slate-700 border-slate-200/60',
  };

  const iconColorMap = {
    emerald: 'bg-emerald-100 text-emerald-700',
    cyan: 'bg-cyan-100 text-cyan-700',
    amber: 'bg-amber-100 text-amber-700',
    rose: 'bg-rose-100 text-rose-700',
    slate: 'bg-slate-100 text-slate-700',
  };

  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-slate-200/80 p-5 shadow-subtle flex flex-col justify-between transition-all hover:shadow-card hover:border-slate-300",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <span className="text-xs font-medium text-slate-500">{title}</span>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">{value}</div>
        </div>
        {Icon && (
          <div className={cn("p-2.5 rounded-xl flex items-center justify-center shrink-0", iconColorMap[color] || iconColorMap.emerald)}>
            <Icon className="w-5 h-5 stroke-[2]" />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{subtitle}</span>
          {trend && (
            <span className="font-semibold text-emerald-600">
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
