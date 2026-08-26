import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import MobileNavigation from './MobileNavigation';
import AuthModal from '../auth/AuthModal';

export default function AppShell() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-emerald-500 selection:text-white">
      <Navbar onMobileMenuToggle={() => setMobileMenuOpen(true)} />

      <div className="flex-1 flex w-full max-w-7xl mx-auto">
        <Sidebar />
        <MobileNavigation isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

        <main className="flex-1 min-w-0 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      <footer className="mt-auto border-t border-slate-200/80 bg-white py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© ২০২৬ পল্লীবন্ধু — সমন্বিত গ্রামীণ সেবা প্ল্যাটফর্ম</span>
          <span className="text-[11px] text-slate-400">গণপ্রজাতন্ত্রী বাংলাদেশ সরকারের গ্রামীণ ও ডিজিটালাইজড কৃষি উদ্যোগ</span>
        </div>
      </footer>

      <AuthModal />
    </div>
  );
}
