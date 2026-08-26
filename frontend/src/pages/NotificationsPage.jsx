import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { NotificationItem } from '../components/ui/NotificationItem';
import { EmptyState } from '../components/ui/EmptyState';
import { FormField, Input, Select, Textarea } from '../components/ui/FormComponents';
import { Bell, Send, CheckCheck } from 'lucide-react';

export default function NotificationsPage() {
  const { currentUser, authToken, openAuthModal } = useAuth();
  const [notifications, setNotifications] = useState([]);

  const [notifChannel, setNotifChannel] = useState('sms');
  const [notifRecipient, setNotifRecipient] = useState('+8801812345678');
  const [notifMessage, setNotifMessage] = useState('আপনার সেবার আবেদনটি সফলভাবে গৃহীত হয়েছে।');
  const [notifResponse, setNotifResponse] = useState(null);

  const fetchNotifications = async () => {
    if (!authToken) return;
    try {
      const res = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) setNotifications(await res.json());
    } catch (e) {}
  };

  useEffect(() => {
    fetchNotifications();
    if (currentUser) setNotifRecipient(currentUser.phone_number);
  }, [authToken, currentUser]);

  const handleMarkRead = async (notifId) => {
    if (!authToken) return;
    try {
      await fetch(`/api/notifications/${notifId}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      fetchNotifications();
    } catch (e) {}
  };

  const handleMarkAllRead = async () => {
    if (!authToken) return;
    try {
      await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      fetchNotifications();
    } catch (e) {}
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient: notifRecipient, message: notifMessage, channel: notifChannel })
      });
      if (res.ok) {
        setNotifResponse(await res.json());
        fetchNotifications();
      }
    } catch (e) {}
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="নাগরিক নোটিফিকেশন ইনবক্স"
        description="এসএমএস, ইমেইল ও মোবাইল অ্যাপের ডিজিটাল আপডেট বার্তা"
        action={
          notifications.some(n => !n.is_read) ? (
            <button
              onClick={handleMarkAllRead}
              type="button"
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
            >
              <CheckCheck className="w-4 h-4" />
              <span>সব পড়া হয়েছে চিহ্নিত করুন</span>
            </button>
          ) : null
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          {!authToken ? (
            <EmptyState
              icon={Bell}
              title="লগইন প্রয়োজন"
              description="নোটিফিকেশন বার্তা দেখতে অনুগ্রহ করে সাইন-ইন করুন।"
              actionLabel="সাইন-ইন"
              onAction={() => openAuthModal('login')}
            />
          ) : notifications.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="কোন নোটিফিকেশন নেই"
              description="আপনার ইনবক্সে বর্তমানে নতুন কোন বার্তা নেই।"
            />
          ) : (
            <div className="space-y-3">
              {notifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  title={n.title}
                  message={n.message}
                  createdAt={n.created_at}
                  channel={n.channel}
                  isRead={n.is_read}
                  onMarkRead={() => handleMarkRead(n.id)}
                />
              ))}
            </div>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-4 h-4 text-emerald-600" />
              <span>পরীক্ষামূলক বার্তা প্রেরক</span>
            </CardTitle>
            <CardDescription>বিভিন্ন চ্যানেলে নোটিফিকেশন পরীক্ষা করুন</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendNotification} className="space-y-3">
              <FormField label="চ্যানেল">
                <Select value={notifChannel} onChange={(e) => setNotifChannel(e.target.value)}>
                  <option value="sms">SMS Gateway</option>
                  <option value="email">Email Service</option>
                  <option value="push">Push Notification</option>
                </Select>
              </FormField>

              <FormField label="প্রাপক">
                <Input value={notifRecipient} onChange={(e) => setNotifRecipient(e.target.value)} />
              </FormField>

              <FormField label="বার্তা">
                <Textarea rows={3} value={notifMessage} onChange={(e) => setNotifMessage(e.target.value)} />
              </FormField>

              <button
                type="submit"
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg transition-colors shadow-sm"
              >
                বার্তা পাঠান
              </button>
            </form>

            {notifResponse && (
              <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
                <p className="font-semibold">✓ বার্তা সফলভাবে পাঠানো হয়েছে!</p>
                <p className="text-[11px] opacity-80 pt-0.5 font-mono">ID: {notifResponse.message_id}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
