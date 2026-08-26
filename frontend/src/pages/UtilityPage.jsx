import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/layout/PageHeader';
import StatusBadge from '../components/ui/StatusBadge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import DataTable, { DataTableRow, DataTableCell } from '../components/ui/DataTable';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { FormField, Input } from '../components/ui/FormComponents';
import { Zap, CreditCard, CheckCircle2, History } from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/utils';

export default function UtilityPage() {
  const { currentUser, authToken, openAuthModal } = useAuth();

  const [billTypes, setBillTypes] = useState([]);
  const [selectedBillType, setSelectedBillType] = useState(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [amountBdt, setAmountBdt] = useState(1250);

  const [myBills, setMyBills] = useState([]);
  const [paymentSuccessReceipt, setPaymentSuccessReceipt] = useState(null);
  const [paymentError, setPaymentError] = useState('');
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [loadingPay, setLoadingPay] = useState(false);

  const fetchBillTypes = async () => {
    try {
      const res = await fetch('/api/utility/bill-types');
      if (res.ok) {
        const types = await res.json();
        setBillTypes(types);
        if (types.length > 0) setSelectedBillType(types[0]);
      }
    } catch (e) {}
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
          bill_type: selectedBillType.id,
          account_number: accountNumber,
          amount_bdt: parseFloat(amountBdt)
        })
      });
      const data = await res.json();
      if (res.ok) {
        setPaymentSuccessReceipt(data);
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
        description="পল্লী বিদ্যুৎ, ওয়াসা সেচ, এলপিজি গ্যাস ও হোল্ডিং ট্যাক্স বিল নিরাপদে পরিশোধ করুন"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {billTypes.map((bt) => (
          <Card
            key={bt.id}
            onClick={() => setSelectedBillType(bt)}
            className={`cursor-pointer transition-all flex flex-col justify-between ${
              selectedBillType?.id === bt.id ? 'border-emerald-500 bg-emerald-50/30' : ''
            }`}
          >
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
                <Zap className="w-5 h-5" />
              </div>
              <CardTitle>{bt.name_bn}</CardTitle>
              <CardDescription>{bt.biller_name_bn}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-slate-500 line-clamp-2">{bt.description_bn}</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedBillType(bt);
                  setIsPayModalOpen(true);
                  setPaymentSuccessReceipt(null);
                  setPaymentError('');
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
          <CardDescription>বিগত সকল ইউটিলিটি পরিশোধের ডিজিটাল রসিদ</CardDescription>
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
            <DataTable headers={["ট্রানজেকশন আইডি", "সেবা প্রতিষ্ঠান", "হিসাব / মিটার নম্বর", "পরিমাণ", "স্ট্যাটাস", "সময়"]}>
              {myBills.map((b) => (
                <DataTableRow key={b.id}>
                  <DataTableCell className="font-mono font-bold text-slate-900">{b.transaction_id}</DataTableCell>
                  <DataTableCell className="font-semibold">{b.biller_name_bn}</DataTableCell>
                  <DataTableCell className="font-mono">{b.account_number}</DataTableCell>
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
        subtitle="নিরাপদে ডিজিটাল বিল পরিশোধ করুন"
      >
        {paymentSuccessReceipt ? (
          <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="text-base font-bold text-emerald-900">বিল পরিশোধ সফল হয়েছে!</h4>
            <div className="text-xs text-slate-700 space-y-1 text-left bg-white p-3 rounded-lg border border-slate-200 font-mono">
              <p>ট্রানজেকশন আইডি: <strong className="text-emerald-700">{paymentSuccessReceipt.transaction_id}</strong></p>
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
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                {paymentError}
              </div>
            )}

            <FormField label="সেবা সংস্থা">
              <Input value={selectedBillType?.biller_name_bn || ''} readOnly />
            </FormField>

            <FormField label="হিসাব / মিটার নম্বর" required>
              <Input
                placeholder="হিসাব নম্বর বা মিটার আইডি"
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

            <button
              type="submit"
              disabled={loadingPay}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs transition-colors shadow-sm"
            >
              {loadingPay ? 'প্রসেসিং...' : 'নিরাপদে বিল পরিশোধ করুন'}
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
}
