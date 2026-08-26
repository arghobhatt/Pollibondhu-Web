import React from 'react';
import { cn } from '../../lib/utils';
import { Star, ArrowRight, Clock, Banknote } from 'lucide-react';

export default function ServiceCard({
  title,
  description,
  processingDays,
  fee,
  isSaved,
  onToggleSave,
  onApply,
  className
}) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-slate-200/80 p-5 shadow-subtle flex flex-col justify-between transition-all hover:shadow-card hover:border-emerald-300 group",
        className
      )}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-semibold text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors">
            {title}
          </h4>
          {onToggleSave && (
            <button
              onClick={onToggleSave}
              className="p-1 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition-colors shrink-0"
              type="button"
            >
              <Star className={cn("w-4 h-4", isSaved && "fill-amber-400 text-amber-500")} />
            </button>
          )}
        </div>

        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal">
          {description}
        </p>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{processingDays} কার্যদিবস</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-slate-700">
            <Banknote className="w-3.5 h-3.5 text-emerald-600" />
            <span>{fee === 0 ? 'বিনামূল্যে' : `${fee} ৳`}</span>
          </div>
        </div>
      </div>

      <button
        onClick={onApply}
        type="button"
        className="w-full mt-4 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
      >
        <span>আবেদন করুন</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
