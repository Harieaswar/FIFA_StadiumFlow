// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Leaf, Zap, Droplets, Recycle, Bus, AlertTriangle, TrendingDown } from 'lucide-react';
import api from '../services/api';
import { SustainabilityMetric } from '../types';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import ErrorState from '../components/ui/ErrorState';
import StatCard from '../components/ui/StatCard';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts';

interface SummaryData {
  latest: SustainabilityMetric;
  targets: { energyKwh: number; waterLitres: number; wasteKg: number; recycledKg: number; carbonKg: number };
  recommendations: Array<{ id: string; message: string; saving: string; priority: string }>;
  isDemoData: boolean;
}

export default function Sustainability() {
  const [metrics, setMetrics] = useState<SustainabilityMetric[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [mRes, sRes] = await Promise.all([
          api.get<{ metrics: SustainabilityMetric[] }>('/sustainability/metrics').catch(() => ({ success: false, data: { metrics: [] } })),
          api.get<SummaryData>('/sustainability/summary').catch(() => ({ success: false, data: null })),
        ]);
        if (mRes.success) setMetrics((mRes.data as { metrics: SustainabilityMetric[] }).metrics || []);
        if (sRes.success && sRes.data) setSummary(sRes.data as SummaryData);
      } catch {
        setError('Failed to load sustainability data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const chartData = metrics.map(m => ({
    date: m.date.slice(5),
    energy: Math.round(m.energyKwh / 1000),
    water: Math.round(m.waterLitres / 1000),
    waste: m.wasteKg,
    recycled: m.recycledKg,
  }));

  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="section-header">Sustainability Dashboard</h1>
          <p className="section-subheader">Environmental impact tracking • <span className="text-amber-400">Demo Data</span></p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-900/20 border border-emerald-800/40 rounded-xl">
          <Leaf size={16} className="text-emerald-400" />
          <span className="text-emerald-400 text-sm">Green Stadium Initiative</span>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[0,1,2,3].map(i => <SkeletonCard key={i} />)}</div>
      ) : summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Energy Usage" value={`${(summary.latest.energyKwh / 1000).toFixed(1)}k kWh`} subtitle={`Target: ${(summary.targets.energyKwh / 1000).toFixed(0)}k kWh`} icon={Zap} color="amber" />
          <StatCard title="Water Usage" value={`${(summary.latest.waterLitres / 1000).toFixed(0)}k L`} subtitle={`Target: ${(summary.targets.waterLitres / 1000).toFixed(0)}k L`} icon={Droplets} color="blue" />
          <StatCard title="Recycling Rate" value={`${Math.round((summary.latest.recycledKg / summary.latest.wasteKg) * 100)}%`} subtitle={`${summary.latest.recycledKg.toLocaleString()} kg recycled`} icon={Recycle} color="emerald" />
          <StatCard title="Public Transport" value={summary.latest.publicTransportUsers.toLocaleString()} subtitle="users today" icon={Bus} color="teal" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="text-base font-semibold text-slate-200 mb-4">Energy Usage (MWh) — 7 Days</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.2)" />
              <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }} />
              <Area type="monotone" dataKey="energy" stroke="#f59e0b" fill="url(#energyGrad)" strokeWidth={2} name="Energy (MWh)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h2 className="text-base font-semibold text-slate-200 mb-4">Waste vs Recycled (kg) — 7 Days</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.2)" />
              <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }} />
              <Bar dataKey="waste" fill="#64748b" radius={[2, 2, 0, 0]} name="Total Waste" />
              <Bar dataKey="recycled" fill="#10b981" radius={[2, 2, 0, 0]} name="Recycled" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Recommendations */}
      {summary && (
        <div className="card p-5">
          <h2 className="text-base font-semibold text-slate-200 mb-4">🤖 AI Sustainability Recommendations</h2>
          <div className="space-y-3">
            {summary.recommendations.map(rec => (
              <div key={rec.id} className="flex items-start gap-4 p-4 bg-slate-800/50 border border-slate-800 rounded-xl">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${rec.priority === 'high' ? 'bg-amber-900/30' : 'bg-slate-700/50'}`}>
                  <TrendingDown size={16} className={rec.priority === 'high' ? 'text-amber-400' : 'text-slate-400'} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-200">{rec.message}</p>
                  <p className="text-xs text-emerald-400 mt-1">Estimated saving: {rec.saving}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${rec.priority === 'high' ? 'bg-amber-900/30 text-amber-400' : 'bg-slate-700 text-slate-400'}`}>
                  {rec.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
