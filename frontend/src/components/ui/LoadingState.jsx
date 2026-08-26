import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export function LoadingState({ message = "তথ্য লোড হচ্ছে...", className }) {
  return (
    <div className={cn("p-12 text-center flex flex-col items-center justify-center space-y-3", className)}>
      <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      <p className="text-xs font-medium text-slate-500">{message}</p>
    </div>
  );
}
