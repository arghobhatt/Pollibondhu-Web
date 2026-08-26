import React, { useState, useEffect } from 'react';
import EmptyState from './ui/EmptyState';

export default function AgriModule({ currentUser, authToken, onOpenAuth }) {
  const [agriTab, setAgriTab] = useState('crop_doctor');
  
  const [diseases, setDiseases] = useState([]);
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [diseaseSearch, setDiseaseSearch] = useState('');

  const [marketPrices, setMarketPrices] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('');

  const [newCropName, setNewCropName] = useState('Mustard');
  const [newCropNameBn, setNewCropNameBn] = useState('সরিষা');
  const [newMarketName, setNewMarketName] = useState('ধামরাই হাট');
  const [newDistrict, setNewDistrict] = useState('ঢাকা');
  const [newPriceBdt, setNewPriceBdt] = useState(3200);
  const [priceUpdateMsg, setPriceUpdateMsg] = useState('');

  const [articles, setArticles] = useState([]);

  const [loanPrincipal, setLoanPrincipal] = useState(100000);
  const [loanRate, setLoanRate] = useState(8.0);
  const [loanDuration, setLoanDuration] = useState(12);
  const [loanScheme, setLoanScheme] = useState('standard_emi');
  const [loanCalculation, setLoanCalculation] = useState(null);
  const [loanApplySuccessMsg, setLoanApplySuccessMsg] = useState('');

  const fetchDiseases = async (cropQuery = '') => {
    try {
      const url = cropQuery ? `/api/agriculture/crop-doctor?crop_name=${encodeURIComponent(cropQuery)}` : '/api/agriculture/crop-doctor';
      const res = await fetch(url);
      if (res.ok) setDiseases(await res.json());
    } catch (e) {}
  };

  const fetchMarketPrices = async (distQuery = '') => {
    try {
      const url = distQuery ? `/api/agriculture/market-prices?district=${encodeURIComponent(distQuery)}` : '/api/agriculture/market-prices';
      const res = await fetch(url);
      if (res.ok) setMarketPrices(await res.json());
    } catch (e) {}
  };

  const fetchArticles = async () => {
    try {
      const res = await fetch('/api/agriculture/articles');
      if (res.ok) setArticles(await res.json());
    } catch (e) {}
  };

  useEffect(() => {
    fetchDiseases();
    fetchMarketPrices();
    fetchArticles();
  }, []);

  const handleDiseaseSearchSubmit = (e) => {
    e.preventDefault();
    fetchDiseases(diseaseSearch);
  };

  const handleDistrictFilterSubmit = (e) => {
    e.preventDefault();
    fetchMarketPrices(selectedDistrict);
  };

  const handleOfficerPriceSubmit = async (e) => {
    e.preventDefault();
    if (!authToken) {
      onOpenAuth();
      return;
    }
    setPriceUpdateMsg('');
    try {
      const res = await fetch('/api/agriculture/market-prices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          crop_name: newCropName,
          crop_name_bn: newCropNameBn,
          market_name: newMarketName,
          district: newDistrict,
          price_bdt_per_mon: parseFloat(newPriceBdt)
        })
      });
      const data = await res.json();
      if (res.ok) {
        setPriceUpdateMsg('কৃষি বাজারদর সফলভাবে আপডেট করা হয়েছে!');
        fetchMarketPrices();
      } else {
        setPriceUpdateMsg(data.detail || 'বাজারদর আপডেট করা সম্ভব হয়নি। (শুধুমাত্র কর্মকর্তাদের জন্য)');
      }
    } catch (e) {
      setPriceUpdateMsg('নেটওয়ার্ক ত্রুটি!');
    }
  };

  const handleCalculateLoanStrategy = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/loans/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          principal: parseFloat(loanPrincipal),
          annual_rate: parseFloat(loanRate),
          duration_months: parseInt(loanDuration),
          scheme_type: loanScheme
        })
      });
      if (res.ok) {
        setLoanCalculation(await res.json());
      }
    } catch (e) {}
  };

  const handleApplyLoanSubmit = async () => {
    if (!authToken) {
      onOpenAuth();
      return;
    }
    setLoanApplySuccessMsg('');
    try {
      const res = await fetch('/api/agriculture/loans/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          principal_amount: parseFloat(loanPrincipal),
          annual_interest_rate: parseFloat(loanRate),
          duration_months: parseInt(loanDuration),
          scheme_type: loanScheme,
          applicant_name: currentUser?.full_name || 'কৃষক',
          applicant_phone: currentUser?.phone_number || '+8801800000000'
        })
      });
      const data = await res.json();
      if (res.ok) {
        setLoanApplySuccessMsg(`কৃষি ঋণের আবেদন সফলভাবে গৃহীত হয়েছে! ট্র্যাকিং আইডি: ${data.application_number}`);
      }
    } catch (e) {}
  };

  const isOfficer = currentUser && (currentUser.role === 'officer' || currentUser.role === 'admin');

  return (
    <div className="card col-12" style={{ marginTop: '2rem' }}>
      <div className="card-header">
        <h2>🌾 পল্লীবন্ধু কৃষি ও বাজার পরামর্শ কেন্দ্র (Agriculture Hub)</h2>
        <span className="pattern-tag">Strategy & DB Persistence</span>
      </div>

      <div className="portal-nav" style={{ marginBottom: '1.25rem' }}>
        <button className={`nav-item ${agriTab === 'crop_doctor' ? 'active' : ''}`} onClick={() => setAgriTab('crop_doctor')}>
          🩺 ক্রপ ডক্টর (Crop Doctor)
        </button>
        <button className={`nav-item ${agriTab === 'market_prices' ? 'active' : ''}`} onClick={() => setAgriTab('market_prices')}>
          📊 ফসলের বাজারদর (Market Prices)
        </button>
        <button className={`nav-item ${agriTab === 'agri_loan' ? 'active' : ''}`} onClick={() => setAgriTab('agri_loan')}>
          💰 কৃষি ঋণ স্ট্র্যাটেজি (Agri Loan)
        </button>
        <button className={`nav-item ${agriTab === 'articles' ? 'active' : ''}`} onClick={() => setAgriTab('articles')}>
          📖 কৃষি নির্দেশিকা ও আর্টিকেলে (Guides)
        </button>
      </div>

      {agriTab === 'crop_doctor' && (
        <div>
          <form onSubmit={handleDiseaseSearchSubmit} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <input
              type="text"
              className="form-control"
              placeholder="ফসলের নাম লিখুন (যেমন: ধান, আলু, গম...)"
              value={diseaseSearch}
              onChange={(e) => setDiseaseSearch(e.target.value)}
            />
            <button type="submit" className="btn" style={{ width: '160px' }}>রোগ খুঁজুন</button>
          </form>

          {diseases.length === 0 ? (
            <EmptyState
              icon="🩺"
              title="কোন ফসলের রোগ তথ্য পাওয়া যায়নি"
              description="আপনার অনুসন্ধান অনুযায়ী কোন ক্রপ রোগ পাওয়া যায়নি। অনুসন্ধান পরিমার্জন করুন।"
            />
          ) : (
            <div className="grid-layout">
              {diseases.map((d) => (
                <div key={d.id} className="service-card col-4">
                  <div>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{d.image_symbol}</div>
                    <h4 style={{ fontSize: '1.05rem', color: '#38bdf8', marginBottom: '0.25rem' }}>{d.disease_name_bn}</h4>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.75rem' }}>ফসল: {d.crop_name_bn} ({d.crop_name_en})</p>
                    
                    <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                      <p style={{ color: '#fbbf24', fontWeight: 'bold', marginBottom: '0.2rem' }}>উপসর্গ (Symptoms):</p>
                      <p style={{ color: '#cbd5e1' }}>{d.symptoms_bn}</p>
                    </div>
                  </div>

                  <button
                    className="btn"
                    onClick={() => setSelectedDisease(d)}
                  >
                    প্রতিকার ও চিকিৎসা নির্দেশিকা
                  </button>
                </div>
              ))}
            </div>
          )}

          {selectedDisease && (
            <div className="modal-overlay">
              <div className="modal-content" style={{ maxWidth: '600px' }}>
                <div className="modal-header">
                  <h3>{selectedDisease.disease_name_bn}</h3>
                  <button className="close-btn" onClick={() => setSelectedDisease(null)}>✕</button>
                </div>

                <div style={{ lineHeight: '1.6' }}>
                  <p><strong>ফসল:</strong> {selectedDisease.crop_name_bn}</p>
                  
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444', padding: '0.75rem', margin: '1rem 0', borderRadius: '0.35rem' }}>
                    <p style={{ color: '#fca5a5', fontWeight: 'bold' }}>উপসর্গ:</p>
                    <p style={{ fontSize: '0.9rem' }}>{selectedDisease.symptoms_bn}</p>
                  </div>

                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', borderLeft: '4px solid #10b981', padding: '0.75rem', margin: '1rem 0', borderRadius: '0.35rem' }}>
                    <p style={{ color: '#34d399', fontWeight: 'bold' }}>অনুমোদিত প্রতিকার ও চিকিৎসা:</p>
                    <p style={{ fontSize: '0.9rem' }}>{selectedDisease.treatment_bn}</p>
                  </div>

                  <div style={{ background: 'rgba(56, 189, 248, 0.1)', borderLeft: '4px solid #38bdf8', padding: '0.75rem', margin: '1rem 0', borderRadius: '0.35rem' }}>
                    <p style={{ color: '#38bdf8', fontWeight: 'bold' }}>প্রতিরোধমূলক পরামর্শ:</p>
                    <p style={{ fontSize: '0.9rem' }}>{selectedDisease.prevention_bn}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {agriTab === 'market_prices' && (
        <div>
          <form onSubmit={handleDistrictFilterSubmit} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <input
              type="text"
              className="form-control"
              placeholder="জেলা দিয়ে ফিল্টার করুন (যেমন: ঢাকা, বগুড়া, পাবনা...)"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
            />
            <button type="submit" className="btn" style={{ width: '160px' }}>ফিল্টার করুন</button>
          </form>

          {marketPrices.length === 0 ? (
            <EmptyState
              icon="📊"
              title="কোন বাজারদর তথ্য পাওয়া যায়নি"
              description="বর্তমানে নির্দিষ্ট এলাকায় কোন ফসলের রেকর্ডকৃত বাজারদর নেই।"
            />
          ) : (
            <div className="table-container" style={{ marginBottom: '2rem' }}>
              <table>
                <thead>
                  <tr>
                    <th>ফসলের নাম</th>
                    <th>বাজার / এলাকা</th>
                    <th>জেলা</th>
                    <th>বাজারদর (প্রতি মন)</th>
                    <th>আপডেটের সময়</th>
                  </tr>
                </thead>
                <tbody>
                  {marketPrices.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 'bold', color: '#f8fafc' }}>{p.crop_name_bn} ({p.crop_name})</td>
                      <td>{p.market_name}</td>
                      <td>{p.district}</td>
                      <td style={{ color: '#34d399', fontWeight: 'bold', fontSize: '1rem' }}>{p.price_bdt_per_mon} ৳</td>
                      <td>{new Date(p.updated_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {isOfficer && (
            <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <h3 style={{ fontSize: '1rem', color: '#34d399', marginBottom: '1rem' }}>👨‍🌾 কর্মকর্তা বাজারদর এন্ট্রি ফরম (Officer Price Reporter)</h3>
              
              {priceUpdateMsg && <p style={{ color: '#34d399', marginBottom: '0.75rem', fontSize: '0.85rem' }}>{priceUpdateMsg}</p>}

              <form onSubmit={handleOfficerPriceSubmit} className="grid-layout">
                <div className="form-group col-3">
                  <label>ফসলের নাম (বাংলা)</label>
                  <input type="text" className="form-control" value={newCropNameBn} onChange={(e) => setNewCropNameBn(e.target.value)} required />
                </div>
                <div className="form-group col-3">
                  <label>ফসলের নাম (English)</label>
                  <input type="text" className="form-control" value={newCropName} onChange={(e) => setNewCropName(e.target.value)} required />
                </div>
                <div className="form-group col-3">
                  <label>বাজার / হাট</label>
                  <input type="text" className="form-control" value={newMarketName} onChange={(e) => setNewMarketName(e.target.value)} required />
                </div>
                <div className="form-group col-3">
                  <label>জেলা</label>
                  <input type="text" className="form-control" value={newDistrict} onChange={(e) => setNewDistrict(e.target.value)} required />
                </div>
                <div className="form-group col-6">
                  <label>মূল্য (টাকা / মন)</label>
                  <input type="number" className="form-control" value={newPriceBdt} onChange={(e) => setNewPriceBdt(e.target.value)} required />
                </div>
                <div className="form-group col-6" style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button type="submit" className="btn">নতুন বাজারদর দাখিল করুন</button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {agriTab === 'agri_loan' && (
        <div>
          <form onSubmit={handleCalculateLoanStrategy} className="grid-layout" style={{ gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div className="form-group col-3">
              <label>ঋণের পরিমাণ (টাকা)</label>
              <input type="number" className="form-control" value={loanPrincipal} onChange={(e) => setLoanPrincipal(e.target.value)} required />
            </div>
            <div className="form-group col-3">
              <label>বার্ষিক সুদের হার (%)</label>
              <input type="number" step="0.1" className="form-control" value={loanRate} onChange={(e) => setLoanRate(e.target.value)} required />
            </div>
            <div className="form-group col-3">
              <label>মেয়াদ (মাস)</label>
              <input type="number" className="form-control" value={loanDuration} onChange={(e) => setLoanDuration(e.target.value)} required />
            </div>
            <div className="form-group col-3">
              <label>ঋণ স্কিম (Strategy Scheme)</label>
              <select className="form-control" value={loanScheme} onChange={(e) => setLoanScheme(e.target.value)}>
                <option value="standard_emi">Standard EMI Strategy</option>
                <option value="seasonal_crop">Seasonal Crop Loan Strategy</option>
                <option value="subsidy_loan">Government Subsidy Loan Strategy</option>
              </select>
            </div>
            <div className="col-12" style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn" style={{ flex: 1 }}>ঋণের হিসাব করুন (Calculate Strategy)</button>
              <button type="button" className="btn" style={{ flex: 1, background: 'linear-gradient(135deg, #0284c7, #0369a1)' }} onClick={handleApplyLoanSubmit}>
                অনলাইনে ঋণের আবেদন করুন
              </button>
            </div>
          </form>

          {loanApplySuccessMsg && (
            <div style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', color: '#34d399', padding: '0.85rem', borderRadius: '0.5rem', marginBottom: '1.25rem' }}>
              {loanApplySuccessMsg}
            </div>
          )}

          {loanCalculation && (
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: '0.75rem' }}>
              <p style={{ color: '#38bdf8', fontWeight: 'bold' }}>স্কিম: {loanCalculation.scheme_type}</p>
              <p style={{ fontSize: '0.9rem', margin: '0.4rem 0' }}>
                মোট পরিশোধযোগ্য: <strong>{loanCalculation.total_repayment} ৳</strong> (মোট সুদ: <strong>{loanCalculation.total_interest} ৳</strong>)
              </p>

              <div className="table-container" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>মাস</th>
                      <th>কিস্তি (টাকা)</th>
                      <th>আসল</th>
                      <th>সুদ</th>
                      <th>অবশিষ্ট স্থিতি</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loanCalculation.schedule.map((item) => (
                      <tr key={item.period}>
                        <td>মাস {item.period}</td>
                        <td>{item.payment} ৳</td>
                        <td>{item.principal_component} ৳</td>
                        <td>{item.interest_component} ৳</td>
                        <td>{item.remaining_balance} ৳</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {agriTab === 'articles' && (
        <div className="grid-layout">
          {articles.map((art) => (
            <div key={art.id} className="service-card col-6">
              <div>
                <span className="pattern-tag" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>{art.category.toUpperCase()}</span>
                <h3 style={{ fontSize: '1.1rem', color: '#f8fafc', marginBottom: '0.5rem' }}>{art.title_bn}</h3>
                <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.75rem', lineHeight: '1.5' }}>{art.summary_bn}</p>
                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                  {art.content_bn}
                </div>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#38bdf8', marginTop: '0.75rem' }}>লেখক: {art.author} | প্রকাশ: {new Date(art.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
