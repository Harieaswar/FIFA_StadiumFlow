import React, { useEffect, useState } from 'react';
import { Bell, Check, CheckCheck, Trash2, Filter } from 'lucide-react';
import api from '../services/api';
import { Notification, NotificationCategory } from '../types';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import EmptyState from '../components/ui/EmptyState';
import clsx from 'clsx';

const CATEGORY_ICONS: Record<NotificationCategory, string> = {
  crowd: '👥', transport: '🚇', emergency: '🚨', task: '📌', incident: '🚨', sustainability: '🌿', general: '🔔',
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  const fetch = async () => {
    const res = await api.get<{ notifications: Notification[]; unreadCount: number }>('/notifications', { category: filter || undefined });
    if (res.success) { setNotifications(res.data.notifications); setUnreadCount(res.data.unreadCount); }
    setLoading(false);
  };
  useEffect(() => { fetch(); }, [filter]);

  const markRead = async (id: string) => {
    await api.put(`/notifications/${id}/read`);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = async () => {
    await api.put('/notifications/read-all');
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const deleteNotif = async (id: string) => {
    await api.delete(`/notifications/${id}`);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const CATEGORIES = ['crowd', 'transport', 'emergency', 'task', 'incident', 'sustainability', 'general'];

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-header">Notifications</h1>
          <p className="section-subheader">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="btn-secondary text-sm gap-2">
            <CheckCheck size={16} /> Mark all read
          </button>
        )}
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilter('')} className={clsx('text-xs px-3 py-1.5 rounded-full transition-colors', !filter ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700')}>All</button>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setFilter(c)} className={clsx('text-xs px-3 py-1.5 rounded-full transition-colors capitalize', filter === c ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700')}>
            {CATEGORY_ICONS[c as NotificationCategory]} {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[0,1,2,3].map(i => <SkeletonCard key={i} height="h-20" />)}</div>
      ) : notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" description="You're all caught up! No notifications to show." />
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div key={n.id} className={clsx('card p-4 flex items-start gap-3 transition-colors', !n.read && 'border-indigo-500/20 bg-indigo-950/10')}>
              <span className="text-xl flex-shrink-0" aria-hidden="true">{CATEGORY_ICONS[n.category] || '🔔'}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={clsx('text-sm font-medium', n.read ? 'text-slate-300' : 'text-slate-100')}>{n.title}</p>
                  {!n.read && <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 mt-1.5" aria-label="Unread" />}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{n.message}</p>
                <p className="text-xs text-slate-600 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                {!n.read && (
                  <button onClick={() => markRead(n.id)} className="btn-ghost p-1.5" aria-label="Mark as read">
                    <Check size={14} className="text-emerald-400" />
                  </button>
                )}
                <button onClick={() => deleteNotif(n.id)} className="btn-ghost p-1.5" aria-label="Delete notification">
                  <Trash2 size={14} className="text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
