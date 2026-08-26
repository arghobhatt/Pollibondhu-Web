import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import StatusBadge from '../components/ui/StatusBadge';
import { FormField, Input, Select } from '../components/ui/FormComponents';
import { User, Shield, MapPin, CheckCircle2, Upload, AlertCircle } from 'lucide-react';

export default function ProfilePage() {
  const { currentUser, authToken, updateUser, openAuthModal } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [nidNumber, setNidNumber] = useState('');
  const [division, setDivision] = useState('ঢাকা');
  const [district, setDistrict] = useState('ঢাকা');
  const [upazila, setUpazila] = useState('ধামরাই');
  
  const [photoPreview, setPhotoPreview] = useState('');
  const [photoError, setPhotoError] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.full_name || '');
      setEmail(currentUser.email || '');
      setNidNumber(currentUser.nid_number || '');
      setDivision(currentUser.division || 'ঢাকা');
      setDistrict(currentUser.district || 'ঢাকা');
      setUpazila(currentUser.upazila || 'ধামরাই');
      if (currentUser.avatar_url) {
        setPhotoPreview(currentUser.avatar_url);
      }
    }
  }, [currentUser]);

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    setPhotoError('');
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setPhotoError('শুধুমাত্র JPG, PNG বা WEBP টাইপের ছবি নির্বাচন করুন।');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setPhotoError('ছবি সাইজ সর্বোচ্চ ২ মেগাবাইটের মধ্যে হতে হবে।');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!authToken) {
      openAuthModal('login');
      return;
    }

    setLoading(true);
    setSaveSuccessMsg('');
    setPhotoError('');

    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          full_name: fullName,
          email: email || null,
          nid_number: nidNumber,
          division,
          district,
          upazila,
          avatar_url: photoPreview || null
        })
      });

      const updatedUser = await res.json();
      if (res.ok) {
        updateUser(updatedUser);
        setSaveSuccessMsg('প্রোফাইল তথ্য সফলভাবে হালনাগাদ করা হয়েছে!');
        setTimeout(() => setSaveSuccessMsg(''), 3000);
      } else {
        setPhotoError(updatedUser.detail || 'প্রোফাইল আপডেট করা সম্ভব হয়নি।');
      }
    } catch (err) {
      setPhotoError('নেটওয়ার্ক ত্রুটি!');
    } finally {
      setLoading(false);
    }
  };

  const formatMaskedNid = (nid) => {
    if (!nid) return 'প্রদান করা হয়নি';
    if (nid.length <= 4) return '********';
    return `********${nid.slice(-4)}`;
  };

  if (!currentUser) {
    return (
      <div className="space-y-6 animate-fade-in">
        <PageHeader title="আমার প্রোফাইল" description="আপনার নাগরিক একাউন্ট তথ্য ও সেটিংস" />
        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            <p className="text-xs text-slate-600">প্রোফাইল তথ্য দেখতে ও পরিবর্তন করতে অনুগ্রহ করে লগইন করুন।</p>
            <button
              onClick={() => openAuthModal('login')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg shadow-sm"
            >
              প্রবেশ করুন / সাইন-ইন
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <PageHeader
        title="আমার প্রোফাইল ও একাউন্ট তথ্য"
        description="ব্যক্তিগত তথ্য, জাতীয় পরিচয়পত্র (নিরাপদ মাস্কিং) ও অবস্থান সেটিংস নির্দেশিকা"
      />

      {saveSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {photoError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span>{photoError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 flex flex-col items-center p-6 text-center space-y-4">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-emerald-600 bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-2xl shadow-sm">
              {photoPreview ? (
                <img src={photoPreview} alt={currentUser.full_name} className="w-full h-full object-cover" />
              ) : (
                <span>{currentUser.full_name ? currentUser.full_name.charAt(0) : 'U'}</span>
              )}
            </div>
            <label className="absolute bottom-0 right-0 p-1.5 bg-emerald-600 text-white rounded-full cursor-pointer hover:bg-emerald-700 transition-colors shadow-sm">
              <Upload className="w-3.5 h-3.5" />
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoSelect} className="hidden" />
            </label>
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">{currentUser.full_name}</h3>
            <p className="text-xs text-slate-500 font-mono">{currentUser.phone_number}</p>
          </div>

          <div className="pt-2 border-t border-slate-100 w-full space-y-2 text-xs text-left">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">একাউন্ট টাইপ:</span>
              <StatusBadge status={currentUser.role} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">NID (নিরাপদ মাস্কিং):</span>
              <span className="font-mono font-semibold text-slate-700">{formatMaskedNid(currentUser.nid_number)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">অবস্থান:</span>
              <span className="font-medium text-slate-700">{currentUser.upazila || 'ধামরাই'}, {currentUser.district || 'ঢাকা'}</span>
            </div>
          </div>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>প্রোফাইল তথ্য সম্পাদনা</CardTitle>
            <CardDescription>আপনার ব্যক্তিগত তথ্য ও ঠিকানা হালনাগাদ করুন</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <FormField label="পূর্ণ নাম" required>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField label="মোবাইল নম্বর (অপরিবর্তনযোগ্য)">
                  <Input value={currentUser.phone_number} disabled className="bg-slate-50 text-slate-500 cursor-not-allowed" />
                </FormField>
                <FormField label="ইমেইল ঠিকানা">
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@mail.com" />
                </FormField>
              </div>

              <FormField label="জাতীয় পরিচয়পত্র (NID) নম্বর" required>
                <Input value={nidNumber} onChange={(e) => setNidNumber(e.target.value)} required />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <FormField label="বিভাগ">
                  <Select value={division} onChange={(e) => setDivision(e.target.value)}>
                    <option value="ঢাকা">ঢাকা</option>
                    <option value="চট্টগ্রাম">চট্টগ্রাম</option>
                    <option value="সিলেট">সিলেট</option>
                    <option value="রাজশাহী">রাজশাহী</option>
                    <option value="রংপুর">রংপুর</option>
                    <option value="খুলনা">খুলনা</option>
                    <option value="বরিশাল">বরিশাল</option>
                    <option value="ময়মনসিংহ">ময়মনসিংহ</option>
                  </Select>
                </FormField>

                <FormField label="জেলা">
                  <Input value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="ঢাকা" required />
                </FormField>

                <FormField label="উপজেলা / ইউনিয়ন">
                  <Input value={upazila} onChange={(e) => setUpazila(e.target.value)} placeholder="ধামরাই" required />
                </FormField>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg transition-colors shadow-sm"
                >
                  {loading ? 'সংরক্ষণ হচ্ছে...' : 'পরিবর্তনসমূহ সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
