import React from 'react';
import { cn } from '../../lib/utils';

export function Label({ className, children, required, ...props }) {
  return (
    <label className={cn("block text-xs font-semibold text-slate-700 mb-1.5", className)} {...props}>
      {children}
      {required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
  );
}

export function Input({ className, type = "text", ...props }) {
  return (
    <input
      type={type}
      className={cn(
        "w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 disabled:bg-slate-50 disabled:text-slate-500 transition-all shadow-subtle",
        className
      )}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }) {
  return (
    <select
      className={cn(
        "w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 disabled:bg-slate-50 disabled:text-slate-500 transition-all shadow-subtle cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Textarea({ className, rows = 3, ...props }) {
  return (
    <textarea
      rows={rows}
      className={cn(
        "w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 disabled:bg-slate-50 disabled:text-slate-500 transition-all shadow-subtle",
        className
      )}
      {...props}
    />
  );
}

export function FormField({ label, required, children, error, className }) {
  return (
    <div className={cn("space-y-1", className)}>
      {label && <Label required={required}>{label}</Label>}
      {children}
      {error && <p className="text-[11px] text-rose-600 font-medium pt-0.5">{error}</p>}
    </div>
  );
}
