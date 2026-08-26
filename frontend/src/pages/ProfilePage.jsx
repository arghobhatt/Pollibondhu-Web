import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { FormField, Input, Select } from '../components/ui/FormComponents';
import { EmptyState } from '../components/ui/EmptyState';
import { User, Phone, Mail, FileText, MapPin, Shield, CheckCircle2, AlertCircle, Upload, Save, X } from 'lucide-react';

export default function ProfilePage() {
  const { currentUser, authToken, updateUser, openAuthModal } = useAuth();

  const [fullName, setFullName] = useState(currentUser?.full_name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [nidNumber, setNidNumber] = useState(currentUser?.nid_number || '');
  const [division, setDivision] = useState(currentUser?.division || 'ঢাকা');
  const [district, setDistrict] = useState(currentUser?.district || 'ঢাকা');
  const [upazila, setUpazila] = useState(currentUser?.upazila || 'ধামরাই');

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [photoInfoMsg, setPhotoInfoMsg] = useState('');

  if (!currentUser || !authToken) {
    return (
      <EmptyState
        icon={User}
        title="প্রোফাইলে প্রবেশের জন্য লগইন করুন"
        description="আপনার ব্যক্তিগত তথ্য ও একাউন্ট সেটিংস পরিবর্তন করতে সাইন-ইন করা প্রয়োজন।"
        actionLabel="প্রবেশ করুন / সাইন-ইন"
        onAction={() => openAuthModal('login')}
      />
    );
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setPhotoInfoMsg('');
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setPhotoInfoMsg('শুধুমাত্র JPG, PNG অথবা WEBP ফরম্যাটের ছবি গ্রহণযোগ্য।');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setPhotoInfoMsg('ছবি ফাইল সাইজ সর্বোচ্চ ২ মেগাবাইটের মধ্যে হতে হবে।');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
      setPhotoInfoMsg('ছবি প্রিভিউ প্রস্তুত। স্থায়ী ছবি সংরক্ষণের জন্য প্রোফাইল সেভ করুন।');
    };
    reader.readAsDataURL(file);
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setLoading(true);

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
          nid_number: nidNumber || null,
          division,
          district,
          upazila
        })
      });

      const data = await res.json();
      if (res.ok) {
        updateUser(data);
        setSuccessMsg('প্রোফাইল তথ্য সফলভাবে সংরক্ষণ ও আপডেট করা হয়েছে!');
        setIsEditing(false);
      } else {
        setErrorMsg(data.detail || 'প্রোফাইল আপডেট করা সম্ভব হয়নি।');
      }
    } catch (err) {
      setErrorMsg('নেটওয়ার্ক ত্রুটি! অনুগ্রহ করে পুনরায় চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="নাগরিক প্রোফাইল ও একাউন্ট সেটিংস"
        description="আপনার ব্যক্তিগত পরিচিতি, মোবাইল নম্বর, NID ও উপজেলা ঠিকানা ব্যবস্থাপনা করুন"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex flex-col items-center text-center p-6 space-y-4">
          <div className="relative group">
            <div className="w-24 h-24 rounded-2xl bg-emerald-100 border-2 border-emerald-500/80 flex items-center justify-center text-emerald-800 font-bold text-2xl overflow-hidden shadow-subtle">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Profile Preview" className="w-full h-full object-cover" />
              ) : (
                <span>{currentUser.full_name?.charAt(0) || 'P'}</span>
              )}
            </div>
            <label className="absolute bottom-0 right-0 p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoChange} className="hidden" />
            </label>
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">{currentUser.full_name}</h3>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Shield className="w-3 h-3" />
              {currentUser.role === 'officer' ? 'উপসহকারী কৃষি কর্মকর্তা' : 'নিবন্ধিত নাগরিক'}
            </span>
          </div>

          {photoInfoMsg && (
            <p className="text-[11px] font-medium text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
              {photoInfoMsg}
            </p>
          )}

          <div className="w-full border-t border-slate-100 pt-4 text-xs text-slate-600 space-y-2 text-left">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentUser.phone_number}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentUser.upazila || 'উপজেলা'}, {currentUser.district || 'জেলা'}</span>
            </div>
          </div>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>ব্যক্তিগত তথ্যাবলী</CardTitle>
                <CardDescription>আপনার নিবন্ধিত নাগরিক পরিচয় ও যোগাযোগের তথ্য</CardDescription>
              </div>

              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
                >
                  প্রোফাইল সম্পাদনা করুন
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </CardHeader>

            <CardContent>
              {successMsg && (
                <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {errorMsg && (
                <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleProfileSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="পূর্ণ নাম">
                    <Input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={!isEditing}
                      required
                    />
                  </FormField>

                  <FormField label="মোবাইল নম্বর (অপরিবর্তনযোগ্য)">
                    <Input value={currentUser.phone_number} readOnly disabled className="bg-slate-50 text-slate-500" />
                  </FormField>

                  <FormField label="ইমেইল ঠিকানা">
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@mail.com"
                      disabled={!isEditing}
                    />
                  </FormField>

                  <FormField label="জাতীয় পরিচয়পত্র (NID)">
                    <Input
                      value={nidNumber}
                      onChange={(e) => setNidNumber(e.target.value)}
                      placeholder="1990123456789"
                      disabled={!isEditing}
                    />
                  </FormField>
                </div>

                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <h4 className="text-xs font-semibold text-slate-900">ঠিকানা ও এলাকা নির্বাচন</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <FormField label="বিভাগ">
                      <Input value={division} onChange={(e) => setDivision(e.target.value)} disabled={!isEditing} />
                    </FormField>

                    <FormField label="জেলা">
                      <Input value={district} onChange={(e) => setDistrict(e.target.value)} disabled={!isEditing} />
                    </FormField>

                    <FormField label="উপজেলা">
                      <Input value={upazila} onChange={(e) => setUpazila(e.target.value)} disabled={!isEditing} />
                    </FormField>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{loading ? 'সংরক্ষণ হচ্ছে...' : 'পরিবর্তন সংরক্ষণ করুন'}</span>
                    </button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
