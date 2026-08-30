import React, { useState, useEffect } from 'react';
import LoadingSpinner from './ui/LoadingSpinner';
import EmptyState from './ui/EmptyState';

export default function TransportModule() {
  const [routes, setRoutes] = useState([]);
  const [locations, setLocations] = useState({ divisions: [], origins: [], destinations: [], vehicle_types: [] });
  
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedOrigin, setSelectedOrigin] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('');
  const [selectedVehicleType, setSelectedVehicleType] = useState('');
  const [loading, setLoading] = useState(false);

  const divisionsList = ["ঢাকা", "চট্টগ্রাম", "রাজশাহী", "খুলনা", "বরিশাল", "সিলেট", "রংপুর", "ময়মনসিংহ"];

  const fetchLocations = async (div = '') => {
    try {
      const url = div ? `/api/transport/locations?division=${encodeURIComponent(div)}` : '/api/transport/locations';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setLocations({
          divisions: data.divisions || divisionsList,
          origins: data.origins || [],
          destinations: data.destinations || [],
          vehicle_types: data.vehicle_types || []
        });
      }
    } catch (e) {}
  };

  const fetchRoutes = async (division = selectedDivision, origin = selectedOrigin, destination = selectedDestination, vehicle = selectedVehicleType) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (division && division !== 'সকল বিভাগ') params.append('division', division);
      if (origin) params.append('origin', origin);
      if (destination) params.append('destination', destination);
      if (vehicle) params.append('vehicle_type', vehicle);

      const res = await fetch(`/api/transport/routes?${params.toString()}`);
      if (res.ok) setRoutes(await res.json());
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
    fetchRoutes();
  }, []);

  const handleDivisionChange = (e) => {
    const div = e.target.value;
    setSelectedDivision(div);
    setSelectedOrigin('');
    setSelectedDestination('');
    fetchLocations(div);
    fetchRoutes(div, '', '', selectedVehicleType);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRoutes(selectedDivision, selectedOrigin, selectedDestination, selectedVehicleType);
  };

  return (
    <div className="card col-12" style={{ marginTop: '2rem' }}>
      <div className="card-header">
        <h2>🚌 গ্রামীণ পরিবহন ও সময়সূচী পোর্টাল — সকল ৮টি বিভাগ (Rural Transport Timetable)</h2>
        <span className="pattern-tag">Normalized Route & Schedule DB</span>
      </div>

      <form onSubmit={handleSearchSubmit} className="grid-layout" style={{ gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div className="form-group col-3">
          <label>প্রশাসনিক বিভাগ (Division)</label>
          <select className="form-control" value={selectedDivision} onChange={handleDivisionChange}>
            <option value="">সকল বিভাগ (All 8 Divisions)</option>
            {divisionsList.map((d) => (
              <option key={d} value={d}>{d} বিভাগ</option>
            ))}
          </select>
        </div>

        <div className="form-group col-3">
          <label>যাত্রার স্থান (Origin)</label>
          <select className="form-control" value={selectedOrigin} onChange={(e) => setSelectedOrigin(e.target.value)}>
            <option value="">সকল স্থান</option>
            {locations.origins.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>

        <div className="form-group col-3">
          <label>গন্তব্য (Destination)</label>
          <select className="form-control" value={selectedDestination} onChange={(e) => setSelectedDestination(e.target.value)}>
            <option value="">সকল গন্তব্য</option>
            {locations.destinations.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div className="form-group col-3">
          <label>যানবাহন টাইপ (Vehicle)</label>
          <select className="form-control" value={selectedVehicleType} onChange={(e) => setSelectedVehicleType(e.target.value)}>
            <option value="">সকল যানবাহন</option>
            <option value="bus">বাস (Bus)</option>
            <option value="launch">লঞ্চ (Launch)</option>
            <option value="train">ট্রেন (Train)</option>
            <option value="auto">অটো-রিকশা (Auto)</option>
          </select>
        </div>

        <div className="form-group col-12" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <button
            type="button"
            className="btn"
            style={{ background: '#334155' }}
            onClick={() => {
              setSelectedDivision('');
              setSelectedOrigin('');
              setSelectedDestination('');
              setSelectedVehicleType('');
              fetchLocations('');
              fetchRoutes('', '', '', '');
            }}
          >
            ফিল্টার রিসেট
          </button>
          <button type="submit" className="btn">সময়সূচী খুঁজুন</button>
        </div>
      </form>

      {loading ? (
        <LoadingSpinner message="পরিবহন রুট ও সময়সূচী লোড হচ্ছে..." />
      ) : routes.length === 0 ? (
        <EmptyState
          icon="🚌"
          title="কোন পরিবহন রুট পাওয়া যায়নি"
          description="আপনার ফিল্টার অনুযায়ী কোন পরিবহন সময়সূচী পাওয়া যায়নি।"
        />
      ) : (
        <div className="grid-layout">
          {routes.map((r) => (
            <div key={r.id} className="service-card col-6" style={{ marginBottom: '1rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.25rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span className="pattern-tag" style={{ background: 'rgba(52, 211, 153, 0.2)', color: '#34d399' }}>{r.division || 'বাংলাদেশ'} বিভাগ</span>
                    <span className="pattern-tag" style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8' }}>{r.route_code}</span>
                  </div>
                  <span style={{ color: '#34d399', fontWeight: 'bold', fontSize: '1.1rem' }}>{r.fare_bdt} ৳ / টিকিট</span>
                </div>

                <h3 style={{ fontSize: '1.15rem', color: '#f8fafc', margin: '0.35rem 0' }}>
                  🚩 {r.origin_bn} ➔ 🏁 {r.destination_bn}
                </h3>

                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                  <span>📏 দূরত্ব: {r.distance_km} কিমি</span>
                  <span>⏱️ সময়: {r.estimated_duration_minutes} মিনিট</span>
                  <span>🚌 অপারেটর: {r.operator_name_bn}</span>
                </div>

                <h4 style={{ fontSize: '0.9rem', color: '#fbbf24', marginTop: '0.75rem', marginBottom: '0.35rem' }}>
                  ⏱️ সময়সূচী ও ট্রিপসমূহ (Timetable Schedules):
                </h4>

                <div className="table-container" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>ছাড়ার সময়</th>
                        <th>পৌঁছানোর সময়</th>
                        <th>চলমান দিন</th>
                        <th>অবস্থা</th>
                      </tr>
                    </thead>
                    <tbody>
                      {r.schedules.map((s) => (
                        <tr key={s.id}>
                          <td style={{ color: '#34d399', fontWeight: 'bold' }}>{s.departure_time}</td>
                          <td>{s.arrival_time}</td>
                          <td style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{s.days_of_week}</td>
                          <td>
                            <span className="status-badge-approved" style={{ fontSize: '0.7rem' }}>
                              {s.is_active ? 'সক্রিয়' : 'বন্ধ'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
