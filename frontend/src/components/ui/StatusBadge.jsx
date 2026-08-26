import React from 'react';
import { cn } from '../../lib/utils';
import { CheckCircle2, Clock, AlertCircle, XCircle } from 'lucide-react';

export default function StatusBadge({ status, className }) {
  const getStatusConfig = (statusStr) => {
    switch (statusStr) {
      case 'Approved':
      case 'Resolved':
      case 'সক্রিয়':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
          icon: CheckCircle2,
          label: statusStr === 'Approved' ? 'অনুমোদিত' : statusStr === 'Resolved' ? 'মীমাংসিত' : 'সক্রিয়'
        };
      case 'Pending':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200/80',
          icon: Clock,
          label: 'পেন্ডিং'
        };
      case 'In Progress':
      case 'Under Investigation':
        return {
          bg: 'bg-sky-50 text-sky-700 border-sky-200/80',
          icon: AlertCircle,
          label: statusStr === 'In Progress' ? 'প্রক্রিয়াধীন' : 'তদন্তাধীন'
        };
      case 'Rejected':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200/80',
          icon: XCircle,
          label: 'বাতিল'
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: Clock,
          label: statusStr || 'অজ্ঞাত'
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border shadow-subtle",
        config.bg,
        className
      )}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{config.label}</span>
    </span>
  );
}
