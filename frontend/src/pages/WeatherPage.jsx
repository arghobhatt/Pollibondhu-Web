import React, { useState, useEffect } from 'react';
import PageHeader from '../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import { LoadingState } from '../components/ui/LoadingState';
import { Select } from '../components/ui/FormComponents';
import { CloudSun, Wind, Droplets, RefreshCw, Calendar } from 'lucide-react';
import { formatDate } from '../lib/utils';

export default function WeatherPage() {
  const [selectedCity, setSelectedCity] = useState('ঢাকা');
  const [locations, setLocations] = useState(['ঢাকা', 'চট্টগ্রাম', 'সিলেট', 'রাজশাহী', 'খুলনা', 'বরিশাল', 'রংপুর', 'ময়মনসিংহ']);
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
    fetchWeather(selectedCity);
  }, []);

  const handleCityChange = (e) => {
    const city = e.target.value;
    setSelectedCity(city);
    fetchWeather(city);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="ডিজিটাল আবহাওয়া পূর্বাভাস"
        description="জেলা ভিত্তিক লাইভ তাপমাত্রা, আর্দ্রতা, বায়ুপ্রবাহ ও আগামী ৩ দিনের পূর্বাভাস"
      />

      <Card>
        <CardContent className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">জেলা নির্বাচন করুন:</label>
            <Select value={selectedCity} onChange={handleCityChange} className="w-full sm:w-64">
              {locations.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </Select>
          </div>

          <button
            onClick={() => fetchWeather(selectedCity)}
            disabled={loading}
            type="button"
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 border border-slate-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'রিফ্রেশ হচ্ছে...' : 'তথ্য রিফ্রেশ করুন'}</span>
          </button>
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
                  <span>আগামী ৩ দিনের পূর্বাভাস (3-Day Forecast)</span>
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
