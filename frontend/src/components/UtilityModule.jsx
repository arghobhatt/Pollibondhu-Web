import React, { useState, useEffect } from 'react';
import StatusBadge from './ui/StatusBadge';
import EmptyState from './ui/EmptyState';
import ErrorAlert from './ui/ErrorAlert';

export default function UtilityModule({ currentUser, authToken, onOpenAuth }) {
  const [billTypes, setBillTypes] = useState([]);
  const [selectedBillType, setSelectedBillType] = useState(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [amountBdt, setAmountBdt] = useState(1250);

  const [myBills, setMyBills] = useState([]);
  const [paymentSuccessReceipt, setPaymentSuccessReceipt] = useState(null);
  const [paymentError, setPaymentError] = useState('');
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);

  const fetchBillTypes = async () => {
    try {
      const res = await fetch('/api/utility/bill-types');
      if (res.ok) {
        const types = await res.json();
        setBillTypes(types);
        if (types.length > 0) setSelectedBillType(types[0]);
      }
    } catch (e) {}
  };

  const fetchMyBills = async () => {
    if (!authToken) return;
    try {
      const res = await fetch('/api/utility/my-bills', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) setMyBills(await res.json());
    } catch (e) {}
  };

  useEffect(() => {
    fetchBillTypes();
    if (authToken) fetchMyBills();
  }, [authToken]);

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    if (!authToken) {
      onOpenAuth();
      return;
    }
    setPaymentSuccessReceipt(null);
    setPaymentError('');

    try {
      const res = await fetch('/api/utility/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          bill_type: selectedBillType.id,
          account_number: accountNumber,
          amount_bdt: parseFloat(amountBdt)
        })
      });
      const data = await res.json();
      if (res.ok) {
        setPaymentSuccessReceipt(data);
        fetchMyBills();
      } else {
        setPaymentError(data.detail || 'বিল পরিশোধ ব্যর্থ হয়েছে।');
      }
    } catch (e) {
      setPaymentError('নেটওয়ার্ক ত্রুটি!');
    }
  };

  return (
    <div className="card col-12" style={{ marginTop: '2rem' }}>
      <div className="card-header">
        <h2>⚡ পল্লীবন্ধু ইউটিলিটি ও সরকারি বিল পরিষদ কেন্দ্র (Utility Portal)</h2>
        <span className="pattern-tag">DB Workflow Persistence</span>
      </div>

      <div className="grid-layout" style={{ marginBottom: '2rem' }}>
        {billTypes.map((bt) => (
          <div
            key={bt.id}
            className="service-card col-3"
            style={{
              borderColor: selectedBillType?.id === bt.id ? '#10b981' : 'var(--card-border)',
              background: selectedBillType?.id === bt.id ? 'rgba(16, 185, 129, 0.1)' : 'var(--surface-dark)',
              cursor: 'pointer'
            }}
            onClick={() => setSelectedBillType(bt)}
          >
            <div>
              <div style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>{bt.icon}</div>
              <h4 style={{ fontSize: '1.05rem', color: '#f8fafc', marginBottom: '0.25rem' }}>{bt.name_bn}</h4>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.75rem' }}>{bt.biller_name_bn}</p>
              <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.4' }}>{bt.description_bn}</p>
            </div>
            <button
              className="btn"
              style={{ marginTop: '1rem' }}
              onClick={() => {
                setSelectedBillType(bt);
                setIsPayModalOpen(true);
                setPaymentSuccessReceipt(null);
                setPaymentError('');
              }}
            >
              বিল প্রদান করুন
            </button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '1rem' }}>
        <h3 style={{ fontSize: '1.1rem', color: '#38bdf8', marginBottom: '1rem' }}>📜 আমার ইউটিলিটি বিল পরিশোধের ইতিহাস (Payment History)</h3>
        
        {!authToken ? (
          <EmptyState
            icon="⚡"
            title="লগইন প্রয়োজন"
            description="বিল পরিশোধের ইতিহাস দেখতে সাইন-ইন করুন।"
            actionLabel="প্রবেশ করুন / সাইন-ইন"
            onAction={onOpenAuth}
          />
        ) : myBills.length === 0 ? (
          <EmptyState
            icon="⚡"
            title="কোন পূর্ববর্তী পরিশোধ নেই"
            description="আপনার একাউন্টে কোন বিল পরিশোধের অতীত রেকর্ড পাওয়া যায়নি।"
          />
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ট্রানজেকশন আইডি</th>
                  <th>সেবা প্রতিষ্ঠান</th>
                  <th>হিসাব / মিটার নম্বর</th>
                  <th>পরিশোধিত পরিমাণ</th>
                  <th>স্ট্যাটাস</th>
                  <th>পরিশোধের সময়</th>
                </tr>
              </thead>
              <tbody>
                {myBills.map((b) => (
                  <tr key={b.id}>
                    <td style={{ color: '#34d399', fontWeight: 'bold' }}>{b.transaction_id}</td>
                    <td>{b.biller_name_bn}</td>
                    <td>{b.account_number}</td>
                    <td style={{ color: '#38bdf8', fontWeight: 'bold' }}>{b.amount_bdt} ৳</td>
                    <td>
                      <StatusBadge status={b.status} />
                    </td>
                    <td>{new Date(b.paid_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isPayModalOpen && selectedBillType && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>বিল প্রদান: {selectedBillType.name_bn}</h3>
              <button className="close-btn" onClick={() => setIsPayModalOpen(false)}>✕</button>
            </div>

            {paymentSuccessReceipt ? (
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', padding: '1.25rem', borderRadius: '0.75rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✅</div>
                <h4 style={{ color: '#34d399', fontSize: '1.1rem', marginBottom: '0.5rem' }}>বিল পরিশোধ সফল হয়েছে!</h4>
                <p style={{ fontSize: '0.9rem', color: '#f8fafc' }}>ট্রানজেকশন আইডি: <strong>{paymentSuccessReceipt.transaction_id}</strong></p>
                <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: '0.25rem 0' }}>প্রতিষ্ঠান: {paymentSuccessReceipt.biller_name_bn}</p>
                <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: '0.25rem 0' }}>হিসাব নম্বর: {paymentSuccessReceipt.account_number}</p>
                <p style={{ fontSize: '1.1rem', color: '#34d399', fontWeight: 'bold', marginTop: '0.5rem' }}>মোট টাকা: {paymentSuccessReceipt.amount_bdt} ৳</p>
                <button className="btn" style={{ marginTop: '1rem' }} onClick={() => setIsPayModalOpen(false)}>রসিদ বন্ধ করুন</button>
              </div>
            ) : (
              <form onSubmit={handlePaySubmit}>
                <ErrorAlert message={paymentError} onDismiss={() => setPaymentError('')} />

                <div className="form-group">
                  <label>সেবা প্রদানকারী সংস্থা</label>
                  <input type="text" className="form-control" value={selectedBillType.biller_name_bn} readOnly />
                </div>

                <div className="form-group">
                  <label>হিসাব / মিটার / হোল্ডিং নম্বর</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="হিসাব নম্বর বা মিটার আইডি প্রবেশ করুন"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>বিলের পরিমাণ (টাকা)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={amountBdt}
                    onChange={(e) => setAmountBdt(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn">নিরাপদে বিল পরিশোধ করুন</button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
