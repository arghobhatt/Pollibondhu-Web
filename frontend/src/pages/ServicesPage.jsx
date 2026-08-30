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
  const [paymentMethod, setPaymentMethod] = useState('bKash');
  const [transactionId, setTransactionId] = useState('');
  const [senderAccount, setSenderAccount] = useState('');
  const [paymentError, setPaymentError] = useState('');

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
      setSenderAccount(currentUser.phone_number || '');
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
    setPaymentError('');

    const requiresPaymentTrx = (selectedService?.fee_bdt > 0 || ['bKash', 'Nagad', 'Rocket', 'Bank'].includes(paymentMethod)) && paymentMethod !== 'Cash';
    if (requiresPaymentTrx && !transactionId.trim()) {
      setPaymentError('অনুগ্রহ করে আপনার পেমেন্টের লেনদেন আইডি / Transaction ID প্রদান করুন।');
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
          attached_documents: docSummary || null,
          payment_method: paymentMethod,
          transaction_id: transactionId.trim() || null,
          payment_sender_account: senderAccount.trim() || null,
          payment_amount: selectedService?.fee_bdt || 0.0
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
          setTransactionId('');
          setPaymentError('');
          setApplyStep(1);
        }, 2000);
      } else {
        setPaymentError(data.detail || data.error?.message || 'আবেদন দাখিল সম্পন্ন করা যায়নি।');
      }
    } catch (e) {
      setPaymentError('সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি।');
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
                      setTransactionId('');
                      setPaymentError('');
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
              <span className={applyStep === 3 ? "text-emerald-700 font-bold" : ""}>৩. কাগজপত্র</span>
              <span className={applyStep === 4 ? "text-emerald-700 font-bold" : ""}>৪. পেমেন্ট ও দাখিল</span>
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
                    <span>পেমেন্ট ও রিভিউ</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {applyStep === 4 && (
              <form onSubmit={handleApplySubmit} className="space-y-4">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                  <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1 flex justify-between">
                    <span>আবেদন তথ্য সারাংশ:</span>
                    <span className="text-emerald-700 font-semibold">ফি: {selectedService?.fee_bdt > 0 ? `${selectedService.fee_bdt} ৳` : 'বিনামূল্যে (০ ৳)'}</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-1 text-[11px]">
                    <p>আবেদনকারী: <strong className="text-slate-900">{applicantName}</strong></p>
                    <p>মোবাইল: <strong className="text-slate-900">{applicantPhone}</strong></p>
                  </div>
                  <p className="text-[11px]">সেবা: <strong className="text-slate-900">{selectedService?.name_bn}</strong></p>
                  {attachedFiles.length > 0 && (
                    <p className="text-[11px] text-slate-500">সংযুক্ত নথি: {attachedFiles.map(f => f.name).join(', ')}</p>
                  )}
                </div>

                {/* Payment Selection Block */}
                <div className="space-y-3 p-3 bg-emerald-50/40 border border-emerald-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-800 flex items-center gap-1">
                      <span>পরিশোধের মাধ্যম (Payment Method):</span>
                    </label>
                    <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      {selectedService?.fee_bdt > 0 ? `সরকারি ফি: ${selectedService.fee_bdt} ৳` : 'প্রযোজ্য ক্ষেত্রে ফি'}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'bKash', label: 'বিকাশ (bKash)', color: 'border-pink-300 hover:border-pink-500' },
                      { id: 'Nagad', label: 'নগদ (Nagad)', color: 'border-orange-300 hover:border-orange-500' },
                      { id: 'Rocket', label: 'রকেট (Rocket)', color: 'border-purple-300 hover:border-purple-500' },
                      { id: 'Bank', label: 'ব্যাংক / চালান', color: 'border-blue-300 hover:border-blue-500' }
                    ].map((pm) => (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => { setPaymentMethod(pm.id); setPaymentError(''); }}
                        className={`py-2 px-1 text-center rounded-lg border font-medium text-[11px] transition-all ${
                          paymentMethod === pm.id
                            ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-200'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {pm.label}
                      </button>
                    ))}
                  </div>

                  {paymentMethod === 'bKash' && (
                    <div className="p-2.5 bg-pink-50/70 border border-pink-200 rounded-lg text-[11px] text-pink-900 space-y-1">
                      <p className="font-semibold">বিকাশ পেমেন্ট নির্দেশিকা:</p>
                      <p>১. বিকাশ অ্যাপে 'Make Payment' বা 'Send Money' করুন: <strong className="select-all">01800000000</strong> নম্বরে।</p>
                      <p>২. পেমেন্ট সম্পন্ন হলে ফিরতি SMS থেকে Transaction ID টি নিচে লিখুন।</p>
                    </div>
                  )}

                  {paymentMethod === 'Nagad' && (
                    <div className="p-2.5 bg-orange-50/70 border border-orange-200 rounded-lg text-[11px] text-orange-900 space-y-1">
                      <p className="font-semibold">নগদ পেমেন্ট নির্দেশিকা:</p>
                      <p>১. নগদ অ্যাপে 'Merchant Pay' বা 'Send Money' করুন: <strong className="select-all">01800000000</strong> নম্বরে।</p>
                      <p>২. পেমেন্ট সফল হলে প্রাপ্ত Transaction ID টি নিচে প্রদান করুন।</p>
                    </div>
                  )}

                  {paymentMethod === 'Rocket' && (
                    <div className="p-2.5 bg-purple-50/70 border border-purple-200 rounded-lg text-[11px] text-purple-900 space-y-1">
                      <p className="font-semibold">রকেট পেমেন্ট নির্দেশিকা:</p>
                      <p>১. রকেটে বিল পে বা ট্রান্সফার করুন মার্চেন্ট কোড: <strong className="select-all">88018</strong> (বা 01800000000)।</p>
                      <p>২. ট্রানজেকশন সফল হলে SMS এ প্রাপ্ত Transaction ID লিখুন।</p>
                    </div>
                  )}

                  {paymentMethod === 'Bank' && (
                    <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-lg text-[11px] text-blue-900 space-y-1">
                      <p className="font-semibold">ব্যাংক / চালান নির্দেশিকা:</p>
                      <p>সোনালী ব্যাংক একাউন্ট: <strong className="select-all">0123456789 (উপজেলা হিসাব শাখা)</strong></p>
                      <p>ব্যাংক ভাউচার বা চালানের রেফারেন্স/লেনদেন নম্বর নিচে প্রবেশ করান।</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <FormField
                      label={paymentMethod === 'Bank' ? 'প্রেরকের ব্যাংক একাউন্ট / ফোন' : 'প্রেরকের মোবাইল নম্বর'}
                    >
                      <Input
                        value={senderAccount}
                        onChange={(e) => setSenderAccount(e.target.value)}
                        placeholder="যেমন: 017XXXXXXXX"
                      />
                    </FormField>

                    <FormField
                      label={paymentMethod === 'Bank' ? 'ব্যাংক রেফারেন্স নম্বর / Transaction ID' : 'লেনদেন আইডি / Transaction ID'}
                      required={selectedService?.fee_bdt > 0}
                    >
                      <Input
                        value={transactionId}
                        onChange={(e) => { setTransactionId(e.target.value); setPaymentError(''); }}
                        placeholder={paymentMethod === 'Bank' ? 'যেমন: TRX-SB-98213' : 'যেমন: BK8923741X বা 9XJ28KLA'}
                        required={selectedService?.fee_bdt > 0}
                      />
                    </FormField>
                  </div>

                  <p className="text-[10px] text-slate-500 italic">
                    * লেনদেন আইডি দাখিল করার অর্থ পেমেন্ট তথ্য দাখিল করা। সংশ্লিষ্ট দায়িত্বপ্রাপ্ত কর্মকর্তা যাচাইপূর্বক চূড়ান্ত অনুমোদন প্রদান করবেন।
                  </p>
                </div>

                {paymentError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-semibold">
                    {paymentError}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setApplyStep(3)}
                    className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-lg text-xs"
                  >
                    পূর্ববর্তী ধাপ
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
