import React, { useState, useEffect } from 'react';

export default function App() {
  // Pattern 1: Singleton Weather State
  const [weatherCity, setWeatherCity] = useState('ঢাকা');
  const [weatherData, setWeatherData] = useState(null);

  // Pattern 2: Factory Method Notification State
  const [notifChannel, setNotifChannel] = useState('sms');
  const [notifRecipient, setNotifRecipient] = useState('+8801812345678');
  const [notifMessage, setNotifMessage] = useState('আপনার কৃষি ঋণের আবেদনটি মঞ্জুর হয়েছে।');
  const [notifResponse, setNotifResponse] = useState(null);

  // Pattern 3: Strategy Loan Calculation State
  const [loanPrincipal, setLoanPrincipal] = useState(100000);
  const [loanRate, setLoanRate] = useState(8.0);
  const [loanDuration, setLoanDuration] = useState(12);
  const [loanScheme, setLoanScheme] = useState('standard_emi');
  const [loanResult, setLoanResult] = useState(null);

  // Pattern 4: Observer Application Status Change State
  const [appId, setAppId] = useState('APP-2026-8801');
  const [newStatus, setNewStatus] = useState('Approved');
  const [observerLogs, setObserverLogs] = useState([]);

  // Pattern 5: Facade Dashboard Summary State
  const [dashboardData, setDashboardData] = useState(null);

  // Fetch Weather (Singleton Endpoint)
  const fetchWeather = async () => {
    try {
      const res = await fetch(`/api/weather?city=${encodeURIComponent(weatherCity)}`);
      const data = await res.json();
      setWeatherData(data);
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch Dashboard (Facade Endpoint)
  const fetchDashboard = async () => {
    try {
      const res = await fetch(`/api/dashboard?city=${encodeURIComponent(weatherCity)}`);
      const data = await res.json();
      setDashboardData(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchWeather();
    fetchDashboard();
  }, []);

  // Handle Notification Dispatch (Factory Method Endpoint)
  const handleSendNotification = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient: notifRecipient, message: notifMessage, channel: notifChannel })
      });
      const data = await res.json();
      setNotifResponse(data);
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Loan Calculation (Strategy Endpoint)
  const handleCalculateLoan = async (e) => {
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
      const data = await res.json();
      setLoanResult(data);
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Status Update (Observer Endpoint)
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/applications/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ application_id: appId, new_status: newStatus })
      });
      const data = await res.json();
      setObserverLogs((prev) => [
        { time: new Date().toLocaleTimeString(), text: `[EVENT DISPATCHED] Application ${appId} -> ${newStatus}. Observers triggered: SMSNotifier, AuditLogger, DashboardStream.` },
        ...prev
      ]);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="app-container">
      <header>
        <div className="brand">
          <div className="brand-icon">PB</div>
          <div className="brand-title">
            <h1>পল্লীবন্ধু (Pollibondhu)</h1>
            <p>সমন্বিত গ্রামীণ সেবা ও কৃষি প্ল্যাটফর্ম (Integrated Service Platform)</p>
          </div>
        </div>
        <div className="pattern-badges">
          <span className="badge">1. Singleton</span>
          <span className="badge">2. Factory Method</span>
          <span className="badge">3. Strategy</span>
          <span className="badge">4. Observer</span>
          <span className="badge">5. Facade</span>
        </div>
      </header>

      <div className="grid-layout">
        {/* PATTERN 5: FACADE PATTERN DEMO */}
        <div className="card col-12">
          <div className="card-header">
            <h2>🌾 কৃষক ড্যাশবোর্ড (Farmer Composite Dashboard)</h2>
            <span className="pattern-tag">Pattern 5: Facade</span>
          </div>
          {dashboardData ? (
            <div className="grid-layout">
              <div className="stat-box col-4">
                <div className="stat-value">{dashboardData.weather.temperature_celsius}°C</div>
                <div className="stat-label">আবহাওয়া: {dashboardData.weather.city} ({dashboardData.weather.condition_bn})</div>
              </div>
              <div className="stat-box col-4">
                <div className="stat-value">{dashboardData.market_prices[0]?.price_bdt} ৳</div>
                <div className="stat-label">আমন ধান বাজারদর (প্রতি মন)</div>
              </div>
              <div className="stat-box col-4">
                <div className="stat-value">{dashboardData.assigned_officer?.officer_name?.split(' ')[0]}</div>
                <div className="stat-label">দায়িত্বপ্রাপ্ত কৃষি কর্মকর্তা ({dashboardData.assigned_officer?.phone})</div>
              </div>
            </div>
          ) : (
            <p style={{ color: '#94a3b8' }}>ড্যাশবোর্ড লোড হচ্ছে...</p>
          )}
        </div>

        {/* PATTERN 1: SINGLETON PATTERN DEMO */}
        <div className="card col-6">
          <div className="card-header">
            <h2>🌤️ আবহাওয়া পূর্বাভাস (Weather Service)</h2>
            <span className="pattern-tag">Pattern 1: Singleton</span>
          </div>
          <div className="form-group">
            <label>জেলা / বিভাগ নির্বাচন করুন</label>
            <select className="form-control" value={weatherCity} onChange={(e) => setWeatherCity(e.target.value)}>
              <option value="ঢাকা">ঢাকা (Dhaka)</option>
              <option value="চট্টগ্রাম">চট্টগ্রাম (Chittagong)</option>
              <option value="সিলেট">সিলেট (Sylhet)</option>
              <option value="রাজশাহী">রাজশাহী (Rajshahi)</option>
              <option value="রংপুর">রংপুর (Rangpur)</option>
            </select>
          </div>
          <button className="btn" onClick={fetchWeather}>আবহাওয়া আপডেট করুন</button>

          {weatherData && (
            <div style={{ marginTop: '1rem', background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: '0.5rem' }}>
              <p><strong>তাপমাত্রা:</strong> {weatherData.temperature_celsius}°C</p>
              <p><strong>অবস্থা:</strong> {weatherData.condition_bn}</p>
              <p><strong>আর্দ্রতা:</strong> {weatherData.humidity}%</p>
              <p><strong>বায়ুপ্রবাহ:</strong> {weatherData.wind_speed} km/h</p>
              <p style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '0.5rem' }}>
                ✓ WeatherApiClient Singleton Managed (Cache Status: {weatherData.cached ? 'Hit' : 'Fresh'})
              </p>
            </div>
          )}
        </div>

        {/* PATTERN 2: FACTORY METHOD PATTERN DEMO */}
        <div className="card col-6">
          <div className="card-header">
            <h2>📢 নাগরিক নোটিফিকেশন (Notification Dispatcher)</h2>
            <span className="pattern-tag">Pattern 2: Factory Method</span>
          </div>
          <form onSubmit={handleSendNotification}>
            <div className="form-group">
              <label>নোটিফিকেশন চ্যানেল (Channel)</label>
              <select className="form-control" value={notifChannel} onChange={(e) => setNotifChannel(e.target.value)}>
                <option value="sms">SMS Gateway (ফিচার ফোন)</option>
                <option value="email">ইমেইল (Email Service)</option>
                <option value="push">মোবাইল অ্যাপ পুশ (Push Notification)</option>
              </select>
            </div>
            <div className="form-group">
              <label>প্রাপক (Recipient Phone/Email/Device)</label>
              <input type="text" className="form-control" value={notifRecipient} onChange={(e) => setNotifRecipient(e.target.value)} />
            </div>
            <div className="form-group">
              <label>বার্তা (Message Content)</label>
              <input type="text" className="form-control" value={notifMessage} onChange={(e) => setNotifMessage(e.target.value)} />
            </div>
            <button type="submit" className="btn">নোটিফিকেশন পাঠান</button>
          </form>

          {notifResponse && (
            <div style={{ marginTop: '1rem', background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem', borderRadius: '0.5rem' }}>
              <p style={{ color: '#34d399', fontWeight: 'bold' }}>✓ নোটিফিকেশন সফলভাবে পাঠানো হয়েছে!</p>
              <p style={{ fontSize: '0.85rem' }}>ID: {notifResponse.message_id} | Channel: {notifResponse.channel.toUpperCase()}</p>
            </div>
          )}
        </div>

        {/* PATTERN 3: STRATEGY PATTERN DEMO */}
        <div className="card col-8">
          <div className="card-header">
            <h2>💰 কৃষি ঋণ ও কিস্তি ক্যালকুলেটর (Krishi Rin Calculator)</h2>
            <span className="pattern-tag">Pattern 3: Strategy</span>
          </div>
          <form onSubmit={handleCalculateLoan} className="grid-layout" style={{ gap: '0.75rem' }}>
            <div className="form-group col-6">
              <label>ঋণের পরিমাণ (টাকা)</label>
              <input type="number" className="form-control" value={loanPrincipal} onChange={(e) => setLoanPrincipal(e.target.value)} />
            </div>
            <div className="form-group col-6">
              <label>বার্ষিক সুদের হার (%)</label>
              <input type="number" step="0.1" className="form-control" value={loanRate} onChange={(e) => setLoanRate(e.target.value)} />
            </div>
            <div className="form-group col-6">
              <label>মেয়াদ (মাস)</label>
              <input type="number" className="form-control" value={loanDuration} onChange={(e) => setLoanDuration(e.target.value)} />
            </div>
            <div className="form-group col-6">
              <label>ঋণ স্কিম স্ট্র্যাটেজি (Strategy Scheme)</label>
              <select className="form-control" value={loanScheme} onChange={(e) => setLoanScheme(e.target.value)}>
                <option value="standard_emi">Standard EMI Strategy (সাধারণ সুদে সমকিস্তি)</option>
                <option value="seasonal_crop">Seasonal Crop Loan Strategy (ফসল কাটার পর পরিশোধ)</option>
                <option value="subsidy_loan">Government Subsidy Loan Strategy (সরকারি ৪% ভরতুকি)</option>
              </select>
            </div>
            <div className="col-12">
              <button type="submit" className="btn">ঋণের হিসাব করুন</button>
            </div>
          </form>

          {loanResult && (
            <div style={{ marginTop: '1rem' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '0.75rem' }}>
                <p><strong>স্কিম:</strong> {loanResult.scheme_type}</p>
                <p><strong>মোট পরিশোধযোগ্য:</strong> {loanResult.total_repayment} টাকা (মোট সুদ: {loanResult.total_interest} টাকা)</p>
              </div>
              <div className="table-container" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>মাস</th>
                      <th>কিস্তি (টাকা)</th>
                      <th>আসল (Principal)</th>
                      <th>সুদ (Interest)</th>
                      <th>অবশিষ্ট স্থিতি</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loanResult.schedule.map((item) => (
                      <tr key={item.period}>
                        <td>মাস {item.period}</td>
                        <td>{item.payment}</td>
                        <td>{item.principal_component}</td>
                        <td>{item.interest_component}</td>
                        <td>{item.remaining_balance}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* PATTERN 4: OBSERVER PATTERN DEMO */}
        <div className="card col-4">
          <div className="card-header">
            <h2>🔔 আবেদন ট্র্যাকার (Application Event Observer)</h2>
            <span className="pattern-tag">Pattern 4: Observer</span>
          </div>
          <form onSubmit={handleUpdateStatus}>
            <div className="form-group">
              <label>আবেদন আইডি (Application ID)</label>
              <input type="text" className="form-control" value={appId} onChange={(e) => setAppId(e.target.value)} />
            </div>
            <div className="form-group">
              <label>নতুন স্ট্যাটাস (New Status)</label>
              <select className="form-control" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                <option value="Pending">Pending (পেন্ডিং)</option>
                <option value="In Progress">In Progress (প্রক্রিয়াধীন)</option>
                <option value="Approved">Approved (অনুমোদিত)</option>
                <option value="Rejected">Rejected (বাতিল)</option>
              </select>
            </div>
            <button type="submit" className="btn">স্ট্যাটাস পরিবর্তন করুন (Notify Observers)</button>
          </form>

          <div style={{ marginTop: '1rem', fontSize: '0.75rem', maxHeight: '150px', overflowY: 'auto' }}>
            <p style={{ color: var(--text-muted), marginBottom: '0.35rem' }}>অফসার্ভার ইভেন্ট লগ (Observer Broadcast Stream):</p>
            {observerLogs.map((log, index) => (
              <div key={index} style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '0.4rem', borderRadius: '0.35rem', marginBottom: '0.35rem', borderLeft: '3px solid #34d399' }}>
                <span style={{ color: '#94a3b8' }}>[{log.time}]</span> {log.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
