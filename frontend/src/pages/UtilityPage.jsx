import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/layout/PageHeader';
import StatusBadge from '../components/ui/StatusBadge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import DataTable, { DataTableRow, DataTableCell } from '../components/ui/DataTable';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { FormField, Input } from '../components/ui/FormComponents';
import { Zap, Droplets, Flame, Home, FileText, CreditCard, CheckCircle2, History, AlertCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/utils';

const DEFAULT_BILL_TYPES = [
  {
    id: "electricity",
    name_bn: "পল্লী বিদ্যুৎ বিল",
    name_en: "Polli Bidyut Electricity Bill",
    biller_name_bn: "বাংলাদেশ পল্লী বিদ্যুতায়ন বোর্ড (REB)",
    icon: "⚡",
    description_bn: "এসএমএস হিসাব নম্বর দিয়ে পল্লী বিদ্যুৎ বিল পরিশোধ করুন।"
  },
  {
    id: "water_irrigation",
    name_bn: "কৃষি সেচ ও নলকূপ পানি বিল",
    name_en: "Irrigation Water Bill",
    biller_name_bn: "উপজেলা কৃষি সেচ কমিটি ও বিএমডিএ (ওয়াসা)",
    icon: "💧",
    description_bn: "গভীর নলকূপ সেচ কমিটি ও কৃষক কার্ড নম্বর দিয়ে পানি বিল পরিশোধ করুন।"
  },
  {
    id: "gas_lpg",
    name_bn: "এলপিজি ও গ্যাস বিল",
    name_en: "LPG & Gas Connection Bill",
    biller_name_bn: "এলপিজি ডিস্ট্রিবিউশন ও সংশ্লিষ্ট গ্যাস কোম্পানি",
    icon: "🔥",
    description_bn: "গ্রাহক কোড ও ডিলার আইডি দিয়ে এলপিজি ও গ্যাস বিল পরিশোধ করুন।"
  },
  {
    id: "holding_tax",
    name_bn: "ইউনিয়ন পরিষদ হোল্ডিং ট্যাক্স",
    name_en: "Union Holding Tax",
    biller_name_bn: "ধামরাই ইউনিয়ন পরিষদ",
    icon: "🏠",
    description_bn: "হোল্ডিং নম্বর ও ওয়ার্ড নম্বর দিয়ে বাৎসরিক পৌর/ইউনিয়ন কর প্রদান করুন।"
  },
  {
    id: "trade_license",
    name_bn: "ইউনিয়ন ট্রেড লাইসেন্স ফি",
    name_en: "Trade License Renewal Fee",
    biller_name_bn: "ধামরাই ইউনিয়ন পরিষদ",
    icon: "📜",
    description_bn: "গ্রামীণ ব্যবসায়ী ও ফার্মের লাইসেন্স নবায়ন ফি প্রদান করুন।"
  }
];

export default function UtilityPage() {
  const { currentUser, authToken, openAuthModal } = useAuth();

  const [billTypes, setBillTypes] = useState(DEFAULT_BILL_TYPES);
  const [selectedBillType, setSelectedBillType] = useState(DEFAULT_BILL_TYPES[0]);
  const [accountNumber, setAccountNumber] = useState('');
  const [amountBdt, setAmountBdt] = useState(1250);

  const [myBills, setMyBills] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('bKash');
  const [transactionId, setTransactionId] = useState('');

  const [paymentSuccessReceipt, setPaymentSuccessReceipt] = useState(null);
  const [paymentError, setPaymentError] = useState('');
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [loadingPay, setLoadingPay] = useState(false);

  const getServiceIcon = (id) => {
    switch (id) {
      case 'electricity': return <Zap className="w-5 h-5 text-amber-600" />;
      case 'water_irrigation': return <Droplets className="w-5 h-5 text-blue-600" />;
      case 'gas_lpg': return <Flame className="w-5 h-5 text-rose-600" />;
      case 'holding_tax': return <Home className="w-5 h-5 text-emerald-600" />;
      case 'trade_license': return <FileText className="w-5 h-5 text-indigo-600" />;
      default: return <Zap className="w-5 h-5 text-emerald-600" />;
    }
  };

  const fetchBillTypes = async () => {
    try {
      const res = await fetch('/api/utility/bill-types');
      if (res.ok) {
        const types = await res.json();
        if (Array.isArray(types) && types.length > 0) {
          setBillTypes(types);
          setSelectedBillType(types[0]);
        }
      }
    } catch (e) {
      // Fallback already in place
    }
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
  }, []);

  useEffect(() => {
    if (authToken) fetchMyBills();
  }, [authToken]);

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    if (!authToken) {
      openAuthModal('login');
      return;
    }
    setPaymentSuccessReceipt(null);
    setPaymentError('');
    setLoadingPay(true);

    try {
      const res = await fetch('/api/utility/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          bill_type: selectedBillType?.id || 'electricity',
          account_number: accountNumber,
          amount_bdt: parseFloat(amountBdt),
          payment_method: paymentMethod,
          transaction_id: transactionId.trim() || undefined
        })
      });
      const data = await res.json();
      if (res.ok) {
        setPaymentSuccessReceipt(data);
        setTransactionId('');
        fetchMyBills();
      } else {
        setPaymentError(data.detail || 'বিল পরিশোধ ব্যর্থ হয়েছে।');
      }
    } catch (e) {
      setPaymentError('নেটওয়ার্ক ত্রুটি!');
    } finally {
      setLoadingPay(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="ইউটিলিটি ও বিল পরিশোধ কেন্দ্র"
        description="পল্লী বিদ্যুৎ, কৃষি সেচ ও পানি, এলপিজি গ্যাস, হোল্ডিং ট্যাক্স ও ট্রেড লাইসেন্স ফি ডিজিটালভাবে পরিশোধ করুন"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {billTypes.map((bt) => (
          <Card
            key={bt.id}
            onClick={() => setSelectedBillType(bt)}
            className={`cursor-pointer transition-all flex flex-col justify-between hover:border-emerald-400 ${
              selectedBillType?.id === bt.id ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20' : ''
            }`}
          >
            <CardHeader className="p-4 pb-2">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mb-2 shadow-2xs">
                {getServiceIcon(bt.id)}
              </div>
              <CardTitle className="text-sm font-bold text-slate-900 leading-tight">{bt.name_bn}</CardTitle>
              <CardDescription className="text-[11px] font-medium text-slate-500">{bt.biller_name_bn}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">{bt.description_bn}</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedBillType(bt);
                  setIsPayModalOpen(true);
                  setPaymentSuccessReceipt(null);
                  setPaymentError('');
                  setTransactionId('');
                }}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg transition-colors shadow-sm flex items-center justify-center gap-1.5"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>বিল প্রদান করুন</span>
              </button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-600" />
            <span>আমার বিল পরিশোধের ইতিহাস</span>
          </CardTitle>
          <CardDescription>বিগত সকল ইউটিলিটি পরিশোধের ডিজিটাল রসিদ ও ট্রানজেকশন ট্র্যাকিং</CardDescription>
        </CardHeader>
        <CardContent>
          {!authToken ? (
            <EmptyState
              icon={History}
              title="লগইন প্রয়োজন"
              description="বিল পরিশোধের ইতিহাস দেখতে সাইন-ইন করুন।"
              actionLabel="প্রবেশ করুন / সাইন-ইন"
              onAction={() => openAuthModal('login')}
            />
          ) : myBills.length === 0 ? (
            <EmptyState
              icon={History}
              title="কোন পূর্ববর্তী পরিশোধ নেই"
              description="আপনার একাউন্টে কোন বিল পরিশোধের রেকর্ড পাওয়া যায়নি।"
            />
          ) : (
            <DataTable headers={["ট্রানজেকশন আইডি", "পেমেন্ট মাধ্যম", "সেবা প্রতিষ্ঠান", "হিসাব / মিটার নম্বর", "পরিমাণ", "স্ট্যাটাস", "সময়"]}>
              {myBills.map((b) => (
                <DataTableRow key={b.id}>
                  <DataTableCell className="font-mono font-bold text-slate-900">{b.transaction_id}</DataTableCell>
                  <DataTableCell>
                    <span className="font-semibold text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {b.payment_method || 'bKash'}
                    </span>
                  </DataTableCell>
                  <DataTableCell className="font-semibold text-slate-800">{b.biller_name_bn}</DataTableCell>
                  <DataTableCell className="font-mono text-slate-700">{b.account_number}</DataTableCell>
                  <DataTableCell className="font-bold text-emerald-700">{formatCurrency(b.amount_bdt)}</DataTableCell>
                  <DataTableCell><StatusBadge status={b.status} /></DataTableCell>
                  <DataTableCell className="text-slate-500 text-[11px]">{formatDate(b.paid_at)}</DataTableCell>
                </DataTableRow>
              ))}
            </DataTable>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        title={`বিল প্রদান: ${selectedBillType?.name_bn || ''}`}
        subtitle="নিরাপদে ডিজিটাল বিল পরিশোধ ও ট্রানজেকশন নিশ্চিতকরণ"
      >
        {paymentSuccessReceipt ? (
          <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="text-base font-bold text-emerald-900">বিল পরিশোধ সফল হয়েছে!</h4>
            <div className="text-xs text-slate-700 space-y-1 text-left bg-white p-3.5 rounded-lg border border-slate-200 font-mono">
              <p>ট্রানজেকশন আইডি: <strong className="text-emerald-700">{paymentSuccessReceipt.transaction_id}</strong></p>
              <p>পেমেন্ট মাধ্যম: <strong>{paymentSuccessReceipt.payment_method || 'bKash'}</strong></p>
              <p>প্রতিষ্ঠান: {paymentSuccessReceipt.biller_name_bn}</p>
              <p>হিসাব নম্বর: {paymentSuccessReceipt.account_number}</p>
              <p className="text-sm font-bold text-emerald-800 pt-1">মোট টাকা: {formatCurrency(paymentSuccessReceipt.amount_bdt)}</p>
            </div>
            <button
              onClick={() => setIsPayModalOpen(false)}
              type="button"
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg transition-colors shadow-sm"
            >
              রসিদ বন্ধ করুন
            </button>
          </div>
        ) : (
          <form onSubmit={handlePaySubmit} className="space-y-4">
            {paymentError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{paymentError}</span>
              </div>
            )}

            <FormField label="সেবা সংস্থা">
              <Input value={selectedBillType?.biller_name_bn || ''} readOnly />
            </FormField>

            <FormField label="হিসাব / মিটার / গ্রাহক নম্বর" required>
              <Input
                placeholder="হিসাব নম্বর বা মিটার আইডি লিখুন"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                required
              />
            </FormField>

            <FormField label="বিলের পরিমাণ (৳)" required>
              <Input
                type="number"
                value={amountBdt}
                onChange={(e) => setAmountBdt(e.target.value)}
                required
              />
            </FormField>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">পরিশোধের মাধ্যম:</label>
              <div className="grid grid-cols-4 gap-2">
                {['bKash', 'Nagad', 'Rocket', 'Bank'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPaymentMethod(m)}
                    className={`py-2 px-1 text-center rounded-lg border font-medium text-xs transition-all ${
                      paymentMethod === m
                        ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-200'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {m === 'bKash' ? 'বিকাশ' : m === 'Nagad' ? 'নগদ' : m === 'Rocket' ? 'রকেট' : 'ব্যাংক'}
                  </button>
                ))}
              </div>
            </div>

            <FormField label={paymentMethod === 'Bank' ? 'ব্যাংক রেফারেন্স নম্বর / Transaction ID' : 'লেনদেন আইডি / Transaction ID (ঐচ্ছিক)'}>
              <Input
                placeholder={paymentMethod === 'Bank' ? 'যেমন: CHALAN-2026-DH-099' : 'যেমন: BK8923741X'}
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
              />
            </FormField>

            <button
              type="submit"
              disabled={loadingPay}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs transition-colors shadow-sm"
            >
              {loadingPay ? 'প্রসেসিং হচ্ছে...' : 'নিরাপদে বিল পরিশোধ করুন'}
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
}
