// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Activity, AlertCircle, AlertTriangle, CheckCircle, Clock, RefreshCw, ThumbsUp, ThumbsDown, UserCheck } from 'lucide-react';
import api from '../services/api';
import { CrowdReading } from '../types';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import ErrorState from '../components/ui/ErrorState';
import { CrowdLevelBadge } from '../components/ui/StatusBadge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import clsx from 'clsx';
import { useAuth } from '../contexts/AuthContext';

interface Recommendation {
  id: string; action: string; priority: string; zone: string; status: string; createdAt: string;
}

const LEVEL_COLORS: Record<string, string> = { low: '#10b981', moderate: '#f59e0b', high: '#f97316', critical: '#ef4444' };

export default function CrowdIntelligence() {
  const { user } = useAuth();
  const [readings, setReadings] = useState<CrowdReading[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchData = async () => {
    try {
      setError('');
      const [crowdRes, recRes] = await Promise.all([
        api.get<CrowdReading[]>('/crowd/readings'),
        api.get<Recommendation[]>('/crowd/recommendations'),
      ]);
      if (crowdRes.success) setReadings(crowdRes.data);
      if (recRes.success) setRecommendations(recRes.data);
      setLastUpdated(new Date());
    } catch { setError('Failed to load crowd data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); const t = setInterval(fetchData, 30000); return () => clearInterval(t); }, []);

  const totalCount = readings.reduce((s, r) => s + r.count, 0);
  const totalCapacity = readings.reduce((s, r) => s + r.capacity, 0);
  const occupancy = totalCapacity ? Math.round((totalCount / totalCapacity) * 100) : 0;

  const chartData = readings.map(r => ({
    gate: r.gate.replace('Gate ', 'G'),
    occupancy: Math.round((r.count / r.capacity) * 100),
    level: r.level,
  }));

  const handleRec = async (id: string, status: string) => {
    await api.put(`/crowd/recommendations/${id}`, { status });
    setRecommendations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  if (error && !loading) return <ErrorState message={error} onRetry={fetchData} />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-header">Crowd Intelligence</h1>
          <p className="section-subheader">Real-time crowd monitoring • Updated {lastUpdated.toLocaleTimeString()}</p>
        </div>
        <button onClick={fetchData} className="btn-secondary gap-2 text-sm">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-lg font-semibold text-slate-200">Stadium Capacity: {totalCount.toLocaleString()} / {totalCapacity.toLocaleString()}</p>
            <p className="text-sm text-slate-500">{occupancy}% occupied</p>
          </div>
          {occupancy >= 90 ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-900/20 border border-red-800/50 rounded-xl">
              <AlertCircle size={16} className="text-red-400" />
              <span className="text-red-400 text-sm font-medium">CRITICAL — Near Capacity</span>
            </div>
          ) : occupancy >= 75 ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-900/20 border border-amber-800/50 rounded-xl">
              <AlertTriangle size={16} className="text-amber-400" />
              <span className="text-amber-400 text-sm font-medium">HIGH — Monitor Closely</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-900/20 border border-emerald-800/50 rounded-xl">
              <CheckCircle size={16} className="text-emerald-400" />
              <span className="text-emerald-400 text-sm font-medium">NORMAL — Within Limits</span>
            </div>
          )}
        </div>
        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={clsx('h-full rounded-full transition-all duration-500', occupancy >= 90 ? 'bg-red-500' : occupancy >= 75 ? 'bg-amber-500' : 'bg-emerald-500')}
            style={{ width: `${Math.min(occupancy, 100)}%` }}
            role="progressbar"
            aria-valuenow={occupancy}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Stadium ${occupancy}% occupied`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="text-base font-semibold text-slate-200 mb-4">Gate Occupancy (%)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.2)" />
              <XAxis dataKey="gate" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}
                formatter={(val: number) => [`${val}%`, 'Occupancy']}
              />
              <Bar dataKey="occupancy" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={LEVEL_COLORS[entry.level]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-3">
          {loading ? (
            [0,1,2,3].map(i => <SkeletonCard key={i} height="h-20" />)
          ) : readings.map(r => {
            const pct = Math.round((r.count / r.capacity) * 100);
            return (
              <div key={r.id} className={clsx('card p-4 crowd-' + r.level)}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-slate-200">{r.gate}</p>
                    <p className="text-xs text-slate-500">{r.zone}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <CrowdLevelBadge level={r.level} />
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock size={10} /> {r.queueMinutes} min wait
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-black/20 rounded-full overflow-hidden">
                    <div className="h-full bg-current rounded-full transition-all" style={{ width: `${pct}%` }}
                      role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}
                      aria-label={`${r.gate} ${pct}% full`}
                    />
                  </div>
                  <span className="text-xs font-mono">{pct}%</span>
                  <span className="text-xs text-slate-400">{r.count.toLocaleString()}/{r.capacity.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {(user?.role === 'admin' || user?.role === 'staff') && (
        <div className="card p-5">
          <h2 className="text-base font-semibold text-slate-200 mb-4">🤖 AI Crowd Management Recommendations</h2>
          {recommendations.length === 0 ? (
            <p className="text-slate-500 text-sm">No recommendations at this time.</p>
          ) : (
            <div className="space-y-3">
              {recommendations.map(rec => (
                <div key={rec.id} className={clsx('flex items-start gap-4 p-4 rounded-xl border', rec.status === 'accepted' ? 'bg-emerald-900/10 border-emerald-800/30' : rec.status === 'rejected' ? 'bg-slate-800/30 border-slate-700 opacity-60' : 'bg-slate-800/50 border-slate-700')}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded-full', rec.priority === 'high' ? 'bg-red-900/30 text-red-400' : rec.priority === 'medium' ? 'bg-amber-900/30 text-amber-400' : 'bg-slate-700 text-slate-400')}>
                        {rec.priority.toUpperCase()}
                      </span>
                      <span className="text-xs text-slate-500">{rec.zone}</span>
                    </div>
                    <p className="text-sm text-slate-200">{rec.action}</p>
                  </div>
                  {rec.status === 'pending' ? (
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => handleRec(rec.id, 'accepted')} className="btn-secondary text-xs gap-1 py-1.5">
                        <ThumbsUp size={12} /> Accept
                      </button>
                      <button onClick={() => handleRec(rec.id, 'rejected')} className="btn-ghost text-xs gap-1 py-1.5 text-red-400">
                        <ThumbsDown size={12} /> Reject
                      </button>
                    </div>
                  ) : (
                    <span className={clsx('text-xs font-medium px-2 py-1 rounded-lg', rec.status === 'accepted' ? 'text-emerald-400' : 'text-slate-500')}>
                      {rec.status}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
