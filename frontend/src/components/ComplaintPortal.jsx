import React, { useState, useEffect } from 'react';
import StatusBadge from './ui/StatusBadge';
import EmptyState from './ui/EmptyState';
import ErrorAlert from './ui/ErrorAlert';

export default function ComplaintPortal({ currentUser, authToken, onOpenAuth }) {
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

  const isOfficer = currentUser && (currentUser.role === 'officer' || currentUser.role === 'admin');

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
      onOpenAuth();
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
        }, 1500);
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
    <div className="card col-12" style={{ marginTop: '2rem' }}>
      <div className="card-header">
        <h2>📢 নাগরিক অভিযোগ ও প্রতিকার পোর্টাল (Complaint & Redressal Portal)</h2>
        <span className="pattern-tag">Observer Pattern Integrated</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <p style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
          কৃষি সার সংস্থান, সেচ সমস্যা বা নাগরিক সেবা সংক্রান্ত যেকোনো অভিযোগ সরাসরি উপজেলা কৃষি অফিসে দাখিল করুন।
        </p>

        <button
          className="btn"
          style={{ width: 'auto', padding: '0.6rem 1.25rem' }}
          onClick={() => {
            if (!authToken) onOpenAuth();
            else setIsCreateModalOpen(true);
          }}
        >
          ➕ নতুন অভিযোগ দাখিল করুন
        </button>
      </div>

      {!authToken ? (
        <EmptyState
          icon="📢"
          title="লগইন প্রয়োজন"
          description="আপনার জমাকৃত অভিযোগের স্থিতি ও ট্র্যাকিং দেখতে অনুগ্রহ করে একাউন্টে সাইন-ইন করুন।"
          actionLabel="প্রবেশ করুন / সাইন-ইন"
          onAction={onOpenAuth}
        />
      ) : complaints.length === 0 ? (
        <EmptyState
          icon="📢"
          title="কোন জমাকৃত অভিযোগ পাওয়া যায়নি"
          description="আপনি এখনও কোন অভিযোগ রেজিস্টার করেননি।"
        />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>অভিযোগ আইডি</th>
                <th>ক্যাটাগরি</th>
                <th>অভিযোগকারী</th>
                <th>বিবরণ</th>
                <th>স্ট্যাটাস</th>
                <th>দায়িত্বপ্রাপ্ত কর্মকর্তা</th>
                <th>তারিখ</th>
                <th>অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) => (
                <tr key={c.id}>
                  <td style={{ color: '#38bdf8', fontWeight: 'bold' }}>{c.complaint_number}</td>
                  <td style={{ fontWeight: '600' }}>{c.category}</td>
                  <td>{c.complainant_name || 'নাগরিক'} ({c.complainant_phone || 'N/A'})</td>
                  <td style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {c.description}
                  </td>
                  <td>
                    <StatusBadge status={c.status} />
                  </td>
                  <td>{c.assigned_officer_name || 'প্রক্রিয়াধীন'}</td>
                  <td>{new Date(c.created_at).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        setSelectedComplaint(c);
                        setNewStatus(c.status);
                        setResolutionNotes(c.resolution_notes || '');
                        setStatusUpdateMsg('');
                      }}
                    >
                      বিস্তারিত
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isCreateModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>নতুন অভিযোগ দাখিল ফরম</h3>
              <button className="close-btn" onClick={() => setIsCreateModalOpen(false)}>✕</button>
            </div>

            {submitSuccessMsg ? (
              <div style={{ color: '#34d399', background: 'rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                {submitSuccessMsg}
              </div>
            ) : (
              <form onSubmit={handleCreateSubmit}>
                <ErrorAlert message={submitError} onDismiss={() => setSubmitError('')} />
                
                <div className="form-group">
                  <label>অভিযোগের বিষয় / ক্যাটাগরি</label>
                  <select className="form-control" value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="সার সংকট">সার সংকট ও ডিলার সমস্যা</option>
                    <option value="কৃষি সেচ">কৃষি সেচ ও বিদ্যুৎ সংযোগ</option>
                    <option value="দুর্নীতি ও স্বজনপ্রীতি">অনিয়ম ও দুর্নীতি অভিযোগ</option>
                    <option value="ভেজাল বালাইনাশক">ভেজাল বালাইনাশক ও বীজ</option>
                    <option value="অন্যান্য">অন্যান্য অভিযোগ</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>অভিযোগের বিস্তারিত বিবরণ (কমপক্ষে ১০ অক্ষর)</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="ঘটনার স্থান, সময় ও ঘটনার বিস্তারিত লিখুন..."
                    required
                  />
                </div>

                <button type="submit" className="btn">অভিযোগ দাখিল করুন</button>
              </form>
            )}
          </div>
        </div>
      )}

      {selectedComplaint && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h3>অভিযোগ ট্র্যাকিং: {selectedComplaint.complaint_number}</h3>
              <button className="close-btn" onClick={() => setSelectedComplaint(null)}>✕</button>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
              <p style={{ color: '#38bdf8', fontWeight: 'bold' }}>ক্যাটাগরি: {selectedComplaint.category}</p>
              <p style={{ fontSize: '0.9rem', color: '#f8fafc', margin: '0.5rem 0' }}>{selectedComplaint.description}</p>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                অভিযোগকারী: {selectedComplaint.complainant_name} ({selectedComplaint.complainant_phone})
              </p>
            </div>

            <h4 style={{ fontSize: '0.95rem', color: '#34d399', marginBottom: '0.5rem' }}>অডিট ট্রেইল ও টাইমলাইন (Observer History):</h4>
            <div className="timeline" style={{ marginBottom: '1.25rem' }}>
              {selectedComplaint.history.map((log) => (
                <div key={log.id} className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong style={{ color: '#38bdf8' }}>{log.action} ({log.new_status})</strong>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '0.25rem' }}>{log.remarks}</p>
                </div>
              ))}
            </div>

            {isOfficer && (
              <div style={{ background: 'rgba(30, 41, 59, 0.8)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <h4 style={{ fontSize: '0.9rem', color: '#34d399', marginBottom: '0.75rem' }}>👮‍♂️ কর্মকর্তা তদন্ত ও অ্যাকশন প্যানেল (Officer Resolution)</h4>
                
                {statusUpdateMsg && <p style={{ color: '#34d399', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{statusUpdateMsg}</p>}

                <form onSubmit={handleStatusUpdateSubmit}>
                  <div className="form-group">
                    <label>নতুন স্ট্যাটাস নির্ধারণ</label>
                    <select className="form-control" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                      <option value="Pending">Pending (পেন্ডিং)</option>
                      <option value="Under Investigation">Under Investigation (তদন্তাধীন)</option>
                      <option value="Resolved">Resolved (নিষ্পন্ন)</option>
                      <option value="Rejected">Rejected (বাতিল)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>তদন্তের পর্যবেক্ষণ / সমাধান মন্তব্য</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="তদন্তের সিদ্ধান্ত ও সমাধান মন্তব্য লিখুন..."
                    />
                  </div>

                  <button type="submit" className="btn">স্ট্যাটাস ও নোটিফিকেশন আপডেট করুন (Notify Observers)</button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
