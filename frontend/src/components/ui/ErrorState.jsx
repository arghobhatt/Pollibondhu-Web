import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';

export function ErrorState({ title = "ত্রুটি ঘটেছে", message = "অনুরোধটি সম্পন্ন করা সম্ভব হয়নি।", onRetry, className }) {
  return (
    <div className={cn("p-6 bg-rose-50 border border-rose-200 rounded-xl text-center space-y-3", className)}>
      <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mx-auto">
        <AlertCircle className="w-5 h-5" />
      </div>
      <div>
        <h4 className="text-xs font-bold text-rose-900">{title}</h4>
        <p className="text-xs text-rose-700 mt-0.5">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          type="button"
          className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs rounded-lg transition-colors inline-flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>পুনরায় চেষ্টা করুন</span>
        </button>
      )}
    </div>
  );
}
