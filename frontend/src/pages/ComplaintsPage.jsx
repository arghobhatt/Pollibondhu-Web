import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/layout/PageHeader';
import StatusBadge from '../components/ui/StatusBadge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import DataTable, { DataTableRow, DataTableCell } from '../components/ui/DataTable';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { FormField, Input, Select, Textarea } from '../components/ui/FormComponents';
import { Megaphone, Plus, Eye, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { formatDate } from '../lib/utils';

export default function ComplaintsPage() {
  const { currentUser, authToken, isOfficer, openAuthModal } = useAuth();

  const [complaints, setComplaints] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [category, setCategory] = useState('সার সংকট');
  const [description, setDescription] = useState('');
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState('');
  const [submitError, setSubmitError] = useState('');

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState('Under Investigation');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [statusUpdateMsg, setStatusUpdateMsg] = useState('');

  const fetchComplaints = async () => {
    if (!authToken) return;
    const headers = { 'Authorization': `Bearer ${authToken}` };
    const url = isOfficer ? '/api/complaints' : '/api/complaints/my-complaints';
    try {
      const res = await fetch(url, { headers });
      if (res.ok) setComplaints(await res.json());
    } catch (e) {}
  };

  useEffect(() => {
    fetchComplaints();
  }, [authToken, currentUser]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!authToken) {
      openAuthModal('login');
      return;
    }
    setSubmitSuccessMsg('');
    setSubmitError('');

    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ category, description })
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitSuccessMsg(`অভিযোগ সফলভাবে নিবন্ধিত হয়েছে! ট্র্যাকিং আইডি: ${data.complaint_number}`);
        fetchComplaints();
        setTimeout(() => {
          setIsCreateModalOpen(false);
          setSubmitSuccessMsg('');
          setDescription('');
        }, 1600);
      } else {
        setSubmitError(data.detail || 'অভিযোগ জমা দেওয়া সম্ভব হয়নি।');
      }
    } catch (e) {
      setSubmitError('নেটওয়ার্ক ত্রুটি!');
    }
  };

  const handleStatusUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedComplaint || !authToken) return;
    setStatusUpdateMsg('');
    try {
      const res = await fetch(`/api/complaints/${selectedComplaint.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          new_status: newStatus,
          resolution_notes: resolutionNotes
        })
      });
      const data = await res.json();
      if (res.ok) {
        setStatusUpdateMsg('অভিযোগের অবস্থা ও পর্যবেক্ষণ সফলভাবে আপডেট করা হয়েছে!');
        setSelectedComplaint(data);
        fetchComplaints();
      } else {
        setStatusUpdateMsg(data.detail || 'আপডেট ব্যর্থ হয়েছে।');
      }
    } catch (e) {
      setStatusUpdateMsg('নেটওয়ার্ক ত্রুটি!');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="নাগরিক অভিযোগ ও প্রতিকার পোর্টাল"
        description="কৃষি সার বিতরণ, সেচ সুবিধা বা অনিয়ম সংক্রান্ত অভিযোগ দাখিল ও সমাধান লাইভ ট্র্যাকিং"
        action={
          <button
            onClick={() => {
              if (!authToken) openAuthModal('login');
              else setIsCreateModalOpen(true);
            }}
            type="button"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন অভিযোগ দাখিল করুন</span>
          </button>
        }
      />

      {!authToken ? (
        <EmptyState
          icon={Megaphone}
          title="লগইন প্রয়োজন"
          description="আপনার জমাকৃত অভিযোগের স্থিতি ও ট্র্যাকিং দেখতে অনুগ্রহ করে সাইন-ইন করুন।"
          actionLabel="প্রবেশ করুন / সাইন-ইন"
          onAction={() => openAuthModal('login')}
        />
      ) : complaints.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="কোন জমাকৃত অভিযোগ পাওয়া যায়নি"
          description="আপনি এখনও কোন অভিযোগ রেজিস্টার করেননি।"
        />
      ) : (
        <DataTable headers={["অভিযোগ আইডি", "ক্যাটাগরি", "অভিযোগকারী", "বিবরণ", "স্ট্যাটাস", "তারিখ", "অ্যাকশন"]}>
          {complaints.map((c) => (
            <DataTableRow key={c.id}>
              <DataTableCell className="font-mono font-bold text-slate-900">{c.complaint_number}</DataTableCell>
              <DataTableCell className="font-semibold">{c.category}</DataTableCell>
              <DataTableCell>{c.complainant_name || 'নাগরিক'} ({c.complainant_phone || 'N/A'})</DataTableCell>
              <DataTableCell className="max-w-xs truncate">{c.description}</DataTableCell>
              <DataTableCell><StatusBadge status={c.status} /></DataTableCell>
              <DataTableCell className="text-slate-500 text-[11px]">{formatDate(c.created_at)}</DataTableCell>
              <DataTableCell>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedComplaint(c);
                    setNewStatus(c.status);
                    setResolutionNotes(c.resolution_notes || '');
                    setStatusUpdateMsg('');
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium border border-slate-200 transition-colors flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>বিস্তারিত</span>
                </button>
              </DataTableCell>
            </DataTableRow>
          ))}
        </DataTable>
      )}

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="নতুন অভিযোগ দাখিল ফরম"
        subtitle="আপনার সমস্যা বা অনিয়মের বিবরণ সতর্কতার সাথে দাখিল করুন"
      >
        {submitSuccessMsg ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs text-center rounded-lg font-semibold">
            {submitSuccessMsg}
          </div>
        ) : (
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            {submitError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                {submitError}
              </div>
            )}

            <FormField label="অভিযোগের বিষয় / ক্যাটাগরি">
              <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="সার সংকট">সার সংকট ও ডিলার সমস্যা</option>
                <option value="কৃষি সেচ">কৃষি সেচ ও বিদ্যুৎ সংযোগ</option>
                <option value="দুর্নীতি ও স্বজনপ্রীতি">অনিয়ম ও দুর্নীতি অভিযোগ</option>
                <option value="ভেজাল বালাইনাশক">ভেজাল বালাইনাশক ও বীজ</option>
                <option value="অন্যান্য">অন্যান্য অভিযোগ</option>
              </Select>
            </FormField>

            <FormField label="অভিযোগের বিস্তারিত বিবরণ (কমপক্ষে ১০ অক্ষর)">
              <Textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="ঘটনার স্থান, সময় ও ঘটনার বিস্তারিত লিখুন..."
                required
              />
            </FormField>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs transition-colors shadow-sm"
            >
              অভিযোগ দাখিল করুন
            </button>
          </form>
        )}
      </Modal>

      <Modal
        isOpen={!!selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        title={`অভিযোগ ট্র্যাকিং: ${selectedComplaint?.complaint_number || ''}`}
        subtitle={`ক্যাটাগরি: ${selectedComplaint?.category || ''}`}
      >
        {selectedComplaint && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <p className="text-slate-800 font-normal">{selectedComplaint.description}</p>
              <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                অভিযোগকারী: {selectedComplaint.complainant_name} ({selectedComplaint.complainant_phone})
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900">অগ্রগতি অডিট ট্রেইল (History Timeline):</h4>
              <div className="relative pl-5 space-y-3 border-l-2 border-slate-200">
                {selectedComplaint.history.map((log) => (
                  <div key={log.id} className="space-y-1">
                    <div className="flex items-center justify-between font-semibold text-slate-900">
                      <span>{log.action} ({log.new_status})</span>
                      <span className="text-[11px] text-slate-400 font-mono">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-600 font-normal">{log.remarks}</p>
                  </div>
                ))}
              </div>
            </div>

            {isOfficer && (
              <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-3">
                <h4 className="font-semibold text-emerald-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>কর্মকর্তা তদন্ত প্যানেল</span>
                </h4>
                {statusUpdateMsg && <p className="text-xs font-semibold text-emerald-700">{statusUpdateMsg}</p>}

                <form onSubmit={handleStatusUpdateSubmit} className="space-y-3">
                  <FormField label="নতুন স্ট্যাটাস নির্ধারণ">
                    <Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                      <option value="Pending">Pending (পেন্ডিং)</option>
                      <option value="Under Investigation">Under Investigation (তদন্তাধীন)</option>
                      <option value="Resolved">Resolved (নিষ্পন্ন)</option>
                      <option value="Rejected">Rejected (বাতিল)</option>
                    </Select>
                  </FormField>

                  <FormField label="তদন্তের পর্যবেক্ষণ / সমাধান মন্তব্য">
                    <Textarea
                      rows={2}
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="তদন্তের সিদ্ধান্ত ও সমাধান মন্তব্য লিখুন..."
                    />
                  </FormField>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs transition-colors shadow-sm"
                  >
                    স্ট্যাটাস ও নোটিফিকেশন আপডেট করুন
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
