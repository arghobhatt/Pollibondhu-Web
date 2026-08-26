import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sprout, Bell, LogIn, LogOut, User, Menu, Shield } from 'lucide-react';

export default function Navbar({ onMobileMenuToggle }) {
  const { currentUser, logout, openAuthModal } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      const token = localStorage.getItem('pollibondhu_token');
      if (!token) return;
      try {
        const res = await fetch('/api/notifications', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.filter(n => !n.is_read).length);
        }
      } catch (e) {}
    };
    fetchUnread();
  }, [currentUser]);

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200/80 px-4 lg:px-6 py-3 flex items-center justify-between shadow-subtle">
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          type="button"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm group-hover:bg-emerald-700 transition-colors">
            <Sprout className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-base font-bold text-slate-900 tracking-tight block leading-tight">
              পল্লীবন্ধু
            </span>
            <span className="text-[10px] text-slate-500 font-medium block">
              সমন্বিত গ্রামীণ সেবা প্ল্যাটফর্ম
            </span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {currentUser && (
          <Link
            to="/notifications"
            className="relative p-2 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-slate-100 transition-colors"
            title="নোটিফিকেশন"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-600" />
            )}
          </Link>
        )}

        {currentUser ? (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <Link
              to="/profile"
              className="hidden sm:flex flex-col text-right hover:text-emerald-700 transition-colors"
            >
              <span className="text-xs font-semibold text-slate-900 flex items-center gap-1 justify-end">
                <User className="w-3 h-3 text-emerald-600" />
                {currentUser.full_name}
              </span>
              <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1 justify-end">
                <Shield className="w-2.5 h-2.5 text-slate-400" />
                {currentUser.role === 'officer' ? 'উপসহকারী কৃষি কর্মকর্তা' : 'নাগরিক'}
              </span>
            </Link>
            <button
              onClick={logout}
              type="button"
              className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors text-xs font-medium flex items-center gap-1"
              title="লগআউট"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">লগআউট</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => openAuthModal('login')}
            type="button"
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>প্রবেশ করুন</span>
          </button>
        )}
      </div>
    </header>
  );
}
