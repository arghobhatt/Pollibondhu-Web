import React from 'react';
import { Layers } from 'lucide-react';

export default function PatternTag({ name }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-mono font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 shadow-sm">
      <Layers className="w-3 h-3 text-emerald-400" />
      {name}
    </span>
  );
}
