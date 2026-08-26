import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import DataTable, { DataTableRow, DataTableCell } from '../components/ui/DataTable';
import { Modal } from '../components/ui/Modal';
import { LoadingState } from '../components/ui/LoadingState';
import { EmptyState } from '../components/ui/EmptyState';
import { FormField, Input, Select } from '../components/ui/FormComponents';
import { 
  Sprout, 
  Stethoscope, 
  TrendingUp, 
  Calculator, 
  BookOpen, 
  Search, 
  CheckCircle2, 
  ShieldCheck,
  FileText
} from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/utils';

export default function AgriPage() {
  const { currentUser, authToken, isOfficer, openAuthModal } = useAuth();
  const [agriTab, setAgriTab] = useState('crop_doctor');

  const [diseases, setDiseases] = useState([]);
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [diseaseSearch, setDiseaseSearch] = useState('');

  const [marketPrices, setMarketPrices] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [newCropName, setNewCropName] = useState('');
  const [newCropNameBn, setNewCropNameBn] = useState('');
  const [newMarketName, setNewMarketName] = useState('');
  const [newDistrict, setNewDistrict] = useState('');
  const [newPriceBdt, setNewPriceBdt] = useState('');
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
      openAuthModal('login');
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
        setNewCropName('');
        setNewCropNameBn('');
        setNewMarketName('');
        setNewDistrict('');
        setNewPriceBdt('');
        fetchMarketPrices();
      } else {
        setPriceUpdateMsg(data.detail || 'বাজারদর আপডেট করা সম্ভব হয়নি।');
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
      openAuthModal('login');
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="relative rounded-2xl overflow-hidden shadow-card border border-emerald-900/20 bg-emerald-900 text-white min-h-[160px] flex items-center">
        <img
          src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=1200&q=80"
          alt="Agriculture Crop Inspection Bangladesh"
          className="absolute inset-0 w-full h-full object-cover opacity-25"
          loading="lazy"
        />
        <div className="relative z-10 p-6 max-w-xl space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-800/80 text-emerald-100 border border-emerald-600/50 backdrop-blur-xs">
            <Sprout className="w-3.5 h-3.5" />
            <span>আধুনিক কৃষি ও ফসল নিরাপত্তা</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">কৃষি ও বাজার তথ্য কেন্দ্র</h2>
          <p className="text-xs text-emerald-100/90 leading-relaxed font-normal">
            ফসলের রোগ নির্ণয়, অনুমোদিত চিকিৎসা, শস্য বাজারদর ও সহজ শর্তে কৃষি ঋণের ডিজিটাল হিসাব।
          </p>
        </div>
      </div>

      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setAgriTab('crop_doctor')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            agriTab === 'crop_doctor'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Stethoscope className="w-4 h-4 text-emerald-600" />
          <span>ক্রপ ডক্টর (রোগ চিকিৎসা)</span>
        </button>
        <button
          onClick={() => setAgriTab('market_prices')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            agriTab === 'market_prices'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <span>ফসলের বাজারদর</span>
        </button>
        <button
          onClick={() => setAgriTab('agri_loan')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            agriTab === 'agri_loan'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Calculator className="w-4 h-4 text-emerald-600" />
          <span>কৃষি ঋণ হিসাব</span>
        </button>
        <button
          onClick={() => setAgriTab('articles')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            agriTab === 'articles'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <BookOpen className="w-4 h-4 text-emerald-600" />
          <span>কৃষি নির্দেশিকা</span>
        </button>
      </div>

      {agriTab === 'crop_doctor' && (
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleDiseaseSearchSubmit} className="flex gap-2">
                <Input
                  value={diseaseSearch}
                  onChange={(e) => setDiseaseSearch(e.target.value)}
                  placeholder="ফসলের নাম লিখুন (যেমন: ধান, আলু, গম...)"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>রোগ খুঁজুন</span>
                </button>
              </form>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {diseases.map((d) => (
              <Card key={d.id} className="flex flex-col justify-between overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-emerald-700">{d.disease_name_bn}</CardTitle>
                  <CardDescription>ফসল: {d.crop_name_bn} ({d.crop_name_en})</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs space-y-1">
                    <p className="font-semibold text-amber-700">উপসর্গ (Symptoms):</p>
                    <p className="text-slate-600 line-clamp-3">{d.symptoms_bn}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedDisease(d)}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded-lg transition-colors"
                  >
                    প্রতিকার ও চিকিৎসা নির্দেশিকা
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Modal
            isOpen={!!selectedDisease}
            onClose={() => setSelectedDisease(null)}
            title={selectedDisease?.disease_name_bn || ''}
            subtitle={`ফসল: ${selectedDisease?.crop_name_bn || ''}`}
          >
            {selectedDisease && (
              <div className="space-y-3 text-xs leading-relaxed">
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 space-y-1">
                  <p className="font-bold">উপসর্গ:</p>
                  <p>{selectedDisease.symptoms_bn}</p>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 space-y-1">
                  <p className="font-bold">অনুমোদিত প্রতিকার ও চিকিৎসা:</p>
                  <p>{selectedDisease.treatment_bn}</p>
                </div>

                <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg text-sky-800 space-y-1">
                  <p className="font-bold">প্রতিরোধমূলক পরামর্শ:</p>
                  <p>{selectedDisease.prevention_bn}</p>
                </div>
              </div>
            )}
          </Modal>
        </div>
      )}

      {agriTab === 'market_prices' && (
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleDistrictFilterSubmit} className="flex gap-2">
                <Input
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  placeholder="জেলা দিয়ে ফিল্টার করুন (যেমন: ঢাকা, বগুড়া, পাবনা...)"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>ফিল্টার</span>
                </button>
              </form>
            </CardContent>
          </Card>

          <DataTable headers={["ফসলের নাম", "বাজার / হাট", "জেলা", "বাজারদর (প্রতি মন)", "আপডেটের সময়"]}>
            {marketPrices.map((p) => (
              <DataTableRow key={p.id}>
                <DataTableCell className="font-semibold text-slate-900">{p.crop_name_bn} ({p.crop_name})</DataTableCell>
                <DataTableCell>{p.market_name}</DataTableCell>
                <DataTableCell>{p.district}</DataTableCell>
                <DataTableCell className="font-bold text-emerald-700">{p.price_bdt_per_mon} ৳</DataTableCell>
                <DataTableCell className="text-slate-500 text-[11px]">{formatDate(p.updated_at)}</DataTableCell>
              </DataTableRow>
            ))}
          </DataTable>

          {isOfficer && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-800">
                  <ShieldCheck className="w-4 h-4" />
                  <span>কর্মকর্তা বাজারদর এন্ট্রি ফরম</span>
                </CardTitle>
                <CardDescription>নতুন বাজারদর রেকর্ড ভুক্তি</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {priceUpdateMsg && (
                  <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">{priceUpdateMsg}</p>
                )}
                <form onSubmit={handleOfficerPriceSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <FormField label="ফসলের নাম (বাংলা)">
                    <Input value={newCropNameBn} onChange={(e) => setNewCropNameBn(e.target.value)} placeholder="সরিষা" required />
                  </FormField>
                  <FormField label="Crop Name (English)">
                    <Input value={newCropName} onChange={(e) => setNewCropName(e.target.value)} placeholder="Mustard" required />
                  </FormField>
                  <FormField label="বাজার / হাট">
                    <Input value={newMarketName} onChange={(e) => setNewMarketName(e.target.value)} placeholder="ধামরাই হাট" required />
                  </FormField>
                  <FormField label="জেলা">
                    <Input value={newDistrict} onChange={(e) => setNewDistrict(e.target.value)} placeholder="ঢাকা" required />
                  </FormField>
                  <FormField label="মূল্য (টাকা / মন)">
                    <Input type="number" value={newPriceBdt} onChange={(e) => setNewPriceBdt(e.target.value)} placeholder="3200" required />
                  </FormField>
                  <div className="flex items-end">
                    <button type="submit" className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg transition-colors shadow-sm">
                      বাজারদর দাখিল করুন
                    </button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {agriTab === 'agri_loan' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>কৃষি ঋণ কিস্তি ক্যালকুলেটর</CardTitle>
              <CardDescription>বিভিন্ন ঋণ স্কিমের হিসাব ও আবেদন</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleCalculateLoanStrategy} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <FormField label="ঋণের পরিমাণ (৳)">
                  <Input type="number" value={loanPrincipal} onChange={(e) => setLoanPrincipal(e.target.value)} required />
                </FormField>
                <FormField label="সুদের হার (%)">
                  <Input type="number" step="0.1" value={loanRate} onChange={(e) => setLoanRate(e.target.value)} required />
                </FormField>
                <FormField label="মেয়াদ (মাস)">
                  <Input type="number" value={loanDuration} onChange={(e) => setLoanDuration(e.target.value)} required />
                </FormField>
                <FormField label="ঋণ স্কিম">
                  <Select value={loanScheme} onChange={(e) => setLoanScheme(e.target.value)}>
                    <option value="standard_emi">Standard EMI (সমকিস্তি)</option>
                    <option value="seasonal_crop">Seasonal Crop (ফসল কাটার পর)</option>
                    <option value="subsidy_loan">Subsidy Loan (সরকারি ৪% ভরতুকি)</option>
                  </Select>
                </FormField>

                <div className="sm:col-span-4 flex flex-col sm:flex-row gap-3 pt-2">
                  <button type="submit" className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg transition-colors">
                    ঋণের হিসাব করুন
                  </button>
                  <button type="button" onClick={handleApplyLoanSubmit} className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg transition-colors shadow-sm">
                    অনলাইনে ঋণের আবেদন করুন
                  </button>
                </div>
              </form>

              {loanApplySuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg">
                  {loanApplySuccessMsg}
                </div>
              )}

              {loanCalculation && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                  <p className="font-bold text-slate-900">স্কিম: {loanCalculation.scheme_type}</p>
                  <p className="text-slate-700">মোট পরিশোধযোগ্য: <strong>{formatCurrency(loanCalculation.total_repayment)}</strong> (সুদ: {formatCurrency(loanCalculation.total_interest)})</p>

                  <DataTable headers={["মাস", "কিস্তি (৳)", "আসল", "সুদ", "অবশিষ্ট"]}>
                    {loanCalculation.schedule.map((item) => (
                      <DataTableRow key={item.period}>
                        <DataTableCell className="font-semibold text-emerald-700">মাস {item.period}</DataTableCell>
                        <DataTableCell>{item.payment} ৳</DataTableCell>
                        <DataTableCell>{item.principal_component} ৳</DataTableCell>
                        <DataTableCell>{item.interest_component} ৳</DataTableCell>
                        <DataTableCell>{item.remaining_balance} ৳</DataTableCell>
                      </DataTableRow>
                    ))}
                  </DataTable>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {agriTab === 'articles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {articles.map((art) => (
            <Card key={art.id} className="flex flex-col justify-between">
              <CardHeader>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 w-fit mb-1">
                  {art.category}
                </span>
                <CardTitle>{art.title_bn}</CardTitle>
                <CardDescription>{art.summary_bn}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                  {art.content_bn}
                </p>
                <p className="text-[11px] text-slate-400">
                  লেখক: {art.author} | প্রকাশ: {formatDate(art.created_at)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
