import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/layout/PageHeader';
import ServiceCard from '../components/ui/ServiceCard';
import { Modal } from '../components/ui/Modal';
import { FormField, Input, Textarea } from '../components/ui/FormComponents';
import { LoadingState } from '../components/ui/LoadingState';
import { Grid, CheckCircle2, Info } from 'lucide-react';

export default function ServicesPage() {
  const { currentUser, authToken, openAuthModal } = useAuth();

  const [categories, setCategories] = useState([]);
  const [savedServices, setSavedServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applyRemarks, setApplyRemarks] = useState('');
  const [applySuccessMsg, setApplySuccessMsg] = useState('');
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/services/categories');
      if (res.ok) setCategories(await res.json());
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedServices = async () => {
    if (!authToken) return;
    try {
      const res = await fetch('/api/services/saved/my-saved', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) setSavedServices(await res.json());
    } catch (e) {}
  };

  useEffect(() => {
    fetchCategories();
    fetchSavedServices();
  }, [authToken]);

  const handleToggleSave = async (serviceId) => {
    if (!authToken) {
      openAuthModal('login');
      return;
    }
    const isSaved = savedServices.some((s) => s.service_id === serviceId);
    const headers = { 'Authorization': `Bearer ${authToken}` };
    try {
      if (isSaved) {
        await fetch(`/api/services/${serviceId}/save`, { method: 'DELETE', headers });
      } else {
        await fetch(`/api/services/${serviceId}/save`, { method: 'POST', headers });
      }
      fetchSavedServices();
    } catch (e) {}
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!authToken) {
      openAuthModal('login');
      return;
    }
    setLoadingSubmit(true);
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          service_type: selectedService.id,
          sub_service_name: selectedService.name_bn,
          applicant_name: currentUser?.full_name || 'কৃষক আবেদক',
          applicant_phone: currentUser?.phone_number || '+8801800000000',
          remarks: applyRemarks
        })
      });
      const data = await res.json();
      if (res.ok) {
        setApplySuccessMsg(`আবেদন সফলভাবে দাখিল হয়েছে! ট্র্যাকিং নম্বর: ${data.application_number}`);
        setTimeout(() => {
          setIsApplyModalOpen(false);
          setApplySuccessMsg('');
          setSelectedService(null);
          setApplyRemarks('');
        }, 1800);
      }
    } catch (e) {
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (loading) {
    return <LoadingState message="সেবা ডিরেক্টরি লোড হচ্ছে..." />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="নাগরিক সেবা ডিরেক্টরি"
        description="উপজেলা ও ইউনিয়ন পর্যায়ে অনলাইনে বিনামূল্যে ও স্বল্প খরচে সরকারি সেবা আবেদন"
      />

      <div className="space-y-8">
        {categories.map((cat) => (
          <div key={cat.id} className="space-y-4">
            <div className="border-b border-slate-200/80 pb-3">
              <h3 className="text-base font-bold text-slate-900">{cat.title_bn}</h3>
              <p className="text-xs text-slate-500">{cat.description_bn}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {cat.sub_services.map((sub) => {
                const isSaved = savedServices.some((s) => s.service_id === sub.id);
                return (
                  <ServiceCard
                    key={sub.id}
                    title={sub.name_bn}
                    description={sub.description_bn}
                    processingDays={sub.processing_days}
                    fee={sub.fee_bdt}
                    isSaved={isSaved}
                    onToggleSave={() => handleToggleSave(sub.id)}
                    onApply={() => {
                      setSelectedService(sub);
                      setIsApplyModalOpen(true);
                    }}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title={`আবেদন ফরম: ${selectedService?.name_bn || ''}`}
        subtitle="অনলাইন আবেদন বিবরণ দাখিল করুন"
      >
        {applySuccessMsg ? (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="font-semibold text-sm">{applySuccessMsg}</p>
          </div>
        ) : (
          <form onSubmit={handleApplySubmit} className="space-y-4">
            <FormField label="আবেদনকারীর নাম">
              <Input value={currentUser?.full_name || ''} readOnly />
            </FormField>

            <FormField label="মোবাইল নম্বর">
              <Input value={currentUser?.phone_number || ''} readOnly />
            </FormField>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-emerald-600" />
                <span>প্রয়োজনীয় কাগজপত্র (Required Documents):</span>
              </label>
              <ul className="list-disc list-inside text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
                {selectedService?.required_documents.map((doc, idx) => (
                  <li key={idx}>{doc}</li>
                ))}
              </ul>
            </div>

            <FormField label="বিশেষ মন্তব্য / নোট">
              <Textarea
                value={applyRemarks}
                onChange={(e) => setApplyRemarks(e.target.value)}
                placeholder="আবেদনের জন্য অতিরিক্ত বিবরণ (ঐচ্ছিক)"
              />
            </FormField>

            <button
              type="submit"
              disabled={loadingSubmit}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs transition-colors shadow-sm"
            >
              {loadingSubmit ? 'আবেদন জমা হচ্ছে...' : 'অনলাইনে আবেদন জমা দিন'}
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
}
