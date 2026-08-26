import React, { useState } from 'react';
import PageHeader from '../components/layout/PageHeader';
import StatusBadge from '../components/ui/StatusBadge';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { SearchInput } from '../components/ui/SearchInput';
import { ErrorState } from '../components/ui/ErrorState';
import { Search, CheckCircle2, User, FileText } from 'lucide-react';
import { formatDate } from '../lib/utils';

export default function TrackingPage() {
  const [trackQuery, setTrackQuery] = useState('');
  const [trackedApp, setTrackedApp] = useState(null);
  const [trackError, setTrackError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTrackSubmit = async (e) => {
    e.preventDefault();
    setTrackError('');
    setTrackedApp(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/applications/track/${encodeURIComponent(trackQuery)}`);
      const data = await res.json();
      if (res.ok) {
        setTrackedApp(data);
      } else {
        setTrackError(data.detail || 'আবেদনটি খুঁজে পাওয়া যায়নি। ট্র্যাকিং কোড যাচাই করুন।');
      }
    } catch (e) {
      setTrackError('নেটওয়ার্ক ত্রুটি!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="ডিজিটাল আবেদন ট্র্যাকিং"
        description="আপনার জমাকৃত আবেদন আইডি (যেমন: APP-2026-8801) অথবা মোবাইল নম্বর দিয়ে লাইভ অবস্থান দেখুন"
      />

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <SearchInput
                value={trackQuery}
                onChange={(e) => setTrackQuery(e.target.value)}
                onClear={() => setTrackQuery('')}
                placeholder="আবেদন আইডি (যেমন: APP-2026-8801) অথবা মোবাইল নম্বর"
                className="max-w-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{loading ? 'খোঁজা হচ্ছে...' : 'আবেদন খুঁজুন'}</span>
            </button>
          </form>

          {trackError && (
            <div className="mt-4">
              <ErrorState title="আবেদন পাওয়া যায়নি" message={trackError} />
            </div>
          )}
        </CardContent>
      </Card>

      {trackedApp && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>{trackedApp.sub_service_name}</span>
                </CardTitle>
                <p className="text-xs text-slate-500 mt-1">
                  আবেদন আইডি: <strong className="text-slate-900 font-mono">{trackedApp.application_number}</strong> | আবেদনের তারিখ: {formatDate(trackedApp.created_at)}
                </p>
              </div>
              <StatusBadge status={trackedApp.status} />
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              আবেদনের অগ্রগতি টাইমলাইন (Application Timeline):
            </h4>

            <div className="relative pl-6 space-y-4 border-l-2 border-slate-200">
              {trackedApp.history.map((log) => (
                <div key={log.id} className="relative">
                  <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-white border-2 border-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1 text-xs">
                    <div className="flex items-center justify-between font-semibold text-slate-900">
                      <span>{log.action} ({log.new_status})</span>
                      <span className="text-[11px] text-slate-400 font-mono">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-600 font-normal">{log.remarks}</p>
                    {log.performed_by && (
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 pt-0.5">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>দায়িত্বপ্রাপ্ত কর্মকর্তা: {log.performed_by}</span>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
