import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/layout/PageHeader';
import ServiceCard from '../components/ui/ServiceCard';
import { Modal } from '../components/ui/Modal';
import { FormField, Input, Textarea } from '../components/ui/FormComponents';
import { LoadingState } from '../components/ui/LoadingState';
import { Grid, CheckCircle2, Info, Upload, Trash2, FileText, ArrowRight, ArrowLeft } from 'lucide-react';

export default function ServicesPage() {
  const { currentUser, authToken, openAuthModal } = useAuth();

  const [categories, setCategories] = useState([]);
  const [savedServices, setSavedServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applyStep, setApplyStep] = useState(1);
  const [applicantName, setApplicantName] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [applyRemarks, setApplyRemarks] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [fileError, setFileError] = useState('');

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

  useEffect(() => {
    if (currentUser) {
      setApplicantName(currentUser.full_name || '');
      setApplicantPhone(currentUser.phone_number || '');
    }
  }, [currentUser]);

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

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setFileError('');
    
    const validFiles = [];
    for (const f of files) {
      if (!['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'].includes(f.type)) {
        setFileError('শুধুমাত্র PDF, JPG, JPEG অথবা PNG ফাইল গ্রহণযোগ্য।');
        return;
      }
      if (f.size > 5 * 1024 * 1024) {
        setFileError('ফাইল সাইজ সর্বোচ্চ ৫ মেগাবাইটের মধ্যে হতে হবে।');
        return;
      }
      validFiles.push({ name: f.name, size: (f.size / 1024).toFixed(1) + ' KB', type: f.type });
    }

    setAttachedFiles((prev) => [...prev, ...validFiles]);
  };

  const handleRemoveFile = (index) => {
    setAttachedFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!authToken) {
      openAuthModal('login');
      return;
    }
    setLoadingSubmit(true);
    try {
      const docSummary = attachedFiles.map(f => `${f.name} (${f.size})`).join(', ');
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          service_type: selectedService.id,
          sub_service_name: selectedService.name_bn,
          applicant_name: applicantName,
          applicant_phone: applicantPhone,
          remarks: applyRemarks,
          attached_documents: docSummary || null
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
          setAttachedFiles([]);
          setApplyStep(1);
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
                      if (!authToken) {
                        openAuthModal('login');
                        return;
                      }
                      setSelectedService(sub);
                      setApplyStep(1);
                      setAttachedFiles([]);
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
        title={`অনলাইন আবেদন: ${selectedService?.name_bn || ''}`}
        subtitle={`ধাপ ${applyStep} / ৪`}
      >
        {applySuccessMsg ? (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="font-semibold text-sm">{applySuccessMsg}</p>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            <div className="flex border-b border-slate-200 pb-3 justify-between text-[11px] font-semibold text-slate-500">
              <span className={applyStep === 1 ? "text-emerald-700 font-bold" : ""}>১. ব্যক্তিগত তথ্য</span>
              <span className={applyStep === 2 ? "text-emerald-700 font-bold" : ""}>২. সেবা বিবরণ</span>
              <span className={applyStep === 3 ? "text-emerald-700 font-bold" : ""}>৩. কাগজপত্র সংযুক্ত</span>
              <span className={applyStep === 4 ? "text-emerald-700 font-bold" : ""}>৪. রিভিউ ও দাখিল</span>
            </div>

            {applyStep === 1 && (
              <div className="space-y-3">
                <FormField label="আবেদনকারীর পূর্ণ নাম" required>
                  <Input value={applicantName} onChange={(e) => setApplicantName(e.target.value)} required />
                </FormField>

                <FormField label="মোবাইল নম্বর" required>
                  <Input value={applicantPhone} onChange={(e) => setApplicantPhone(e.target.value)} required />
                </FormField>

                <button
                  type="button"
                  onClick={() => setApplyStep(2)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs transition-colors flex items-center justify-center gap-1 shadow-sm mt-2"
                >
                  <span>পরবর্তী ধাপ</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {applyStep === 2 && (
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                  <p className="font-semibold text-slate-900">{selectedService?.name_bn}</p>
                  <p className="text-slate-600">{selectedService?.description_bn}</p>
                  <p className="text-[11px] text-emerald-700 pt-1 font-medium">প্রক্রিয়াকরণ সময়: {selectedService?.processing_days} কার্যদিবস | ফি: {selectedService?.fee_bdt} ৳</p>
                </div>

                <FormField label="অতিরিক্ত বিবরণ / মন্তব্য">
                  <Textarea
                    value={applyRemarks}
                    onChange={(e) => setApplyRemarks(e.target.value)}
                    placeholder="আবেদনের জন্য প্রয়োজনীয় বিবরণ লিখুন..."
                  />
                </FormField>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setApplyStep(1)}
                    className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-lg text-xs"
                  >
                    পূর্ববর্তী
                  </button>
                  <button
                    type="button"
                    onClick={() => setApplyStep(3)}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs shadow-sm flex items-center justify-center gap-1"
                  >
                    <span>কাগজপত্র ধাপ</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {applyStep === 3 && (
              <div className="space-y-3">
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

                {fileError && <p className="text-[11px] text-rose-600 font-semibold">{fileError}</p>}

                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center space-y-2 hover:border-emerald-400 transition-colors bg-slate-50/50">
                  <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                  <p className="text-xs font-medium text-slate-700">ফাইল আপলোড করুন (PDF, JPG, PNG)</p>
                  <p className="text-[10px] text-slate-400">সর্বোচ্চ ফাইল সাইজ: ৫ মেগাবাইট</p>
                  <label className="inline-flex px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg cursor-pointer transition-colors shadow-sm">
                    <span>ফাইল বাছাই করুন</span>
                    <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileSelect} className="hidden" />
                  </label>
                </div>

                {attachedFiles.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <p className="font-semibold text-slate-700">সংযুক্ত ফাইলসমূহ ({attachedFiles.length}):</p>
                    {attachedFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/50 border border-emerald-200 text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="truncate text-slate-800">{file.name} ({file.size})</span>
                        </div>
                        <button type="button" onClick={() => handleRemoveFile(idx)} className="text-slate-400 hover:text-rose-600 p-1">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setApplyStep(2)}
                    className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-lg text-xs"
                  >
                    পূর্ববর্তী
                  </button>
                  <button
                    type="button"
                    onClick={() => setApplyStep(4)}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs shadow-sm flex items-center justify-center gap-1"
                  >
                    <span>রিভিউ ধাপ</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {applyStep === 4 && (
              <form onSubmit={handleApplySubmit} className="space-y-4">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1">আবেদন তথ্য রিভিউ:</h4>
                  <p>আবেদনকারী: <strong className="text-slate-900">{applicantName}</strong></p>
                  <p>মোবাইল: <strong className="text-slate-900">{applicantPhone}</strong></p>
                  <p>সেবা: <strong className="text-slate-900">{selectedService?.name_bn}</strong></p>
                  <p>সংযুক্ত কাগজপত্র: {attachedFiles.length > 0 ? attachedFiles.map(f => f.name).join(', ') : 'কোন নথিপত্র সংযুক্ত নেই'}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setApplyStep(3)}
                    className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-lg text-xs"
                  >
                    সম্পাদনা করুন
                  </button>
                  <button
                    type="submit"
                    disabled={loadingSubmit}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs transition-colors shadow-sm"
                  >
                    {loadingSubmit ? 'আবেদন দাখিল হচ্ছে...' : 'অনলাইনে নিশ্চিতকরণ ও দাখিল'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
