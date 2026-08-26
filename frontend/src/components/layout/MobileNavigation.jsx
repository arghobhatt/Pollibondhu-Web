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
  User,
  X,
  Sprout as LogoIcon
} from 'lucide-react';

export default function MobileNavigation({ isOpen, onClose }) {
  const { isOfficer, currentUser } = useAuth();

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={onClose} />

      <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-elevated border-r border-slate-200 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <LogoIcon className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 text-sm">পল্লীবন্ধু নেভিগেশন</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 p-3 overflow-y-auto space-y-1">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200/60'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </div>
  );
}
