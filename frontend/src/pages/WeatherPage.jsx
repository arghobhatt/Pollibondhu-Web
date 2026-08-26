import React, { useState, useEffect } from 'react';
import PageHeader from '../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import { LoadingState } from '../components/ui/LoadingState';
import { Select } from '../components/ui/FormComponents';
import { useLocation } from '../hooks/useLocation';
import { CloudSun, Wind, Droplets, RefreshCw, Calendar, MapPin, Navigation } from 'lucide-react';
import { formatDate } from '../lib/utils';

export default function WeatherPage() {
  const { locationName, coords, loading: locLoading, error: locError, permissionState, requestLocation, setManualLocation } = useLocation();

  const [locations, setLocations] = useState(['ঢাকা', 'চট্টগ্রাম', 'সিলেট', 'রাজশাহী', 'খুলনা', 'বরিশাল', 'রংপুর', 'ময়মনসিংহ', 'গাজীপুর', 'বগুড়া', 'পাবনা', 'যশোর', 'কুমিল্লা']);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchLocations = async () => {
    try {
      const res = await fetch('/api/weather/locations');
      if (res.ok) setLocations(await res.json());
    } catch (e) {}
  };

  const fetchWeather = async (city) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
      if (res.ok) {
        setWeatherData(await res.json());
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    if (locationName) {
      fetchWeather(locationName);
    }
  }, [locationName]);

  const handleCityChange = (e) => {
    const city = e.target.value;
    setManualLocation(city);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="ডিজিটাল আবহাওয়া ও লাইভ জিপিএস পূর্বাভাস"
        description="আপনার ডিভাইসের রিয়েল-টাইম অবস্থান সনাক্তকরণ এবং জেলা ভিত্তিক লাইভ আবহাওয়া আপডেট"
      />

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <MapPin className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="w-full sm:w-64">
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">বর্তমান অবস্থান / জেলা:</label>
                <Select value={locationName} onChange={handleCityChange}>
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                onClick={requestLocation}
                disabled={locLoading}
                type="button"
                className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Navigation className={`w-3.5 h-3.5 ${locLoading ? 'animate-spin' : ''}`} />
                <span>{locLoading ? 'অবস্থান খোঁজা হচ্ছে...' : 'লাইভ GPS অবস্থান খুঁজুন'}</span>
              </button>

              <button
                onClick={() => fetchWeather(locationName)}
                disabled={loading}
                type="button"
                className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 border border-slate-200"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>রিফ্রেশ</span>
              </button>
            </div>
          </div>

          {locError && (
            <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
              {locError}
            </p>
          )}

          {coords && (
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono bg-slate-50 p-2 rounded-lg border border-slate-200">
              <span className="font-semibold text-emerald-700">জিপিএস স্থানাঙ্ক:</span>
              <span>Lat {coords.latitude.toFixed(4)}, Lon {coords.longitude.toFixed(4)}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {loading && <LoadingState message="লাইভ আবহাওয়া তথ্য লোড হচ্ছে..." />}

      {!loading && weatherData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="বর্তমান তাপমাত্রা"
              value={`${weatherData.temperature_celsius}°C`}
              subtitle={`${weatherData.city} (${weatherData.condition_bn})`}
              icon={CloudSun}
              color="emerald"
            />
            <StatCard
              title="বাতাসের আর্দ্রতা"
              value={`${weatherData.humidity}%`}
              subtitle="কৃষি কাজের উপযোগী আর্দ্রতা"
              icon={Droplets}
              color="cyan"
            />
            <StatCard
              title="বাতাসের গতিবেগ"
              value={`${weatherData.wind_speed} km/h`}
              subtitle={`সর্বশেষ আপডেট: ${new Date(weatherData.fetched_at).toLocaleTimeString()}`}
              icon={Wind}
              color="amber"
            />
          </div>

          {weatherData.forecast && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span>আগামী ৩ দিনের আবহাওয়া পূর্বাভাস (3-Day Forecast)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {weatherData.forecast.map((item, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl text-center space-y-1.5">
                      <strong className="text-xs text-emerald-800 font-semibold block">{item.day}</strong>
                      <div className="text-xl font-bold text-slate-900">{item.temperature_celsius}°C</div>
                      <span className="text-xs text-slate-500 block font-normal">{item.condition_bn}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
