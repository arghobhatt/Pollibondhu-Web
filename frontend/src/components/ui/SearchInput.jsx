import React from 'react';
import { cn } from '../../lib/utils';
import { Search, X } from 'lucide-react';

export function SearchInput({ value, onChange, onClear, placeholder = "অনুসন্ধান করুন...", className }) {
  return (
    <div className={cn("relative w-full max-w-md", className)}>
      <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-subtle"
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-2.5 top-2.5 p-0.5 text-slate-400 hover:text-slate-600 rounded-full"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
