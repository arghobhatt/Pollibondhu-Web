import React, { useState, useEffect } from 'react';
import LoadingSpinner from './ui/LoadingSpinner';
import ErrorAlert from './ui/ErrorAlert';

export default function WeatherModule() {
  const [selectedCity, setSelectedCity] = useState('ঢাকা');
  const [locations, setLocations] = useState(['ঢাকা', 'চট্টগ্রাম', 'সিলেট', 'রাজশাহী', 'খুলনা', 'বরিশাল', 'রংপুর', 'ময়মনসিংহ']);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchLocations = async () => {
    try {
      const res = await fetch('/api/weather/locations');
      if (res.ok) setLocations(await res.json());
    } catch (e) {}
  };

  const fetchWeather = async (city) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
      if (res.ok) {
        setWeatherData(await res.json());
      } else {
        setErrorMsg('আবহাওয়ার তথ্য সংগ্রহ করা সম্ভব হয়নি। অনুগ্রহ করে পরে চেষ্টা করুন।');
      }
    } catch (e) {
      setErrorMsg('নেটওয়ার্ক ত্রুটি! সার্ভারের সাথে সংযোগ স্থাপন সম্ভব হচ্ছে না।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
    fetchWeather(selectedCity);
  }, []);

  const handleCityChange = (e) => {
    const city = e.target.value;
    setSelectedCity(city);
    fetchWeather(city);
  };

  return (
    <div className="card col-12" style={{ marginTop: '2rem' }}>
      <div className="card-header">
        <h2>🌦️ পল্লীবন্ধু ডিজিটাল আবহাওয়া পূর্বাভাস (Weather Intelligence Hub)</h2>
        <span className="pattern-tag">Singleton & Facade Pattern</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '250px' }}>
          <label style={{ fontWeight: 'bold', color: '#cbd5e1', whiteSpace: 'nowrap' }}>জেলা / শহর নির্বাচন করুন:</label>
          <select className="form-control" value={selectedCity} onChange={handleCityChange}>
            {locations.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        <button
          className="btn-secondary"
          onClick={() => fetchWeather(selectedCity)}
          disabled={loading}
        >
          {loading ? 'রিফ্রেশ হচ্ছে...' : '🔄 আবহাওয়া তথ্য রিফ্রেশ করুন'}
        </button>
      </div>

      {loading && <LoadingSpinner message="লাইভ আবহাওয়া তথ্য লোড হচ্ছে..." />}

      <ErrorAlert message={errorMsg} onDismiss={() => setErrorMsg('')} />

      {!loading && !errorMsg && weatherData && (
        <div>
          <div className="grid-layout" style={{ marginBottom: '1.5rem' }}>
            <div className="stat-box col-4" style={{ background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.9))' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="stat-value" style={{ color: '#38bdf8', fontSize: '2.25rem' }}>{weatherData.temperature_celsius}°C</div>
                  <div className="stat-label" style={{ fontSize: '1.05rem', color: '#f8fafc', marginTop: '0.25rem' }}>
                    {weatherData.city} ({weatherData.condition_bn})
                  </div>
                </div>
                <div style={{ fontSize: '2.5rem' }}>🌤️</div>
              </div>
              <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: weatherData.cached ? '#34d399' : '#94a3b8' }}>
                {weatherData.cached ? '⚡ মেমরি ক্যাশ থেকে লোডকৃত (15m TTL Cached)' : '📡 লাইভ এপিআই থেকে প্রাপ্ত (Fresh Fetch)'}
              </div>
            </div>

            <div className="stat-box col-4">
              <div className="stat-value" style={{ color: '#34d399' }}>{weatherData.humidity}%</div>
              <div className="stat-label">বাতাসের আর্দ্রতা (Humidity)</div>
              <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#94a3b8' }}>কৃষি কাজের জন্য উপযুক্ত আর্দ্রতা স্তর</div>
            </div>

            <div className="stat-box col-4">
              <div className="stat-value" style={{ color: '#fbbf24' }}>{weatherData.wind_speed} km/h</div>
              <div className="stat-label">বাতাসের গতিবেগ (Wind Speed)</div>
              <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#94a3b8' }}>সর্বশেষ আপডেট: {new Date(weatherData.fetched_at).toLocaleTimeString()}</div>
            </div>
          </div>

          {weatherData.forecast && weatherData.forecast.length > 0 && (
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1.25rem', borderRadius: '0.75rem' }}>
              <h3 style={{ fontSize: '1rem', color: '#f8fafc', marginBottom: '1rem' }}>📅 আগামী ৩ দিনের পূর্বাভাস (3-Day Weather Forecast)</h3>
              <div className="grid-layout">
                {weatherData.forecast.map((item, idx) => (
                  <div key={idx} className="service-card col-4" style={{ textAlign: 'center', background: 'rgba(30, 41, 59, 0.7)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.35rem' }}>{item.icon_symbol}</div>
                    <strong style={{ color: '#38bdf8', fontSize: '1rem' }}>{item.day}</strong>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#f8fafc', margin: '0.25rem 0' }}>{item.temperature_celsius}°C</div>
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{item.condition_bn}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
