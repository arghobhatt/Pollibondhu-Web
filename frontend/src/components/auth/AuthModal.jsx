import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, LogIn, UserPlus, KeyRound, Phone, Lock, User, FileText, MapPin, Navigation, AlertCircle, CheckCircle2, Sprout } from 'lucide-react';

export default function AuthModal() {
  const { isAuthModalOpen, authModalTab, closeAuthModal, login } = useAuth();
  const [activeTab, setActiveTab] = useState(authModalTab || 'login');
  
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regFullName, setRegFullName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regNid, setRegNid] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('citizen');
  const [regDivision, setRegDivision] = useState('ঢাকা');
  const [regDistrict, setRegDistrict] = useState('ঢাকা');
  const [regUpazila, setRegUpazila] = useState('ধামরাই');
  const [locDetecting, setLocDetecting] = useState(false);

  const [resetPhone, setResetPhone] = useState('');
  const [resetNid, setResetNid] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [recoveryStep, setRecoveryStep] = useState(1);

  if (!isAuthModalOpen) return null;

  const handleDetectLocationForRegistration = () => {
    if (!navigator.geolocation) {
      setErrorMessage('আপনার ব্রাউজারে Geolocation সমর্থিত নয়।');
      return;
    }
    setLocDetecting(true);
    setErrorMessage('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        let div = 'ঢাকা';
        let dist = 'ঢাকা';

        if (lat >= 24.5 && lon >= 91.5) { div = 'সিলেট'; dist = 'সিলেট'; }
        else if (lat >= 24.0 && lon >= 88.5 && lon <= 89.5) { div = 'রাজশাহী'; dist = 'রাজশাহী'; }
        else if (lat >= 25.5) { div = 'রংপুর'; dist = 'রংপুর'; }
        else if (lat <= 22.8 && lon >= 91.5) { div = 'চট্টগ্রাম'; dist = 'চট্টগ্রাম'; }
        else if (lat <= 23.0 && lon <= 90.5) { div = 'বরিশাল'; dist = 'বরিশাল'; }
        else if (lat >= 22.5 && lat <= 23.8 && lon >= 89.0 && lon <= 90.0) { div = 'খুলনা'; dist = 'খুলনা'; }
        else if (lat >= 24.5 && lon >= 90.0 && lon <= 90.8) { div = 'ময়মনসিংহ'; dist = 'ময়মনসিংহ'; }

        setRegDivision(div);
        setRegDistrict(dist);
        setLocDetecting(false);
        setSuccessMessage(`আপনার বর্তমান অবস্থান (${dist}, ${div}) সনাক্ত হয়েছে!`);
      },
      (err) => {
        setLocDetecting(false);
        setErrorMessage('অবস্থান সনাক্ত করা সম্ভব হয়নি। ম্যানুয়ালি নির্বাচন করুন।');
      },
      { timeout: 8000 }
    );
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: loginPhone, password: loginPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error?.message || data.detail || 'লগইন ব্যর্থ হয়েছে। তথ্য যাচাই করুন।');
        return;
      }
      login(data.user, data.access_token);
    } catch (err) {
      setErrorMessage('নেটওয়ার্ক ত্রুটি! অনুগ্রহ করে পুনরায় চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!regNid || regNid.trim().length < 10) {
      setErrorMessage('জাতীয় পরিচয়পত্র (NID) নম্বর আবশ্যক। নূন্যতম ১০ ডিজিটের NID প্রদান করুন।');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: regFullName,
          phone_number: regPhone,
          email: regEmail || null,
          nid_number: regNid.trim(),
          password: regPassword,
          role: regRole,
          division: regDivision,
          district: regDistrict,
          upazila: regUpazila
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error?.message || data.detail || 'নিবন্ধন ব্যর্থ হয়েছে।');
        return;
      }
      login(data.user, data.access_token);
    } catch (err) {
      setErrorMessage('নেটওয়ার্ক ত্রুটি! অনুগ্রহ করে পুনরায় চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestRecoverySubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: resetPhone })
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error?.message || data.detail || 'মোবাইল নম্বর খুঁজে পাওয়া যায়নি।');
        return;
      }
      setSuccessMessage(data.message);
      setRecoveryStep(2);
    } catch (err) {
      setErrorMessage('নেটওয়ার্ক ত্রুটি!');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: resetPhone,
          nid_number: resetNid,
          new_password: newPassword
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error?.message || data.detail || 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে।');
        return;
      }
      setSuccessMessage('পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে! লগইন করুন।');
      setActiveTab('login');
      setRecoveryStep(1);
    } catch (err) {
      setErrorMessage('নেটওয়ার্ক ত্রুটি!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-elevated overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Sprout className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">পল্লীবন্ধু অ্যাকাউন্ট প্রসেস</h3>
              <p className="text-[11px] text-slate-500">নিরাপদ নাগরিক লগইন পোর্টাল</p>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-slate-100 bg-slate-50/30 p-1.5 gap-1">
          <button
            onClick={() => { setActiveTab('login'); setErrorMessage(''); setSuccessMessage(''); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'login'
                ? 'bg-white text-emerald-700 shadow-subtle border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            প্রবেশ করুন
          </button>
          <button
            onClick={() => { setActiveTab('register'); setErrorMessage(''); setSuccessMessage(''); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'register'
                ? 'bg-white text-emerald-700 shadow-subtle border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            নিবন্ধন
          </button>
          <button
            onClick={() => { setActiveTab('recovery'); setErrorMessage(''); setSuccessMessage(''); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'recovery'
                ? 'bg-white text-emerald-700 shadow-subtle border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            পাসওয়ার্ড উদ্ধার
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  মোবাইল নম্বর
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    placeholder="+8801812345678"
                    required
                    className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  পাসওয়ার্ড
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs transition-colors shadow-sm"
              >
                {loading ? 'প্রসেসিং হচ্ছে...' : 'প্রবেশ করুন'}
              </button>
            </form>
          )}

          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  পূর্ণ নাম *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="আব্দুল কুদ্দুস"
                    required
                    className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  মোবাইল নম্বর *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+8801812345678"
                    required
                    className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  জাতীয় পরিচয়পত্র নম্বর (NID) *
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={regNid}
                    onChange={(e) => setRegNid(e.target.value)}
                    placeholder="1990123456789"
                    required
                    className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">অবস্থান তথ্য</span>
                  <button
                    type="button"
                    onClick={handleDetectLocationForRegistration}
                    disabled={locDetecting}
                    className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"
                  >
                    <Navigation className={`w-3 h-3 ${locDetecting ? 'animate-spin' : ''}`} />
                    <span>বর্তমান জিপিএস অবস্থান ব্যবহার করুন</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5">বিভাগ</label>
                    <input
                      type="text"
                      value={regDivision}
                      onChange={(e) => setRegDivision(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5">জেলা</label>
                    <input
                      type="text"
                      value={regDistrict}
                      onChange={(e) => setRegDistrict(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  পাসওয়ার্ড *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="নূন্যতম ৬ অক্ষর"
                    required
                    className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs transition-colors shadow-sm mt-1"
              >
                {loading ? 'প্রসেসিং হচ্ছে...' : 'নিবন্ধন সম্পন্ন করুন'}
              </button>
            </form>
          )}

          {activeTab === 'recovery' && (
            recoveryStep === 1 ? (
              <form onSubmit={handleRequestRecoverySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    নিবন্ধিত মোবাইল নম্বর
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={resetPhone}
                      onChange={(e) => setResetPhone(e.target.value)}
                      placeholder="+8801812345678"
                      required
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs transition-colors"
                >
                  {loading ? 'প্রসেসিং...' : 'যাচাইকরণ পাঠান'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    জাতীয় পরিচয়পত্র (NID) নম্বর
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={resetNid}
                      onChange={(e) => setResetNid(e.target.value)}
                      placeholder="1990123456789"
                      required
                      className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    নতুন পাসওয়ার্ড
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="নূন্যতম ৬ অক্ষর"
                      required
                      className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs transition-colors"
                >
                  {loading ? 'প্রসেসিং...' : 'পাসওয়ার্ড রিসেট করুন'}
                </button>
              </form>
            )
          )}
        </div>
      </div>
    </div>
  );
}
