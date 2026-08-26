import React from 'react';
import { cn, formatDate } from '../../lib/utils';
import { Bell, Check } from 'lucide-react';

export function NotificationItem({ title, message, createdAt, channel, isRead, onMarkRead }) {
  return (
    <div
      className={cn(
        "p-4 rounded-xl border transition-all flex items-start justify-between gap-3",
        isRead
          ? "bg-white border-slate-200/80 text-slate-600"
          : "bg-emerald-50/50 border-emerald-200 text-slate-900 font-medium"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
          isRead ? "bg-slate-100 text-slate-400" : "bg-emerald-100 text-emerald-700"
        )}>
          <Bell className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-semibold text-slate-900">{title}</h4>
          <p className="text-xs text-slate-600 font-normal leading-relaxed">{message}</p>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono pt-0.5">
            <span>{formatDate(createdAt)}</span>
            <span>•</span>
            <span className="uppercase">{channel}</span>
          </div>
        </div>
      </div>

      {!isRead && onMarkRead && (
        <button
          onClick={onMarkRead}
          type="button"
          className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium rounded-lg transition-colors shrink-0 flex items-center gap-1 shadow-subtle"
        >
          <Check className="w-3.5 h-3.5" />
          <span>পড়া হয়েছে</span>
        </button>
      )}
    </div>
  );
}
