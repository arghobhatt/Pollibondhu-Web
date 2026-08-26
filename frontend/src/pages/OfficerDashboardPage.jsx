import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/layout/PageHeader';
import StatusBadge from '../components/ui/StatusBadge';
import StatCard from '../components/ui/StatCard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import DataTable, { DataTableRow, DataTableCell } from '../components/ui/DataTable';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { FormField, Select, Textarea } from '../components/ui/FormComponents';
import { ShieldCheck, FileCheck, Megaphone, CheckCircle2, ShieldAlert } from 'lucide-react';
import { formatDate } from '../lib/utils';

export default function OfficerDashboardPage() {
  const { authToken, isOfficer, openAuthModal } = useAuth();

  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [complaints, setComplaints] = useState([]);
  
  const [activeTab, setActiveTab] = useState('applications');
  const [statusFilter, setStatusFilter] = useState('all');

  const [selectedApp, setSelectedApp] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  
  const [newStatus, setNewStatus] = useState('Approved');
  const [officerRemarks, setOfficerRemarks] = useState('');
  const [updateError, setUpdateError] = useState('');
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const fetchOfficerStats = async () => {
    if (!authToken || !isOfficer) return;
    try {
      const res = await fetch('/api/officer/stats', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) setStats(await res.json());
    } catch (e) {}
  };

  const fetchApplications = async () => {
    if (!authToken || !isOfficer) return;
    try {
      const url = statusFilter && statusFilter !== 'all' ? `/api/officer/applications?status=${statusFilter}` : '/api/officer/applications';
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) setApplications(await res.json());
    } catch (e) {}
  };

  const fetchComplaints = async () => {
    if (!authToken || !isOfficer) return;
    try {
      const url = statusFilter && statusFilter !== 'all' ? `/api/officer/complaints?status=${statusFilter}` : '/api/officer/complaints';
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) setComplaints(await res.json());
    } catch (e) {}
  };

  useEffect(() => {
    if (authToken && isOfficer) {
      fetchOfficerStats();
      if (activeTab === 'applications') fetchApplications();
      if (activeTab === 'complaints') fetchComplaints();
    }
  }, [authToken, isOfficer, activeTab, statusFilter]);

  const handleAppStatusUpdate = async (e) => {
    e.preventDefault();
    setUpdateError('');
    setLoadingSubmit(true);
    try {
      const res = await fetch(`/api/officer/applications/${selectedApp.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          status: newStatus,
          remarks: officerRemarks
        })
      });
      if (res.ok) {
        setSelectedApp(null);
        setOfficerRemarks('');
        fetchOfficerStats();
        fetchApplications();
      } else {
        const data = await res.json();
        setUpdateError(data.detail || 'আবেদন হালনাগাদ করতে ব্যর্থ হয়েছে।');
      }
    } catch (e) {
      setUpdateError('নেটওয়ার্ক ত্রুটি!');
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleComplaintStatusUpdate = async (e) => {
    e.preventDefault();
    setUpdateError('');
    setLoadingSubmit(true);
    try {
      const res = await fetch(`/api/officer/complaints/${selectedComplaint.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          status: newStatus,
          remarks: officerRemarks
        })
      });
      if (res.ok) {
        setSelectedComplaint(null);
        setOfficerRemarks('');
        fetchOfficerStats();
        fetchComplaints();
      } else {
        const data = await res.json();
        setUpdateError(data.detail || 'অভিযোগ হালনাগাদ করতে ব্যর্থ হয়েছে।');
      }
    } catch (e) {
      setUpdateError('নেটওয়ার্ক ত্রুটি!');
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (!authToken) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="দায়িত্বপ্রাপ্ত কর্মকর্তা ড্যাশবোর্ড"
        description="কর্মকর্তা ড্যাশবোর্ডে প্রবেশের জন্য প্রথমে সরকারি কর্মকর্তা একাউন্টে সাইন-ইন করুন।"
        actionLabel="কর্মকর্তা সাইন-ইন করুন"
        onAction={() => openAuthModal('login')}
      />
    );
  }

  if (!isOfficer) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="অনুমতি সংরক্ষিত (Restricted Access)"
        description="এই এলাকাটি শুধুমাত্র দায়িত্বপ্রাপ্ত উপসহকারী কৃষি কর্মকর্তা ও উপজেলা প্রশাসনের জন্য সংরক্ষিত।"
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="উপজেলা কর্মকর্তা প্যানেল"
        description="আবেদন ফাইল অনুমোদন, নাগরিক অভিযোগ তদন্ত প্রতিবেদন দাখিল ও স্ট্যাটাস হালনাগাদ"
      />

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="দায়িত্বপ্রাপ্ত সেবা আবেদন" value={stats.assigned_applications_count} subtitle={`অপেক্ষমাণ: ${stats.pending_applications_count} | অনুমোদন: ${stats.approved_applications_count}`} icon={FileCheck} color="emerald" />
          <StatCard title="দায়িত্বপ্রাপ্ত নাগরিক অভিযোগ" value={stats.assigned_complaints_count} subtitle={`তদন্তাধীন: ${stats.pending_complaints_count} | মীমাংসিত: ${stats.resolved_complaints_count}`} icon={Megaphone} color="amber" />
          <StatCard title="মোট নিষ্পত্তিকৃত ফাইল" value={stats.approved_applications_count + stats.resolved_complaints_count} subtitle="স্বয়ংক্রিয় আপডেট ও বার্তা প্রেরিত" icon={CheckCircle2} color="cyan" />
        </div>
      )}

      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => { setActiveTab('applications'); setStatusFilter('all'); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'applications'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileCheck className="w-4 h-4 text-emerald-600" />
          <span>সেবা আবেদন ({applications.length})</span>
        </button>
        <button
          onClick={() => { setActiveTab('complaints'); setStatusFilter('all'); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'complaints'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Megaphone className="w-4 h-4 text-emerald-600" />
          <span>নাগরিক অভিযোগ ({complaints.length})</span>
        </button>
      </div>

      {activeTab === 'applications' && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle>নাগরিক সেবা আবেদনের তালিকা</CardTitle>
                <CardDescription>দায়িত্বপ্রাপ্ত সকল ফাইল পরিচালনা করুন</CardDescription>
              </div>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-48"
              >
                <option value="all">সকল অবস্থা</option>
                <option value="Pending">অপেক্ষমাণ (Pending)</option>
                <option value="In Progress">প্রক্রিয়াধীন (In Progress)</option>
                <option value="Approved">অনুমোদিত (Approved)</option>
                <option value="Rejected">বাতিল (Rejected)</option>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable headers={["আবেদন নম্বর", "আবেদনকারী", "মোবাইল", "সেবা বিষয়", "বর্তমান অবস্থা", "তারিখ", "কার্যক্রম"]}>
              {applications.map((app) => (
                <DataTableRow key={app.id}>
                  <DataTableCell className="font-mono font-bold text-slate-900">{app.application_number}</DataTableCell>
                  <DataTableCell className="font-semibold">{app.applicant_name}</DataTableCell>
                  <DataTableCell>{app.applicant_phone}</DataTableCell>
                  <DataTableCell>{app.sub_service_name}</DataTableCell>
                  <DataTableCell><StatusBadge status={app.status} /></DataTableCell>
                  <DataTableCell className="text-slate-500 text-[11px]">{formatDate(app.created_at)}</DataTableCell>
                  <DataTableCell>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedApp(app);
                        setNewStatus(app.status);
                        setOfficerRemarks(app.remarks || '');
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs transition-colors shadow-sm"
                    >
                      অ্যাকশন / আপডেট
                    </button>
                  </DataTableCell>
                </DataTableRow>
              ))}
            </DataTable>
          </CardContent>
        </Card>
      )}

      {activeTab === 'complaints' && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle>নাগরিক অভিযোগ ফাইলসমূহ</CardTitle>
                <CardDescription>অভিযোগ তদন্ত ও সমাধান পরিচালনা</CardDescription>
              </div>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-48"
              >
                <option value="all">সকল অবস্থা</option>
                <option value="Pending">অপেক্ষমাণ (Pending)</option>
                <option value="Under Investigation">তদন্তাধীন (Under Investigation)</option>
                <option value="Resolved">মীমাংসিত (Resolved)</option>
                <option value="Rejected">বাতিল (Rejected)</option>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable headers={["অভিযোগ আইডি", "অভিযোগকারী", "বিষয় / ক্যাটাগরি", "অবস্থা", "তারিখ", "কার্যক্রম"]}>
              {complaints.map((comp) => (
                <DataTableRow key={comp.id}>
                  <DataTableCell className="font-mono font-bold text-slate-900">{comp.complaint_number}</DataTableCell>
                  <DataTableCell className="font-semibold">{comp.complainant_name} ({comp.complainant_phone})</DataTableCell>
                  <DataTableCell>{comp.title || comp.category}</DataTableCell>
                  <DataTableCell><StatusBadge status={comp.status} /></DataTableCell>
                  <DataTableCell className="text-slate-500 text-[11px]">{formatDate(comp.created_at)}</DataTableCell>
                  <DataTableCell>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedComplaint(comp);
                        setNewStatus(comp.status);
                        setOfficerRemarks(comp.description || '');
                      }}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg text-xs transition-colors shadow-sm"
                    >
                      তদন্ত ও সমাধান
                    </button>
                  </DataTableCell>
                </DataTableRow>
              ))}
            </DataTable>
          </CardContent>
        </Card>
      )}

      <Modal
        isOpen={!!selectedApp}
        onClose={() => setSelectedApp(null)}
        title={`আবেদন সিদ্ধান্ত: ${selectedApp?.application_number || ''}`}
        subtitle={`আবেদনকারী: ${selectedApp?.applicant_name || ''}`}
      >
        {selectedApp && (
          <form onSubmit={handleAppStatusUpdate} className="space-y-4">
            {updateError && <p className="text-xs font-semibold text-rose-600">{updateError}</p>}

            <FormField label="আবেদন সিদ্ধান্ত">
              <Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                <option value="Approved">অনুমোদিত (Approved)</option>
                <option value="In Progress">প্রক্রিয়াধীন (In Progress)</option>
                <option value="Rejected">বাতিল (Rejected)</option>
              </Select>
            </FormField>

            <FormField label="কর্মকর্তার মন্তব্য / দাপ্তরিক নির্দেশ">
              <Textarea
                rows={3}
                value={officerRemarks}
                onChange={(e) => setOfficerRemarks(e.target.value)}
                placeholder="নাগরিকের জন্য দাপ্তরিক মন্তব্য লিখুন..."
              />
            </FormField>

            <button
              type="submit"
              disabled={loadingSubmit}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs transition-colors shadow-sm"
            >
              সিদ্ধান্ত সংরক্ষণ করুন
            </button>
          </form>
        )}
      </Modal>

      <Modal
        isOpen={!!selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        title={`অভিযোগ তদন্ত: ${selectedComplaint?.complaint_number || ''}`}
        subtitle={`অভিযোগকারী: ${selectedComplaint?.complainant_name || ''}`}
      >
        {selectedComplaint && (
          <form onSubmit={handleComplaintStatusUpdate} className="space-y-4">
            {updateError && <p className="text-xs font-semibold text-rose-600">{updateError}</p>}

            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed font-normal">
              বিবরণ: {selectedComplaint.description}
            </p>

            <FormField label="তদন্ত অবস্থা">
              <Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                <option value="Under Investigation">তদন্তাধীন (Under Investigation)</option>
                <option value="Resolved">মীমাংসিত (Resolved)</option>
                <option value="Rejected">বাতিল (Rejected)</option>
              </Select>
            </FormField>

            <FormField label="তদন্ত রিপোর্ট / কর্মকর্তার পর্যবেক্ষণ">
              <Textarea
                rows={3}
                value={officerRemarks}
                onChange={(e) => setOfficerRemarks(e.target.value)}
                placeholder="তদন্ত রিপোর্ট বা নিষ্পত্তির বিবরণ লিখুন..."
              />
            </FormField>

            <button
              type="submit"
              disabled={loadingSubmit}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg text-xs transition-colors shadow-sm"
            >
              তদন্ত ফল সংরক্ষণ করুন
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
}
