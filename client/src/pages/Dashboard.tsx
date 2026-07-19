// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import {
  Users, AlertTriangle, Activity, Zap, Droplets, Recycle, Bus, CheckSquare,
  TrendingUp, Shield, Map, Bot, FileWarning, Leaf, Clock, ArrowRight
} from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import ErrorState from '../components/ui/ErrorState';
import { CrowdReading, TransportUpdate, Incident, Task } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { SeverityBadge, StatusBadge, CrowdLevelBadge } from '../components/ui/StatusBadge';
import clsx from 'clsx';

const QUICK_ACTIONS = [
  { label: 'AI Assistant', icon: Bot, path: '/assistant', color: 'from-indigo-500 to-blue-600', desc: 'Ask FlowBot anything' },
  { label: 'Map & Navigate', icon: Map, path: '/navigation', color: 'from-teal-500 to-cyan-600', desc: 'Find your way' },
  { label: 'Emergency', icon: AlertTriangle, path: '/emergency', color: 'from-red-500 to-rose-600', desc: 'Report an incident' },
  { label: 'Transport', icon: Bus, path: '/transport', color: 'from-amber-500 to-orange-600', desc: 'Plan your journey' },
];

const entryFlowData = [
  { time: '15:00', entries: 1200, exits: 80 }, { time: '16:00', entries: 3400, exits: 120 },
  { time: '17:00', entries: 5800, exits: 200 }, { time: '18:00', entries: 8200, exits: 350 },
  { time: '19:00', entries: 4100, exits: 800 }, { time: '20:00', entries: 900, exits: 2400 },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [crowd, setCrowd] = useState<CrowdReading[]>([]);
  const [transport, setTransport] = useState<TransportUpdate[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [crowdRes, transportRes, incidentRes, taskRes] = await Promise.all([
          api.get<CrowdReading[]>('/crowd/readings').catch(() => ({ success: false, data: [] })),
          api.get<TransportUpdate[]>('/transport').catch(() => ({ success: false, data: [] })),
          api.get<{ incidents: Incident[] }>('/incidents').catch(() => ({ success: false, data: { incidents: [] } })),
          api.get<Task[]>('/tasks').catch(() => ({ success: false, data: [] })),
        ]);
        if (crowdRes.success) setCrowd(crowdRes.data as CrowdReading[]);
        if (transportRes.success) setTransport(transportRes.data as TransportUpdate[]);
        if (incidentRes.success) setIncidents((incidentRes.data as { incidents: Incident[] }).incidents || []);
        if (taskRes.success) setTasks(taskRes.data as Task[]);
      } catch {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const totalAttendance = crowd.reduce((s, r) => s + r.count, 0);
  const criticalZones = crowd.filter(r => r.level === 'critical').length;
  const activeIncidents = incidents.filter(i => !['resolved', 'closed'].includes(i.status)).length;
  const openTasks = tasks.filter(t => t.status !== 'completed').length;
  const delayedTransport = transport.filter(t => t.status === 'delayed').length;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="section-header">
            {greeting()}, {user?.displayName?.split(' ')[0]}! 👋
          </h1>
          <p className="section-subheader">
            FIFA World Cup 2026 · MetroFlow Arena · Brazil vs Argentina · KO 19:00 EDT
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-900/20 border border-emerald-800/40 rounded-xl">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-emerald-400 text-sm font-medium">Stadium Operational</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {QUICK_ACTIONS.map(a => (
          <button
            key={a.path}
            onClick={() => navigate(a.path)}
            className={clsx(
              'card p-4 text-left hover:scale-105 transition-transform duration-200 cursor-pointer',
              'bg-gradient-to-br border-0'
            )}
            style={{ background: `linear-gradient(135deg, rgba(99,102,241,0.1), rgba(14,165,233,0.05))`, border: '1px solid rgba(99,102,241,0.2)' }}
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center mb-3`}>
              <a.icon size={18} className="text-white" />
            </div>
            <p className="text-sm font-semibold text-slate-200">{a.label}</p>
            <p className="text-xs text-slate-500 mt-0.5">{a.desc}</p>
          </button>
        ))}
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Attendance" value={totalAttendance.toLocaleString()} subtitle="of 80,000 capacity" icon={Users} color="blue" trend={{ value: 12, label: 'vs last match' }} />
          <StatCard title="Active Incidents" value={activeIncidents} subtitle={`${incidents.filter(i => i.severity === 'critical').length} critical`} icon={AlertTriangle} color="red" />
          <StatCard title="Critical Crowd Zones" value={criticalZones} subtitle={`${crowd.length} zones monitored`} icon={Activity} color="amber" />
          <StatCard title="Open Tasks" value={openTasks} subtitle={`${tasks.filter(t => t.status === 'in_progress').length} in progress`} icon={CheckSquare} color="teal" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Entry/Exit chart */}
        <div className="lg:col-span-2 card p-5">
          <h2 className="text-base font-semibold text-slate-200 mb-4">Entry & Exit Flow Today</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={entryFlowData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.2)" />
              <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#e2e8f0' }} />
              <Bar dataKey="entries" fill="#6366f1" radius={[4, 4, 0, 0]} name="Entries" />
              <Bar dataKey="exits" fill="#14b8a6" radius={[4, 4, 0, 0]} name="Exits" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Crowd levels */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-200">Gate Crowd Levels</h2>
            <button onClick={() => navigate('/crowd')} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </button>
          </div>
          {loading ? (
            <div className="space-y-2">{[0, 1, 2, 3].map(i => <div key={i} className="skeleton h-12 rounded-xl" />)}</div>
          ) : (
            <div className="space-y-2">
              {crowd.slice(0, 5).map(r => (
                <div key={r.id} className={clsx('flex items-center justify-between p-3 rounded-xl crowd-' + r.level)}>
                  <div>
                    <p className="text-sm font-medium">{r.gate}</p>
                    <p className="text-xs opacity-70">{r.count.toLocaleString()} / {r.capacity.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <CrowdLevelBadge level={r.level} />
                    <p className="text-xs mt-1 opacity-70">{r.queueMinutes} min wait</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Incidents */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-200">Recent Incidents</h2>
            <button onClick={() => navigate('/incidents')} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </button>
          </div>
          {loading ? (
            <div className="space-y-2">{[0, 1, 2].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
          ) : incidents.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">No incidents reported</p>
          ) : (
            <div className="space-y-2">
              {incidents.slice(0, 4).map(inc => (
                <button
                  key={inc.id}
                  onClick={() => navigate(`/incidents/${inc.id}`)}
                  className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-slate-800/50 transition-colors text-left"
                >
                  <div className="mt-0.5">
                    <AlertTriangle size={16} className={inc.severity === 'critical' ? 'text-red-400' : inc.severity === 'high' ? 'text-orange-400' : 'text-amber-400'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{inc.type.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-slate-500 truncate">{inc.location}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <SeverityBadge severity={inc.severity} />
                    <StatusBadge status={inc.status} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Transport Status */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-200">Transport Status</h2>
            <button onClick={() => navigate('/transport')} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </button>
          </div>
          {loading ? (
            <div className="space-y-2">{[0, 1, 2, 3].map(i => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
          ) : (
            <div className="space-y-2">
              {transport.slice(0, 5).map(t => (
                <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                  <Bus size={16} className={t.status === 'delayed' ? 'text-amber-400' : t.status === 'suspended' || t.status === 'full' ? 'text-red-400' : 'text-emerald-400'} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{t.name}</p>
                    <p className="text-xs text-slate-500 truncate">{t.details}</p>
                  </div>
                  <StatusBadge status={t.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Admin-only: sustainability + AI summary */}
      {(user?.role === 'admin' || user?.role === 'staff') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <StatCard title="Energy Usage" value="47,200 kWh" subtitle="Target: 40,000 kWh" icon={Zap} color="amber" />
          <StatCard title="Water Usage" value="118,400 L" subtitle="Target: 100,000 L" icon={Droplets} color="blue" />
          <StatCard title="Recycling Rate" value="58%" subtitle="Target: 65%" icon={Recycle} color="emerald" />
        </div>
      )}
    </div>
  );
}
