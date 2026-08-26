import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Grid, 
  Search, 
  Sprout, 
  CloudSun, 
  Megaphone, 
  Zap, 
  Bus, 
  PhoneCall, 
  MessageSquare, 
  FileText, 
  ShieldAlert,
  Bell,
  User
} from 'lucide-react';

export default function Sidebar() {
  const { isOfficer, currentUser } = useAuth();

  const mainNavItems = [
    { path: '/', label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
    { path: '/services', label: 'সেবা ডিরেক্টরি', icon: Grid },
    { path: '/tracking', label: 'আবেদন ট্র্যাকিং', icon: Search },
    { path: '/agriculture', label: 'কৃষি ও বাজার তথ্য', icon: Sprout },
    { path: '/weather', label: 'আবহাওয়া পূর্বাভাস', icon: CloudSun },
    { path: '/complaints', label: 'নাগরিক অভিযোগ', icon: Megaphone },
    { path: '/utility', label: 'ইউটিলিটি ও বিল', icon: Zap },
    { path: '/transport', label: 'গ্রামীণ পরিবহন', icon: Bus },
    { path: '/emergency', label: 'জরুরি সেবা', icon: PhoneCall },
    { path: '/community', label: 'ফোরাম ও প্রশিক্ষণ', icon: MessageSquare },
  ];

  if (currentUser) {
    mainNavItems.push(
      { path: '/my-applications', label: 'আমার আবেদনসমূহ', icon: FileText },
      { path: '/notifications', label: 'নোটিফিকেশন', icon: Bell },
      { path: '/profile', label: 'আমার প্রোফাইল', icon: User }
    );
  }

  if (isOfficer) {
    mainNavItems.push(
      { path: '/officer', label: 'কর্মকর্তা প্যানেল', icon: ShieldAlert }
    );
  }

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200/80 p-4 shrink-0 shadow-subtle min-h-[calc(100vh-65px)]">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          মূল নেভিগেশন
        </div>
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200/60 shadow-subtle'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
}
