import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/layout/PageHeader';
import StatusBadge from '../components/ui/StatusBadge';
import StatCard from '../components/ui/StatCard';
import DataTable, { DataTableRow, DataTableCell } from '../components/ui/DataTable';
import { EmptyState } from '../components/ui/EmptyState';
import { FileText, Clock, CheckCircle2, Bookmark, Paperclip } from 'lucide-react';
import { formatDate } from '../lib/utils';

export default function MyApplicationsPage() {
  const { authToken, openAuthModal } = useAuth();
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);

  const fetchUserData = async () => {
    if (!authToken) return;
    const headers = { 'Authorization': `Bearer ${authToken}` };
    try {
      const [appsRes, statsRes] = await Promise.all([
        fetch('/api/applications/my-applications', { headers }),
        fetch('/api/citizens/stats', { headers })
      ]);
      if (appsRes.ok) setApplications(await appsRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (e) {}
  };

  useEffect(() => {
    fetchUserData();
  }, [authToken]);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="আমার আবেদনসমূহ"
        description="আপনার একাউন্ট থেকে জমাকৃত সকল সরকারি ও কৃষি সেবা আবেদন ও সংযুক্ত কাগজপত্র"
      />

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="মোট দাখিলকৃত আবেদন" value={stats.total_applications} icon={FileText} color="slate" />
          <StatCard title="পেন্ডিং প্রক্রিয়াধীন" value={stats.pending_applications} icon={Clock} color="amber" />
          <StatCard title="অনুমোদিত সেবা" value={stats.approved_applications} icon={CheckCircle2} color="emerald" />
          <StatCard title="বুকমার্ককৃত প্রিয় সেবা" value={stats.saved_services_count} icon={Bookmark} color="cyan" />
        </div>
      )}

      {!authToken ? (
        <EmptyState
          icon={FileText}
          title="লগইন প্রয়োজন"
          description="আপনার জমাকৃত আবেদন দেখতে সাইন-ইন করুন।"
          actionLabel="প্রবেশ করুন / সাইন-ইন"
          onAction={() => openAuthModal('login')}
        />
      ) : applications.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="কোন জমাকৃত আবেদন নেই"
          description="আপনি এখনও কোন সেবার জন্য অনলাইন আবেদন করেননি।"
        />
      ) : (
        <DataTable headers={["আবেদন আইডি", "সেবার নাম", "আবেদনকারী", "সংযুক্ত কাগজপত্র", "স্ট্যাটাস", "দায়িত্বপ্রাপ্ত কর্মকর্তা", "তারিখ"]}>
          {applications.map((app) => (
            <DataTableRow key={app.id}>
              <DataTableCell className="font-mono font-bold text-slate-900">{app.application_number}</DataTableCell>
              <DataTableCell className="font-semibold text-slate-900">{app.sub_service_name}</DataTableCell>
              <DataTableCell>{app.applicant_name} ({app.applicant_phone})</DataTableCell>
              <DataTableCell>
                {app.attached_documents ? (
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <Paperclip className="w-3 h-3" />
                    <span>{app.attached_documents}</span>
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400">নাই</span>
                )}
              </DataTableCell>
              <DataTableCell><StatusBadge status={app.status} /></DataTableCell>
              <DataTableCell className="text-slate-500">{app.assigned_officer_name || 'প্রক্রিয়াধীন'}</DataTableCell>
              <DataTableCell className="text-slate-500 text-[11px]">{formatDate(app.created_at)}</DataTableCell>
            </DataTableRow>
          ))}
        </DataTable>
      )}
    </div>
  );
}
