import React, { useState, useEffect } from 'react';
import LoadingSpinner from './ui/LoadingSpinner';
import EmptyState from './ui/EmptyState';

export default function EmergencyModule() {
  const [contacts, setContacts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/emergency/categories');
      if (res.ok) setCategories(await res.json());
    } catch (e) {}
  };

  const fetchContacts = async (cat = 'all') => {
    setLoading(true);
    try {
      const url = cat && cat !== 'all' ? `/api/emergency/contacts?category=${encodeURIComponent(cat)}` : '/api/emergency/contacts';
      const res = await fetch(url);
      if (res.ok) setContacts(await res.json());
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchContacts('all');
  }, []);

  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
    fetchContacts(catId);
  };

  return (
    <div className="card col-12" style={{ marginTop: '2rem' }}>
      <div className="card-header">
        <h2>🚨 জরুরি সেবা ও জাতীয় হেল্পলাইন সেন্টার (Emergency & Helpline Portal)</h2>
        <span className="pattern-tag">Database-Driven Direct Helpline</span>
      </div>

      <div className="grid-layout" style={{ marginBottom: '2rem' }}>
        <a href="tel:999" className="stat-box col-3" style={{ background: 'linear-gradient(135deg, #b91c1c, #dc2626)', textDecoration: 'none' }}>
          <div style={{ fontSize: '2.25rem', color: 'white', fontWeight: 'bold' }}>🚨 999</div>
          <div className="stat-label" style={{ color: '#fef2f2', fontWeight: 'bold' }}>জাতীয় জরুরি সেবা (টোল ফ্রি)</div>
          <div style={{ fontSize: '0.75rem', color: '#fee2e2', marginTop: '0.5rem' }}>পুলিশ | ফায়ার সার্ভিস | অ্যাম্বুলেন্স</div>
        </a>

        <a href="tel:333" className="stat-box col-3" style={{ background: 'linear-gradient(135deg, #0284c7, #0369a1)', textDecoration: 'none' }}>
          <div style={{ fontSize: '2.25rem', color: 'white', fontWeight: 'bold' }}>📞 333</div>
          <div className="stat-label" style={{ color: '#f0f9ff', fontWeight: 'bold' }}>জাতীয় তথ্য হেল্পলাইন</div>
          <div style={{ fontSize: '0.75rem', color: '#e0f2fe', marginTop: '0.5rem' }}>সরকারি সেবা ও সামাজিক তথ্য</div>
        </a>

        <a href="tel:16123" className="stat-box col-3" style={{ background: 'linear-gradient(135deg, #059669, #047857)', textDecoration: 'none' }}>
          <div style={{ fontSize: '2.25rem', color: 'white', fontWeight: 'bold' }}>🌾 16123</div>
          <div className="stat-label" style={{ color: '#ecfdf5', fontWeight: 'bold' }}>কৃষি কল সেন্টার</div>
          <div style={{ fontSize: '0.75rem', color: '#d1fae5', marginTop: '0.5rem' }}>কৃষি ও বালাই ব্যবস্থাপনা বিশেষজ্ঞ</div>
        </a>

        <a href="tel:109" className="stat-box col-3" style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', textDecoration: 'none' }}>
          <div style={{ fontSize: '2.25rem', color: 'white', fontWeight: 'bold' }}>🛡️ 109</div>
          <div className="stat-label" style={{ color: '#f5f3ff', fontWeight: 'bold' }}>নারী ও শিশু নির্যাতন হেল্পলাইন</div>
          <div style={{ fontSize: '0.75rem', color: '#ede9fe', marginTop: '0.5rem' }}>জরুরি সুরক্ষা ও আইনি সহায়তা</div>
        </a>
      </div>

      <div className="portal-nav" style={{ marginBottom: '1.5rem' }}>
        {categories.map((c) => (
          <button
            key={c.id}
            className={`nav-item ${selectedCategory === c.id ? 'active' : ''}`}
            onClick={() => handleCategorySelect(c.id)}
          >
            <span>{c.icon}</span> {c.name_bn}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner message="জরুরি কন্টাক্ট নম্বরসমূহ লোড হচ্ছে..." />
      ) : contacts.length === 0 ? (
        <EmptyState
          icon="🚨"
          title="কোন কন্টাক্ট নম্বর পাওয়া যায়নি"
          description="নির্বাচিত ক্যাটাগরিতে বর্তমানে কোন বিকল্প কন্টাক্ট নম্বর নথিভুক্ত নেই।"
        />
      ) : (
        <div className="grid-layout">
          {contacts.map((contact) => (
            <div key={contact.id} className="service-card col-4">
              <div>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{contact.icon_symbol}</div>
                <h4 style={{ fontSize: '1.05rem', color: '#f8fafc', marginBottom: '0.35rem' }}>{contact.title_bn}</h4>
                
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <span className="pattern-tag" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5' }}>
                    {contact.category.toUpperCase()}
                  </span>
                  <span className="pattern-tag" style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8' }}>
                    {contact.district}
                  </span>
                </div>

                <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.75rem', lineHeight: '1.4' }}>
                  {contact.description_bn}
                </p>

                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '1rem' }}>
                  ⏱️ সময়সীমা: {contact.available_hours}
                </p>
              </div>

              <a
                href={`tel:${contact.phone_number}`}
                className="btn"
                style={{
                  textDecoration: 'none',
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                }}
              >
                📞 কল করুন ({contact.phone_number})
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
