import React, { useEffect, useState } from 'react';
import { Bus, Train, Car, MapPin, Clock, AlertTriangle, CheckCircle, RefreshCw, Loader2, Navigation } from 'lucide-react';
import api from '../services/api';
import { TransportUpdate, TransportType } from '../types';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import ErrorState from '../components/ui/ErrorState';
import { StatusBadge } from '../components/ui/StatusBadge';
import clsx from 'clsx';

const TYPE_ICONS: Record<TransportType, React.ElementType> = {
  metro: Train, shuttle: Bus, taxi: Car, parking: MapPin, walking: Navigation,
};

interface TravelPlan {
  from: string; to: string; recommendedMode: string; estimatedDuration: string;
  walkingDistance: string; carbonSaving: string; steps: Array<{ step: number; type: string; instruction: string; duration?: string; distance?: string; nextDeparture?: string; }>;
  possibleDelays: string; sustainableAlternative: string; accessibleAlternative?: string; isDemoData: boolean;
}

export default function Transportation() {
  const [updates, setUpdates] = useState<TransportUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [from, setFrom] = useState('Stadium - Gate A');
  const [to, setTo] = useState('City Centre Hotel District');
  const [mode, setMode] = useState('metro');
  const [accessibility, setAccessibility] = useState(false);
  const [plan, setPlan] = useState<TravelPlan | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  useEffect(() => {
    api.get<TransportUpdate[]>('/transport').then(res => {
      if (res.success) setUpdates(res.data);
    }).catch(() => setError('Failed to load transport data')).finally(() => setLoading(false));
  }, []);

  const generatePlan = async () => {
    setPlanLoading(true);
    try {
      const res = await api.post<TravelPlan>('/transport/plan', { from, to, mode, accessibility });
      if (res.success) setPlan(res.data);
    } catch { } finally { setPlanLoading(false); }
  };

  const filtered = activeFilter === 'all' ? updates : updates.filter(u => u.type === activeFilter);
  const filters = ['all', 'metro', 'shuttle', 'taxi', 'parking'];

  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="section-header">Transportation</h1>
        <p className="section-subheader">Real-time transport status and AI-powered journey planning</p>
      </div>

      <div className="card p-5">
        <h2 className="text-base font-semibold text-slate-200 mb-4">AI Journey Planner</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="input-label">From</label>
            <input value={from} onChange={e => setFrom(e.target.value)} className="input-field" placeholder="Starting point" />
          </div>
          <div>
            <label className="input-label">To</label>
            <input value={to} onChange={e => setTo(e.target.value)} className="input-field" placeholder="Destination" />
          </div>
          <div>
            <label className="input-label">Preferred Mode</label>
            <select value={mode} onChange={e => setMode(e.target.value)} className="input-field">
              <option value="metro">Metro / Train</option>
              <option value="shuttle">Shuttle Bus</option>
              <option value="taxi">Taxi</option>
              <option value="walking">Walking</option>
            </select>
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={accessibility} onChange={e => setAccessibility(e.target.checked)} className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-indigo-500" />
              <span className="text-sm text-slate-300">Accessibility needs</span>
            </label>
          </div>
        </div>
        <button onClick={generatePlan} disabled={planLoading} className="btn-primary">
          {planLoading ? <><Loader2 size={16} className="animate-spin" /> Planning...</> : <><Navigation size={16} /> Plan My Journey</>}
        </button>

        {plan && (
          <div className="mt-5 border-t border-slate-800 pt-5">
            {plan.isDemoData && (
              <p className="text-xs text-amber-400 mb-3 flex items-center gap-1"><AlertTriangle size={12} /> Demo travel plan — connect Gemini API for personalized routes</p>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {[{ label: 'Duration', val: plan.estimatedDuration }, { label: 'Walking', val: plan.walkingDistance }, { label: 'Carbon Saving', val: plan.carbonSaving }, { label: 'Mode', val: plan.recommendedMode }].map(s => (
                <div key={s.label} className="bg-slate-800/60 rounded-xl p-3">
                  <p className="text-xs text-slate-500">{s.label}</p>
                  <p className="text-sm font-semibold text-slate-200">{s.val}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {plan.steps.map(step => (
                <div key={step.step} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-indigo-400">{step.step}</span>
                  </div>
                  <div>
                    <p className="text-sm text-slate-200">{step.instruction}</p>
                    {(step.duration || step.distance) && (
                      <p className="text-xs text-slate-500">{step.duration}{step.duration && step.distance ? ' • ' : ''}{step.distance}{step.nextDeparture ? ` • Next: ${step.nextDeparture}` : ''}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {plan.possibleDelays && (
              <div className="mt-3 p-3 bg-amber-900/20 border border-amber-800/30 rounded-xl">
                <p className="text-xs text-amber-300"><AlertTriangle size={12} className="inline mr-1" />{plan.possibleDelays}</p>
              </div>
            )}
            {plan.accessibleAlternative && (
              <div className="mt-2 p-3 bg-blue-900/20 border border-blue-800/30 rounded-xl">
                <p className="text-xs text-blue-300">♿ {plan.accessibleAlternative}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-200">Live Transport Status</h2>
          <div className="flex gap-1">
            {filters.map(f => (
              <button key={f} onClick={() => setActiveFilter(f)}
                className={clsx('text-xs px-2.5 py-1 rounded-lg transition-colors capitalize', activeFilter === f ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700')}>
                {f}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="space-y-3">{[0,1,2,3].map(i => <SkeletonCard key={i} height="h-16" />)}</div>
        ) : (
          <div className="space-y-2">
            {filtered.map(t => {
              const Icon = TYPE_ICONS[t.type] || Bus;
              return (
                <div key={t.id} className="flex items-start gap-3 p-4 bg-slate-800/50 border border-slate-800 rounded-xl">
                  <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                    t.status === 'on_time' || t.status === 'available' ? 'bg-emerald-900/30' : t.status === 'delayed' ? 'bg-amber-900/30' : 'bg-red-900/30'
                  )}>
                    <Icon size={16} className={t.status === 'on_time' || t.status === 'available' ? 'text-emerald-400' : t.status === 'delayed' ? 'text-amber-400' : 'text-red-400'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-slate-200">{t.name}</p>
                      <StatusBadge status={t.status} />
                    </div>
                    <p className="text-xs text-slate-500">{t.details}</p>
                    {t.nextDeparture && <p className="text-xs text-slate-400 mt-1"><Clock size={10} className="inline mr-1" />Next: {t.nextDeparture}{t.delay ? ` (+${t.delay} min delay)` : ''}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
