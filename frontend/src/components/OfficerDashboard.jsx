import React, { useState, useEffect } from 'react';
import StatusBadge from './ui/StatusBadge';
import EmptyState from './ui/EmptyState';
import LoadingSpinner from './ui/LoadingSpinner';
import ErrorAlert from './ui/ErrorAlert';

export default function OfficerDashboard({ currentUser, authToken, onOpenAuth }) {
  const isOfficerOrAdmin = currentUser && (currentUser.role === 'officer' || currentUser.role === 'admin');

  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [complaints, setComplaints] = useState([]);
  
  const [activeTab, setActiveTab] = useState('applications');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  const [selectedApp, setSelectedApp] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  
  const [newStatus, setNewStatus] = useState('Approved');
  const [officerRemarks, setOfficerRemarks] = useState('');
  const [updateError, setUpdateError] = useState('');

  const fetchOfficerStats = async () => {
    if (!authToken || !isOfficerOrAdmin) return;
    try {
      const res = await fetch('/api/officer/stats', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) setStats(await res.json());
    } catch (e) {}
  };

  const fetchApplications = async () => {
    if (!authToken || !isOfficerOrAdmin) return;
    setLoading(true);
    try {
      const url = statusFilter && statusFilter !== 'all' ? `/api/officer/applications?status=${statusFilter}` : '/api/officer/applications';
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) setApplications(await res.json());
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const fetchComplaints = async () => {
    if (!authToken || !isOfficerOrAdmin) return;
    setLoading(true);
    try {
      const url = statusFilter && statusFilter !== 'all' ? `/api/officer/complaints?status=${statusFilter}` : '/api/officer/complaints';
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) setComplaints(await res.json());
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authToken && isOfficerOrAdmin) {
      fetchOfficerStats();
      if (activeTab === 'applications') fetchApplications();
      if (activeTab === 'complaints') fetchComplaints();
    }
  }, [authToken, currentUser, activeTab, statusFilter]);

  const handleAppStatusUpdate = async (e) => {
    e.preventDefault();
    setUpdateError('');
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
    }
  };

  const handleComplaintStatusUpdate = async (e) => {
    e.preventDefault();
    setUpdateError('');
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
    }
  };

  if (!authToken) {
    return (
      <div className="card col-12" style={{ marginTop: '2rem' }}>
        <EmptyState
          icon="👮‍♂️"
          title="দায়িত্বপ্রাপ্ত কর্মকর্তা ড্যাশবোর্ড"
          description="কর্মকর্তা ড্যাশবোর্ডে প্রবেশের জন্য প্রথমে সরকারি কর্মকর্তা একাউন্টে সাইন-ইন করুন।"
          actionLabel="কর্মকর্তা সাইন-ইন করুন"
          onAction={onOpenAuth}
        />
      </div>
    );
  }

  if (!isOfficerOrAdmin) {
    return (
      <div className="card col-12" style={{ marginTop: '2rem' }}>
        <EmptyState
          icon="⚠️"
          title="অনুমতি সংরক্ষিত (Restricted Access)"
          description="দুঃখিত, এই এলাকাটি শুধুমাত্র দায়িত্বপ্রাপ্ত উপজেলা কর্মকর্তা ও প্রশাসনদের জন্য সংরক্ষিত।"
        />
      </div>
    );
  }

  return (
    <div className="card col-12" style={{ marginTop: '2rem' }}>
      <div className="card-header">
        <h2>👮‍♂️ সরকারি কর্মকর্তা ও প্রশাসন ব্যবস্থাপনা প্যানেল (Officer Operations)</h2>
        <span className="pattern-tag">Observer Event Notifications Integration</span>
      </div>

      {stats && (
        <div className="grid-layout" style={{ marginBottom: '2rem' }}>
          <div className="stat-box col-4" style={{ background: 'rgba(56, 189, 248, 0.1)' }}>
            <div className="stat-value" style={{ color: '#38bdf8' }}>{stats.assigned_applications_count}</div>
            <div className="stat-label">মোট দায়িত্বপ্রাপ্ত সেবা আবেদন</div>
            <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '0.25rem' }}>
              অপেক্ষমাণ: {stats.pending_applications_count} | অনুমোদন: {stats.approved_applications_count}
            </div>
          </div>

          <div className="stat-box col-4" style={{ background: 'rgba(251, 191, 36, 0.1)' }}>
            <div className="stat-value" style={{ color: '#fbbf24' }}>{stats.assigned_complaints_count}</div>
            <div className="stat-label">মোট দায়িত্বপ্রাপ্ত নাগরিক অভিযোগ</div>
            <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '0.25rem' }}>
              তদন্তাধীন/অপেক্ষমাণ: {stats.pending_complaints_count} | মীমাংসিত: {stats.resolved_complaints_count}
            </div>
          </div>

          <div className="stat-box col-4" style={{ background: 'rgba(52, 211, 153, 0.1)' }}>
            <div className="stat-value" style={{ color: '#34d399' }}>{stats.approved_applications_count + stats.resolved_complaints_count}</div>
            <div className="stat-label">মোট সফল সমাধানকৃত ফাইল</div>
            <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '0.25rem' }}>
              স্বয়ংক্রিয় এসএমএস ও ড্যাশবোর্ড নোটিফিকেশন প্রেরিত
            </div>
          </div>
        </div>
      )}

      <div className="portal-nav" style={{ marginBottom: '1.5rem' }}>
        <button
          className={`nav-item ${activeTab === 'applications' ? 'active' : ''}`}
          onClick={() => { setActiveTab('applications'); setStatusFilter('all'); }}
        >
          📋 নাগরিক সেবা আবেদন ({applications.length})
        </button>
        <button
          className={`nav-item ${activeTab === 'complaints' ? 'active' : ''}`}
          onClick={() => { setActiveTab('complaints'); setStatusFilter('all'); }}
        >
          📢 নাগরিক অভিযোগ ও সমাধান ({complaints.length})
        </button>
      </div>

      {activeTab === 'applications' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#38bdf8' }}>নাগরিক সেবা আবেদনের তালিকা (Service Applications)</h3>
            <select
              className="form-control"
              style={{ width: '200px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">সকল অবস্থা</option>
              <option value="Pending">অপেক্ষমাণ (Pending)</option>
              <option value="In Progress">প্রক্রিয়াধীন (In Progress)</option>
              <option value="Approved">অনুমোদিত (Approved)</option>
              <option value="Rejected">বাতিল (Rejected)</option>
            </select>
          </div>

          {loading ? (
            <LoadingSpinner message="নাগরিক সেবা আবেদনসমূহ লোড হচ্ছে..." />
          ) : applications.length === 0 ? (
            <EmptyState
              icon="📋"
              title="কোন সেবা আবেদন পাওয়া যায়নি"
              description="বর্তমানে দায়িত্বপ্রাপ্ত তালিকায় কোন নাগরিক সেবা আবেদন নথিভুক্ত নেই।"
            />
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>আবেদন নম্বর</th>
                    <th>আবেদনকারী</th>
                    <th>মোবাইল</th>
                    <th>সেবা বিষয়</th>
                    <th>বর্তমান অবস্থা</th>
                    <th>তারিখ</th>
                    <th>কার্যক্রম</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id}>
                      <td style={{ color: '#34d399', fontWeight: 'bold' }}>{app.application_number}</td>
                      <td>{app.applicant_name}</td>
                      <td>{app.applicant_phone}</td>
                      <td>{app.sub_service_name}</td>
                      <td>
                        <StatusBadge status={app.status} />
                      </td>
                      <td>{new Date(app.created_at).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="btn"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                          onClick={() => {
                            setSelectedApp(app);
                            setNewStatus(app.status);
                            setOfficerRemarks(app.remarks || '');
                          }}
                        >
                          অ্যাকশন / আপডেট
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'complaints' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#38bdf8' }}>নাগরিক অভিযোগ ও তদন্ত ব্যবস্থা (Complaints Management)</h3>
            <select
              className="form-control"
              style={{ width: '200px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">সকল অবস্থা</option>
              <option value="Pending">অপেক্ষমাণ (Pending)</option>
              <option value="Under Investigation">তদন্তাধীন (Under Investigation)</option>
              <option value="Resolved">মীমাংসিত (Resolved)</option>
              <option value="Rejected">বাতিল (Rejected)</option>
            </select>
          </div>

          {loading ? (
            <LoadingSpinner message="নাগরিক অভিযোগ ফাইলসমূহ লোড হচ্ছে..." />
          ) : complaints.length === 0 ? (
            <EmptyState
              icon="📢"
              title="কোন নাগরিক অভিযোগ পাওয়া যায়নি"
              description="বর্তমানে দায়িত্বপ্রাপ্ত তালিকায় কোন নাগরিক অভিযোগ নথিভুক্ত নেই।"
            />
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>অভিযোগ আইডি</th>
                    <th>অভিযোগকারী</th>
                    <th>বিষয় / ক্যাটাগরি</th>
                    <th>অবস্থা</th>
                    <th>তারিখ</th>
                    <th>কার্যক্রম</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((comp) => (
                    <tr key={comp.id}>
                      <td style={{ color: '#fca5a5', fontWeight: 'bold' }}>{comp.complaint_number}</td>
                      <td>{comp.complainant_name} ({comp.complainant_phone})</td>
                      <td>{comp.title} ({comp.category})</td>
                      <td>
                        <StatusBadge status={comp.status} />
                      </td>
                      <td>{new Date(comp.created_at).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="btn"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                          onClick={() => {
                            setSelectedComplaint(comp);
                            setNewStatus(comp.status);
                            setOfficerRemarks(comp.description || '');
                          }}
                        >
                          তদন্ত ও সমাধান
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {selectedApp && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>আবেদন সিদ্ধান্ত হালনাগাদ: {selectedApp.application_number}</h3>
              <button className="close-btn" onClick={() => setSelectedApp(null)}>✕</button>
            </div>

            <form onSubmit={handleAppStatusUpdate}>
              <ErrorAlert message={updateError} onDismiss={() => setUpdateError('')} />

              <p style={{ color: '#f8fafc', marginBottom: '0.5rem' }}>আবেদনকারী: <strong>{selectedApp.applicant_name}</strong> ({selectedApp.applicant_phone})</p>
              <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '1rem' }}>সেবা বিষয়: {selectedApp.sub_service_name}</p>

              <div className="form-group">
                <label>আবেদন সিদ্ধান্ত / নতুন অবস্থা</label>
                <select className="form-control" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                  <option value="Approved">অনুমোদিত (Approved)</option>
                  <option value="In Progress">প্রক্রিয়াধীন (In Progress)</option>
                  <option value="Rejected">বাতিল (Rejected)</option>
                </select>
              </div>

              <div className="form-group">
                <label>কর্মকর্তার মন্তব্য / দাপ্তরিক নির্দেশিকা</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="নাগরিকের জন্য দাপ্তরিক মন্তব্য বা আদেশের নির্দেশ লিখুন..."
                  value={officerRemarks}
                  onChange={(e) => setOfficerRemarks(e.target.value)}
                ></textarea>
              </div>

              <button type="submit" className="btn">সিদ্ধান্ত সংরক্ষণ করুন (Observer Notify)</button>
            </form>
          </div>
        </div>
      )}

      {selectedComplaint && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>অভিযোগ তদন্ত সিদ্ধান্ত: {selectedComplaint.complaint_number}</h3>
              <button className="close-btn" onClick={() => setSelectedComplaint(null)}>✕</button>
            </div>

            <form onSubmit={handleComplaintStatusUpdate}>
              <ErrorAlert message={updateError} onDismiss={() => setUpdateError('')} />

              <p style={{ color: '#f8fafc', marginBottom: '0.5rem' }}>অভিযোগকারী: <strong>{selectedComplaint.complainant_name}</strong></p>
              <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '1.5rem' }}>অভিযোগ বিবরণ: {selectedComplaint.description}</p>

              <div className="form-group">
                <label>তদন্ত অবস্থা</label>
                <select className="form-control" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                  <option value="Under Investigation">তদন্তাধীন (Under Investigation)</option>
                  <option value="Resolved">মীমাংসিত (Resolved)</option>
                  <option value="Rejected">বাতিল (Rejected)</option>
                </select>
              </div>

              <div className="form-group">
                <label>তদন্ত রিপোর্ট / কর্মকর্তার পর্যবেক্ষণ</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="তদন্ত রিপোর্ট বা নিষ্পত্তির বিবরণ লিখুন..."
                  value={officerRemarks}
                  onChange={(e) => setOfficerRemarks(e.target.value)}
                ></textarea>
              </div>

              <button type="submit" className="btn">তদন্ত ফল সংরক্ষণ করুন</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
