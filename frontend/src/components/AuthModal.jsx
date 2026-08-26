import React, { useState } from 'react';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [activeTab, setActiveTab] = useState('login');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [loginPhone, setLoginPhone] = useState('+8801812345678');
  const [loginPassword, setLoginPassword] = useState('');

  const [regFullName, setRegFullName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regNid, setRegNid] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('citizen');
  const [regDistrict, setRegDistrict] = useState('ঢাকা');

  const [resetPhone, setResetPhone] = useState('');
  const [resetNid, setResetNid] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [recoveryStep, setRecoveryStep] = useState(1);

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
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
      localStorage.setItem('pollibondhu_token', data.access_token);
      onAuthSuccess(data.user, data.access_token);
      onClose();
    } catch (err) {
      setErrorMessage('নেটওয়ার্ক ত্রুটি! অনুগ্রহ করে পুনরায় চেষ্টা করুন।');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: regFullName,
          phone_number: regPhone,
          email: regEmail || null,
          nid_number: regNid || null,
          password: regPassword,
          role: regRole,
          district: regDistrict
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error?.message || data.detail || 'নিবন্ধন ব্যর্থ হয়েছে।');
        return;
      }
      localStorage.setItem('pollibondhu_token', data.access_token);
      onAuthSuccess(data.user, data.access_token);
      onClose();
    } catch (err) {
      setErrorMessage('নেটওয়ার্ক ত্রুটি! অনুগ্রহ করে পুনরায় চেষ্টা করুন।');
    }
  };

  const handleRequestRecovery = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
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
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
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
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>পল্লীবন্ধু অ্যাকাউন্ট প্রসেস</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="tab-group">
          <button className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`} onClick={() => { setActiveTab('login'); setErrorMessage(''); }}>
            প্রবেশ করুন (Login)
          </button>
          <button className={`tab-btn ${activeTab === 'register' ? 'active' : ''}`} onClick={() => { setActiveTab('register'); setErrorMessage(''); }}>
            নিবন্ধন (Register)
          </button>
          <button className={`tab-btn ${activeTab === 'recovery' ? 'active' : ''}`} onClick={() => { setActiveTab('recovery'); setErrorMessage(''); }}>
            পাসওয়ার্ড উদ্ধার
          </button>
        </div>

        {errorMessage && (
          <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '0.65rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', color: '#34d399', padding: '0.65rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {successMessage}
          </div>
        )}

        {activeTab === 'login' && (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>মোবাইল নম্বর (Phone Number)</label>
              <input type="text" className="form-control" value={loginPhone} onChange={(e) => setLoginPhone(e.target.value)} required placeholder="+8801812345678" />
            </div>
            <div className="form-group">
              <label>পাসওয়ার্ড (Password)</label>
              <input type="password" className="form-control" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required placeholder="••••••••" />
            </div>
            <button type="submit" className="btn">প্রবেশ করুন (Login)</button>
          </form>
        )}

        {activeTab === 'register' && (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>পূর্ণ নাম (Full Name)</label>
              <input type="text" className="form-control" value={regFullName} onChange={(e) => setRegFullName(e.target.value)} required placeholder="আব্দুল কুদ্দুস" />
            </div>
            <div className="form-group">
              <label>মোবাইল নম্বর (Phone Number)</label>
              <input type="text" className="form-control" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} required placeholder="+8801812345678" />
            </div>
            <div className="form-group">
              <label>জাতীয় পরিচয়পত্র নম্বর (NID Number)</label>
              <input type="text" className="form-control" value={regNid} onChange={(e) => setRegNid(e.target.value)} placeholder="1990123456789" />
            </div>
            <div className="form-group">
              <label>ভূমিকা / রোল (Role)</label>
              <select className="form-control" value={regRole} onChange={(e) => setRegRole(e.target.value)}>
                <option value="citizen">কৃষক / নাগরিক (Citizen)</option>
                <option value="officer">উপসহকারী কৃষি কর্মকর্তা (Officer)</option>
              </select>
            </div>
            <div className="form-group">
              <label>পাসওয়ার্ড (Password)</label>
              <input type="password" className="form-control" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required placeholder="নূন্যতম ৬ অক্ষর" />
            </div>
            <button type="submit" className="btn">নিবন্ধন সম্পন্ন করুন</button>
          </form>
        )}

        {activeTab === 'recovery' && (
          recoveryStep === 1 ? (
            <form onSubmit={handleRequestRecovery}>
              <div className="form-group">
                <label>নিবন্ধিত মোবাইল নম্বর</label>
                <input type="text" className="form-control" value={resetPhone} onChange={(e) => setResetPhone(e.target.value)} required placeholder="+8801812345678" />
              </div>
              <button type="submit" className="btn">যাচাইকরণ পাঠান</button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label>জাতীয় পরিচয়পত্র (NID) নম্বর</label>
                <input type="text" className="form-control" value={resetNid} onChange={(e) => setResetNid(e.target.value)} required placeholder="1990123456789" />
              </div>
              <div className="form-group">
                <label>নতুন পাসওয়ার্ড</label>
                <input type="password" className="form-control" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required placeholder="নূন্যতম ৬ অক্ষর" />
              </div>
              <button type="submit" className="btn">পাসওয়ার্ড রিসেট করুন</button>
            </form>
          )
        )}
      </div>
    </div>
  );
}
