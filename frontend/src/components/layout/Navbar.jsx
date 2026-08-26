import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Bell, 
  Search, 
  Menu, 
  User, 
  LogOut, 
  ChevronDown, 
  Sprout as LogoIcon,
  ShieldCheck,
  FileText
} from 'lucide-react';

export default function Navbar({ onOpenMobileNav }) {
  const { currentUser, authToken, isOfficer, logout, openAuthModal } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const fetchUnreadCount = async () => {
    if (!authToken) return;
    try {
      const res = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const notifs = await res.json();
        const unread = notifs.filter((n) => !n.is_read).length;
        setUnreadCount(unread);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 15000);
    return () => clearInterval(interval);
  }, [authToken]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/services?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-subtle transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenMobileNav}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 lg:hidden transition-colors"
              aria-label="মোবাইল নেভিগেশন খুলুন"
            >
              <Menu className="w-5 h-5" />
            </button>

            <NavLink to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm group-hover:bg-emerald-700 transition-colors">
                <LogoIcon className="w-5 h-5" />
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-base tracking-tight text-slate-900 block leading-none">পল্লীবন্ধু</span>
                <span className="text-[10px] text-slate-500 font-medium tracking-wide">ডিজিটাল গ্রামীণ সেবা পোর্টাল</span>
              </div>
            </NavLink>
          </div>

          <div className="flex-1 max-w-md hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="সেবা, কৃষি পরামর্শ বা ফরম খুঁজুন..."
                className="w-full pl-9 pr-4 py-2 bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-slate-200/80 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all"
              />
            </form>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {currentUser && (
              <NavLink
                to="/notifications"
                className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-colors"
                title="নোটিফিকেশন ইনবক্স"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </NavLink>
            )}

            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100/80 transition-colors border border-slate-200/60"
                >
                  <div className="w-7 h-7 rounded-lg overflow-hidden bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                    {currentUser.avatar_url ? (
                      <img src={currentUser.avatar_url} alt={currentUser.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{currentUser.full_name ? currentUser.full_name.charAt(0) : 'U'}</span>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-slate-800 hidden sm:block max-w-[100px] truncate">
                    {currentUser.full_name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-elevated py-1 z-50 text-xs animate-fade-in">
                    <div className="px-3.5 py-2.5 border-b border-slate-100 bg-slate-50/50">
                      <p className="font-semibold text-slate-900 truncate">{currentUser.full_name}</p>
                      <p className="text-[11px] text-slate-500 font-mono truncate">{currentUser.phone_number}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {isOfficer ? 'উপসহকারী কৃষি কর্মকর্তা' : 'নিবন্ধিত নাগরিক'}
                      </span>
                    </div>

                    <NavLink
                      to="/profile"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-500" />
                      <span>প্রোফাইল ও সেটিংস</span>
                    </NavLink>

                    <NavLink
                      to="/my-applications"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <FileText className="w-4 h-4 text-slate-500" />
                      <span>আমার আবেদনসমূহ</span>
                    </NavLink>

                    {isOfficer && (
                      <NavLink
                        to="/officer"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-2 px-3.5 py-2 text-slate-700 hover:bg-slate-50 transition-colors border-t border-slate-100"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>কর্মকর্তা প্যানেল</span>
                      </NavLink>
                    )}

                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-rose-600 hover:bg-rose-50 border-t border-slate-100 transition-colors font-medium text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>লগআউট (সাইন-আউট)</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5" />
                <span>সাইন-ইন / নিবন্ধন</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
