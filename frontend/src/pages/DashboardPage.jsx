import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/layout/PageHeader';
import StatCard from '../components/ui/StatCard';
import ServiceCard from '../components/ui/ServiceCard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { LoadingState } from '../components/ui/LoadingState';
import { 
  CloudSun, 
  TrendingUp, 
  UserCheck, 
  Sprout, 
  ArrowRight, 
  FileText, 
  Search, 
  Send, 
  Calculator, 
  Megaphone, 
  Zap, 
  PhoneCall, 
  MessageSquare,
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const { currentUser, openAuthModal } = useAuth();
  
  const [dashboardData, setDashboardData] = useState(null);
  const [weatherCity, setWeatherCity] = useState('ঢাকা');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [loanPrincipal, setLoanPrincipal] = useState(100000);
  const [loanRate, setLoanRate] = useState(8.0);
  const [loanDuration, setLoanDuration] = useState(12);
  const [loanScheme, setLoanScheme] = useState('standard_emi');
  const [loanResult, setLoanResult] = useState(null);

  const fetchDashboard = async () => {
    try {
      const res = await fetch(`/api/dashboard?city=${encodeURIComponent(weatherCity)}`);
      if (res.ok) setDashboardData(await res.json());
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const fetchWeather = async () => {
    try {
      const res = await fetch(`/api/weather?city=${encodeURIComponent(weatherCity)}`);
      if (res.ok) setWeatherData(await res.json());
    } catch (e) {}
  };

  useEffect(() => {
    fetchDashboard();
    fetchWeather();
  }, [weatherCity]);

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
      if (res.ok) setLoanResult(await res.json());
    } catch (e) {}
  };

  if (loading) {
    return <LoadingState message="ড্যাশবোর্ড তথ্য লোড হচ্ছে..." />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-xl p-6 md:p-8 text-white shadow-card">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-700/50 text-emerald-100 border border-emerald-600/50">
            <Sprout className="w-3.5 h-3.5" />
            <span>সমন্বিত নাগরিক ও কৃষি প্ল্যাটফর্ম</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            স্বাগতম পল্লীবন্ধু ডিজিটাল ড্যাশবোর্ডে
          </h1>
          <p className="text-xs md:text-sm text-emerald-100/90 leading-relaxed font-normal">
            কৃষি সার, আবহাওয়া পূর্বাভাস, স্মার্ট ঋণ হিসাব, নাগরিক সেবা ও সরাসরি সরকারি সহায়তার সমন্বিত ডিজিটাল সমাধান।
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {!currentUser ? (
              <button
                onClick={() => openAuthModal('login')}
                type="button"
                className="px-4 py-2 bg-white hover:bg-emerald-50 text-emerald-900 font-semibold rounded-lg text-xs transition-colors shadow-sm flex items-center gap-1.5"
              >
                <span>একাউন্টে প্রবেশ করুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <Link
                to="/services"
                className="px-4 py-2 bg-white hover:bg-emerald-50 text-emerald-900 font-semibold rounded-lg text-xs transition-colors shadow-sm flex items-center gap-1.5"
              >
                <span>অনলাইন সেবায় আবেদন করুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
            <Link
              to="/tracking"
              className="px-4 py-2 bg-emerald-700/60 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs border border-emerald-600/60 transition-colors"
            >
              আবেদন ট্র্যাকিং
            </Link>
          </div>
        </div>
      </div>

      {dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="আবহাওয়া অবস্থা"
            value={`${dashboardData.weather.temperature_celsius}°C`}
            subtitle={`${dashboardData.weather.city} (${dashboardData.weather.condition_bn})`}
            icon={CloudSun}
            color="cyan"
          />

          <StatCard
            title="আমন ধান বাজারদর"
            value={`${dashboardData.market_prices[0]?.price_bdt || 0} ৳`}
            subtitle={`প্রতি মন | ${dashboardData.market_prices[0]?.district || 'জেলা'}`}
            icon={TrendingUp}
            color="emerald"
          />

          <StatCard
            title="দায়িত্বপ্রাপ্ত কৃষি কর্মকর্তা"
            value={dashboardData.assigned_officer?.officer_name || 'উপজেলা অফিস'}
            subtitle={`ফোন: ${dashboardData.assigned_officer?.phone || 'N/A'}`}
            icon={UserCheck}
            color="amber"
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>দ্রুত অ্যাকশন সেবা</CardTitle>
              <CardDescription>জরুরি নাগরিক ও সরকারি ডিজিটাল সেবাসমূহ</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Link
                  to="/services"
                  className="p-3.5 bg-slate-50 hover:bg-emerald-50/60 border border-slate-200/80 hover:border-emerald-200 rounded-xl transition-all text-center space-y-2 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-800 block">সেবা ডিরেক্টরি</span>
                </Link>

                <Link
                  to="/agriculture"
                  className="p-3.5 bg-slate-50 hover:bg-emerald-50/60 border border-slate-200/80 hover:border-emerald-200 rounded-xl transition-all text-center space-y-2 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                    <Sprout className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-800 block">কৃষি ও বাজার</span>
                </Link>

                <Link
                  to="/complaints"
                  className="p-3.5 bg-slate-50 hover:bg-emerald-50/60 border border-slate-200/80 hover:border-emerald-200 rounded-xl transition-all text-center space-y-2 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                    <Megaphone className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-800 block">অভিযোগ জমা</span>
                </Link>

                <Link
                  to="/emergency"
                  className="p-3.5 bg-slate-50 hover:bg-emerald-50/60 border border-slate-200/80 hover:border-emerald-200 rounded-xl transition-all text-center space-y-2 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-800 block">জরুরি হেল্পলাইন</span>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>কৃষি ঋণ কিস্তি ক্যালকুলেটর</CardTitle>
              <CardDescription>বিভিন্ন কৃষি ঋণ স্কিমের মাসিক পরিশোধ হিসাব</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCalculateLoan} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">ঋণের পরিমাণ (৳)</label>
                    <input
                      type="number"
                      value={loanPrincipal}
                      onChange={(e) => setLoanPrincipal(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">বার্ষিক সুদের হার (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={loanRate}
                      onChange={(e) => setLoanRate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">মেয়াদ (মাস)</label>
                    <input
                      type="number"
                      value={loanDuration}
                      onChange={(e) => setLoanDuration(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">ঋণ স্কিম নির্বাচন</label>
                  <select
                    value={loanScheme}
                    onChange={(e) => setLoanScheme(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-900"
                  >
                    <option value="standard_emi">Standard EMI (সাধারণ সমকিস্তি)</option>
                    <option value="seasonal_crop">Seasonal Crop (ফসল কাটার পর পরিশোধ)</option>
                    <option value="subsidy_loan">Subsidy Loan (সরকারি ৪% ভরতুকি)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs transition-colors shadow-sm"
                >
                  ঋণের হিসাব করুন
                </button>
              </form>

              {loanResult && (
                <div className="mt-4 p-4 bg-emerald-50/50 border border-emerald-200/80 rounded-xl space-y-1 text-xs text-slate-800">
                  <p className="font-semibold text-emerald-800">স্কিম টাইপ: {loanResult.scheme_type}</p>
                  <p>মোট পরিশোধযোগ্য পরিমাণ: <strong>{loanResult.total_repayment} ৳</strong> (মোট সুদ: {loanResult.total_interest} ৳)</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>লাইভ আবহাওয়া তথ্য</CardTitle>
              <CardDescription>জেলাভিত্তিক তাপমাত্রা ও পূর্বাভাস</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">জেলা নির্বাচন করুন</label>
                <select
                  value={weatherCity}
                  onChange={(e) => setWeatherCity(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-900"
                >
                  <option value="ঢাকা">ঢাকা</option>
                  <option value="চট্টগ্রাম">চট্টগ্রাম</option>
                  <option value="সিলেট">সিলেট</option>
                  <option value="রাজশাহী">রাজশাহী</option>
                  <option value="রংপুর">রংপুর</option>
                </select>
              </div>

              {weatherData && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">তাপমাত্রা</span>
                    <span className="text-lg font-bold text-slate-900">{weatherData.temperature_celsius}°C</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">অবস্থা</span>
                    <span className="text-slate-700 font-medium">{weatherData.condition_bn}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">আর্দ্রতা</span>
                    <span className="text-slate-700 font-medium">{weatherData.humidity}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">বায়ুপ্রবাহ</span>
                    <span className="text-slate-700 font-medium">{weatherData.wind_speed} km/h</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
