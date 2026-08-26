import React, { useState, useEffect } from 'react';
import PageHeader from '../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { LoadingState } from '../components/ui/LoadingState';
import { EmptyState } from '../components/ui/EmptyState';
import { PhoneCall, ShieldAlert, HeartHandshake, Phone } from 'lucide-react';

export default function EmergencyPage() {
  const [contacts, setContacts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/emergency/categories');
      if (res.ok) setCategories(await res.json());
    } catch (e) {}
  };

  const fetchContacts = async (cat = 'all') => {
    setLoading(true);
    try {
      const url = cat && cat !== 'all' ? `/api/emergency/contacts?category=${encodeURIComponent(cat)}` : '/api/emergency/contacts';
      const res = await fetch(url);
      if (res.ok) setContacts(await res.json());
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchContacts('all');
  }, []);

  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
    fetchContacts(catId);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="relative rounded-2xl overflow-hidden shadow-card border border-rose-900/20 bg-rose-900 text-white min-h-[150px] flex items-center">
        <img
          src="https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80"
          alt="Emergency Support Hotline Bangladesh"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
          loading="lazy"
        />
        <div className="relative z-10 p-6 max-w-xl space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-800/80 text-rose-100 border border-rose-600/50 backdrop-blur-xs">
            <PhoneCall className="w-3.5 h-3.5" />
            <span>জরুরি সহায়তা ও নিরাপত্তা হটলাইন</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">জরুরি সেবা ও হেল্পলাইন ডিরেক্টরি</h2>
          <p className="text-xs text-rose-100/90 leading-relaxed font-normal">
            এক ক্লিকে সরাসরি জাতীয় জরুরি সেবা, কৃষি কল সেন্টার ও স্থানীয় সরকারি কর্মকর্তাদের হটলাইন নম্বর।
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <a
          href="tel:999"
          className="p-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-colors space-y-2 block"
        >
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">999</span>
            <ShieldAlert className="w-6 h-6" />
          </div>
          <p className="text-xs font-semibold">জাতীয় জরুরি সেবা (টোল ফ্রি)</p>
          <p className="text-[11px] text-rose-100 font-normal">পুলিশ | ফায়ার সার্ভিস | অ্যাম্বুলেন্স</p>
        </a>

        <a
          href="tel:333"
          className="p-5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white shadow-sm transition-colors space-y-2 block"
        >
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">333</span>
            <PhoneCall className="w-6 h-6" />
          </div>
          <p className="text-xs font-semibold">জাতীয় তথ্য হেল্পলাইন</p>
          <p className="text-[11px] text-sky-100 font-normal">সরকারি সেবা ও সামাজিক তথ্য</p>
        </a>

        <a
          href="tel:16123"
          className="p-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors space-y-2 block"
        >
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">16123</span>
            <HeartHandshake className="w-6 h-6" />
          </div>
          <p className="text-xs font-semibold">কৃষি কল সেন্টার</p>
          <p className="text-[11px] text-emerald-100 font-normal">কৃষি বিশেষজ্ঞ পরামর্শ</p>
        </a>

        <a
          href="tel:109"
          className="p-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors space-y-2 block"
        >
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">109</span>
            <Phone className="w-6 h-6" />
          </div>
          <p className="text-xs font-semibold">নারী ও শিশু নির্যাতন হেল্পলাইন</p>
          <p className="text-[11px] text-indigo-100 font-normal">জরুরি সুরক্ষা ও আইনি সহায়তা</p>
        </a>
      </div>

      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => handleCategorySelect(c.id)}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === c.id
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span>{c.name_bn}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingState message="জরুরি কন্টাক্ট নম্বরসমূহ লোড হচ্ছে..." />
      ) : contacts.length === 0 ? (
        <EmptyState
          icon={PhoneCall}
          title="কোন কন্টাক্ট নম্বর পাওয়া যায়নি"
          description="নির্বাচিত ক্যাটাগরিতে বর্তমানে কোন কন্টাক্ট নম্বর নথিভুক্ত নেই।"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {contacts.map((contact) => (
            <Card key={contact.id} className="flex flex-col justify-between">
              <CardHeader>
                <CardTitle>{contact.title_bn}</CardTitle>
                <CardDescription>
                  জেলা: {contact.district} | সময়: {contact.available_hours}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">{contact.description_bn}</p>
                <a
                  href={`tel:${contact.phone_number}`}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm block text-center"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>কল করুন ({contact.phone_number})</span>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
