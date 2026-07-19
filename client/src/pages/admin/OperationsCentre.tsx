// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Shield, Users, AlertTriangle, Activity, Bus, Zap, TrendingUp, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import StatCard from '../../components/ui/StatCard';
import { SkeletonCard } from '../../components/ui/SkeletonCard';
import ErrorState from '../../components/ui/ErrorState';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

interface Overview {
  attendance: { current: number; capacity: number; percentage: number };
  incidents: { active: number; total: number; critical: number };
  tasks: { open: number; total: number; inProgress: number };
  crowd: { criticalZones: number };
  transport: { updates: number; delayed: number };
  staff: { total: number; volunteers: number };
}

export default function OperationsCentre() {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchData = async () => {
    try {
      const res = await api.get<Overview>('/admin/overview');
      if (res.success) { setData(res.data); setLastUpdated(new Date()); }
    } catch { setError('Failed to load operations data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); const t = setInterval(fetchData, 30000); return () => clearInterval(t); }, []);

  const radarData = data ? [
    { subject: 'Attendance', value: data.attendance.percentage },
    { subject: 'Incidents', value: Math.min(data.incidents.active * 10, 100) },
    { subject: 'Tasks', value: data.tasks.inProgress * 20 },
    { subject: 'Transport', value: data.transport.delayed * 25 },
    { subject: 'Crowd Risk', value: data.crowd.criticalZones * 25 },
    { subject: 'Staff Ready', value: Math.min((data.staff.total + data.staff.volunteers) * 5, 100) },
  ] : [];

  if (error) return <ErrorState message={error} onRetry={fetchData} />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-header">Operations Centre</h1>
          <p className="section-subheader">Real-time stadium operations overview • {lastUpdated.toLocaleTimeString()}</p>
        </div>
        <button onClick={fetchData} className="btn-secondary gap-2"><RefreshCw size={14} />Refresh</button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">{[0,1,2,3,4,5].map(i => <SkeletonCard key={i} />)}</div>
      ) : data ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard title="Stadium Attendance" value={`${data.attendance.percentage}%`} subtitle={`${data.attendance.current.toLocaleString()} / ${data.attendance.capacity.toLocaleString()}`} icon={Users} color="blue" />
            <StatCard title="Active Incidents" value={data.incidents.active} subtitle={`${data.incidents.critical} critical`} icon={AlertTriangle} color="red" />
            <StatCard title="Open Tasks" value={data.tasks.open} subtitle={`${data.tasks.inProgress} in progress`} icon={TrendingUp} color="teal" />
            <StatCard title="Critical Crowd Zones" value={data.crowd.criticalZones} subtitle="zones at capacity" icon={Activity} color="amber" />
            <StatCard title="Transport Delays" value={data.transport.delayed} subtitle={`of ${data.transport.updates} services`} icon={Bus} color="purple" />
            <StatCard title="Active Personnel" value={data.staff.total + data.staff.volunteers} subtitle={`${data.staff.total} staff • ${data.staff.volunteers} volunteers`} icon={Shield} color="emerald" />
          </div>

          <div className="card p-5">
            <h2 className="text-base font-semibold text-slate-200 mb-4">Operations Radar</h2>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(100,116,139,0.3)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Radar name="Status" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }} formatter={(v: number) => [`${v}%`]} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : null}
    </div>
  );
}
