import React, { useState, useEffect } from 'react';
import StatusBadge from './ui/StatusBadge';
import EmptyState from './ui/EmptyState';
import ErrorAlert from './ui/ErrorAlert';

export default function CitizenPortal({ currentUser, authToken, onOpenAuth }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [categories, setCategories] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [savedServices, setSavedServices] = useState([]);
  const [stats, setStats] = useState(null);

  const [selectedService, setSelectedService] = useState(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applyRemarks, setApplyRemarks] = useState('');
  const [applySuccessMsg, setApplySuccessMsg] = useState('');

  const [trackQuery, setTrackQuery] = useState('');
  const [trackedApp, setTrackedApp] = useState(null);
  const [trackError, setTrackError] = useState('');

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/services/categories');
      if (res.ok) setCategories(await res.json());
    } catch (e) {}
  };

  const fetchUserData = async () => {
    if (!authToken) return;
    const headers = { 'Authorization': `Bearer ${authToken}` };
    try {
      const [appsRes, notifsRes, savedRes, statsRes] = await Promise.all([
        fetch('/api/applications/my-applications', { headers }),
        fetch('/api/notifications', { headers }),
        fetch('/api/services/saved/my-saved', { headers }),
        fetch('/api/citizens/stats', { headers })
      ]);
      if (appsRes.ok) setMyApplications(await appsRes.json());
      if (notifsRes.ok) setNotifications(await notifsRes.json());
      if (savedRes.ok) setSavedServices(await savedRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (e) {}
  };

  useEffect(() => {
    fetchCategories();
    if (authToken) {
      fetchUserData();
    }
  }, [authToken]);

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!authToken) {
      onOpenAuth();
      return;
    }
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
        fetchUserData();
        setTimeout(() => {
          setIsApplyModalOpen(false);
          setApplySuccessMsg('');
          setSelectedService(null);
          setActiveTab('my_applications');
        }, 1500);
      }
    } catch (e) {}
  };

  const handleTrackSubmit = async (e) => {
    e.preventDefault();
    setTrackError('');
    setTrackedApp(null);
    try {
      const res = await fetch(`/api/applications/track/${encodeURIComponent(trackQuery)}`);
      const data = await res.json();
      if (res.ok) {
        setTrackedApp(data);
      } else {
        setTrackError(data.detail || 'আবেদনটি খুঁজে পাওয়া যায়নি। ট্র্যাকিং কোড যাচাই করুন।');
      }
    } catch (e) {
      setTrackError('নেটওয়ার্ক ত্রুটি!');
    }
  };

  const handleToggleSave = async (serviceId, serviceNameBn) => {
    if (!authToken) {
      onOpenAuth();
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
      fetchUserData();
    } catch (e) {}
  };

  const handleMarkNotificationRead = async (notifId) => {
    if (!authToken) return;
    try {
      await fetch(`/api/notifications/${notifId}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      fetchUserData();
    } catch (e) {}
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div>
      <div className="portal-nav">
        <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
          🏠 নাগরিক হোম (Dashboard)
        </button>
        <button className={`nav-item ${activeTab === 'services' ? 'active' : ''}`} onClick={() => setActiveTab('services')}>
          📂 সেবা ডিরেক্টরি (Services)
        </button>
        <button className={`nav-item ${activeTab === 'tracking' ? 'active' : ''}`} onClick={() => setActiveTab('tracking')}>
          🔍 ট্র্যাকিং (Track)
        </button>
        <button className={`nav-item ${activeTab === 'my_applications' ? 'active' : ''}`} onClick={() => setActiveTab('my_applications')}>
          📁 আমার আবেদন ({myApplications.length})
        </button>
        <button className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>
          🔔 নোটিফিকেশন {unreadCount > 0 && <span className="nav-item-badge">{unreadCount}</span>}
        </button>
      </div>

      {activeTab === 'dashboard' && stats && (
        <div className="grid-layout" style={{ marginBottom: '1.5rem' }}>
          <div className="stat-box col-3">
            <div className="stat-value">{stats.total_applications}</div>
            <div className="stat-label">মোট দাখিলকৃত আবেদন</div>
          </div>
          <div className="stat-box col-3">
            <div className="stat-value" style={{ color: '#fbbf24' }}>{stats.pending_applications}</div>
            <div className="stat-label">পেন্ডিং প্রক্রিয়াধীন</div>
          </div>
          <div className="stat-box col-3">
            <div className="stat-value" style={{ color: '#34d399' }}>{stats.approved_applications}</div>
            <div className="stat-label">অনুমোদিত সেবা</div>
          </div>
          <div className="stat-box col-3">
            <div className="stat-value" style={{ color: '#38bdf8' }}>{stats.saved_services_count}</div>
            <div className="stat-label">বুকমার্ককৃত প্রিয় সেবা</div>
          </div>
        </div>
      )}

      {activeTab === 'services' && (
        <div>
          {categories.map((cat) => (
            <div key={cat.id} style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>{cat.icon}</span> {cat.title_bn}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>{cat.description_bn}</p>
              
              <div className="grid-layout">
                {cat.sub_services.map((sub) => {
                  const isSaved = savedServices.some((s) => s.service_id === sub.id);
                  return (
                    <div key={sub.id} className="service-card col-4">
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <h4 style={{ fontSize: '1.05rem', color: '#f8fafc', marginBottom: '0.5rem' }}>{sub.name_bn}</h4>
                          <button
                            onClick={() => handleToggleSave(sub.id, sub.name_bn)}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}
                          >
                            {isSaved ? '⭐' : '☆'}
                          </button>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1rem', lineHeight: '1.4' }}>{sub.description_bn}</p>
                        
                        <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '1rem' }}>
                          <p>⏱️ প্রক্রিয়াকরণ সময়: {sub.processing_days} কার্যদিবস</p>
                          <p>💳 সরকারি ফি: {sub.fee_bdt === 0 ? 'বিনামূল্যে' : `${sub.fee_bdt} টাকা`}</p>
                        </div>
                      </div>

                      <button
                        className="btn"
                        onClick={() => {
                          setSelectedService(sub);
                          setIsApplyModalOpen(true);
                        }}
                      >
                        আবেদন করুন (Apply)
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'tracking' && (
        <div className="card col-12">
          <div className="card-header">
            <h2>🔍 ডিজিটাল আবেদন ট্র্যাকিং (Live Tracking)</h2>
          </div>
          
          <form onSubmit={handleTrackSubmit} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <input
              type="text"
              className="form-control"
              placeholder="আবেদন আইডি (যেমন: APP-2026-8801) অথবা মোবাইল নম্বর প্রবেশ করুন"
              value={trackQuery}
              onChange={(e) => setTrackQuery(e.target.value)}
              required
            />
            <button type="submit" className="btn" style={{ width: '180px' }}>আবেদন খুঁজুন</button>
          </form>

          <ErrorAlert message={trackError} onDismiss={() => setTrackError('')} />

          {trackedApp && (
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1.25rem', borderRadius: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', color: '#38bdf8' }}>{trackedApp.sub_service_name}</h3>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>আবেদন আইডি: {trackedApp.application_number} | আবেদনের তারিখ: {new Date(trackedApp.created_at).toLocaleDateString()}</p>
                </div>
                <StatusBadge status={trackedApp.status} />
              </div>

              <div className="timeline">
                {trackedApp.history.map((log) => (
                  <div key={log.id} className="timeline-item">
                    <div className="timeline-dot"></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong style={{ color: '#34d399' }}>{log.action} ({log.new_status})</strong>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '0.25rem' }}>{log.remarks}</p>
                    {log.performed_by && <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>দায়িত্বপ্রাপ্ত কর্মকর্তা: {log.performed_by}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'my_applications' && (
        <div className="card col-12">
          <div className="card-header">
            <h2>📁 আমার জমাকৃত আবেদনসমূহ (My Applications)</h2>
          </div>

          {!authToken ? (
            <EmptyState
              icon="🔒"
              title="লগইন প্রয়োজন"
              description="আপনার জমাকৃত আবেদনের তালিকা দেখতে অনুগ্রহ করে একাউন্টে সাইন-ইন করুন।"
              actionLabel="লগইন / সাইন-ইন"
              onAction={onOpenAuth}
            />
          ) : myApplications.length === 0 ? (
            <EmptyState
              icon="📁"
              title="কোন জমাকৃত আবেদন নেই"
              description="আপনি এখনও কোন সেবার জন্য অনলাইন আবেদন করেননি। সেবা ডিরেক্টরি থেকে সরাসরি আবেদন করতে পারেন।"
              actionLabel="সেবা ডিরেক্টরি দেখুন"
              onAction={() => setActiveTab('services')}
            />
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>আবেদন আইডি</th>
                    <th>সেবার নাম</th>
                    <th>আবেদনকারী</th>
                    <th>স্ট্যাটাস</th>
                    <th>দায়িত্বপ্রাপ্ত কর্মকর্তা</th>
                    <th>তারিখ</th>
                  </tr>
                </thead>
                <tbody>
                  {myApplications.map((appItem) => (
                    <tr key={appItem.id}>
                      <td style={{ color: '#38bdf8', fontWeight: 'bold' }}>{appItem.application_number}</td>
                      <td>{appItem.sub_service_name}</td>
                      <td>{appItem.applicant_name} ({appItem.applicant_phone})</td>
                      <td>
                        <StatusBadge status={appItem.status} />
                      </td>
                      <td>{appItem.assigned_officer_name || 'প্রক্রিয়াধীন'}</td>
                      <td>{new Date(appItem.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="card col-12">
          <div className="card-header">
            <h2>🔔 নাগরিক নোটিফিকেশন সেন্টার (Notification Dispatcher)</h2>
          </div>

          {!authToken ? (
            <EmptyState
              icon="🔔"
              title="লগইন প্রয়োজন"
              description="আপনার নোটিফিকেশন বার্তা ও আপডেট দেখতে অনুগ্রহ করে সাইন-ইন করুন।"
              actionLabel="লগইন করুন"
              onAction={onOpenAuth}
            />
          ) : notifications.length === 0 ? (
            <EmptyState
              icon="🔔"
              title="কোন নোটিফিকেশন নেই"
              description="আপনার একাউন্টে বর্তমানে নতুন কোন সিস্টেম নোটিফিকেশন বা বার্তা নেই।"
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {notifications.map((n) => (
                <div
                  key={n.id}
                  style={{
                    background: n.is_read ? 'rgba(15, 23, 42, 0.4)' : 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid ' + (n.is_read ? 'rgba(255,255,255,0.08)' : 'rgba(16, 185, 129, 0.3)'),
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '0.95rem', color: '#f8fafc', marginBottom: '0.25rem' }}>{n.title}</h4>
                    <p style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>{n.message}</p>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      {new Date(n.created_at).toLocaleString()} | চ্যানেল: {n.channel.toUpperCase()}
                    </span>
                  </div>
                  {!n.is_read && (
                    <button className="btn-secondary" onClick={() => handleMarkNotificationRead(n.id)}>
                      পড়া হয়েছে
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {isApplyModalOpen && selectedService && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>আবেদন ফরম: {selectedService.name_bn}</h3>
              <button className="close-btn" onClick={() => setIsApplyModalOpen(false)}>✕</button>
            </div>

            {applySuccessMsg ? (
              <div style={{ color: '#34d399', background: 'rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                {applySuccessMsg}
              </div>
            ) : (
              <form onSubmit={handleApplySubmit}>
                <div className="form-group">
                  <label>আবেদনকারীর নাম</label>
                  <input type="text" className="form-control" value={currentUser?.full_name || ''} readOnly placeholder="নাম প্রবেশ করুন" />
                </div>
                <div className="form-group">
                  <label>মোবাইল নম্বর</label>
                  <input type="text" className="form-control" value={currentUser?.phone_number || ''} readOnly placeholder="+8801812345678" />
                </div>
                <div className="form-group">
                  <label>প্রয়োজনীয় কাগজপত্র (Required Documents)</label>
                  <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '1rem' }}>
                    {selectedService.required_documents.map((doc, idx) => (
                      <li key={idx}>{doc}</li>
                    ))}
                  </ul>
                </div>
                <div className="form-group">
                  <label>বিশেষ মন্তব্য / নোট (Remarks)</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={applyRemarks}
                    onChange={(e) => setApplyRemarks(e.target.value)}
                    placeholder="আবেদনের জন্য অতিরিক্ত বিবরণ (ঐচ্ছিক)"
                  />
                </div>
                <button type="submit" className="btn">অনলাইনে আবেদন জমা দিন</button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
