import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileWarning, Search, Filter, Plus, Eye, Clock, RefreshCw, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { Incident, IncidentStatus, Severity } from '../types';
import { SkeletonTable } from '../components/ui/SkeletonCard';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import { SeverityBadge, StatusBadge } from '../components/ui/StatusBadge';
import clsx from 'clsx';

export default function IncidentManagement() {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [total, setTotal] = useState(0);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ incidents: Incident[]; total: number }>('/incidents', { status: statusFilter || undefined, severity: severityFilter || undefined });
      if (res.success) { setIncidents(res.data.incidents); setTotal(res.data.total); }
    } catch { setError('Failed to load incidents'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchIncidents(); }, [statusFilter, severityFilter]);

  const filtered = incidents.filter(i =>
    search === '' ||
    i.type.includes(search.toLowerCase()) ||
    i.location.toLowerCase().includes(search.toLowerCase()) ||
    i.reportNumber.toLowerCase().includes(search.toLowerCase())
  );

  const STATUSES: IncidentStatus[] = ['submitted', 'acknowledged', 'staff_assigned', 'in_progress', 'resolved', 'closed'];
  const SEVERITIES: Severity[] = ['low', 'medium', 'high', 'critical'];

  if (error) return <ErrorState message={error} onRetry={fetchIncidents} />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="section-header">Incident Management</h1>
          <p className="section-subheader">{total} total incidents</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchIncidents} className="btn-secondary gap-1 text-sm"><RefreshCw size={14} />Refresh</button>
          <button onClick={() => navigate('/emergency')} className="btn-danger gap-1 text-sm"><Plus size={14} />Report Incident</button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-xl border border-slate-700">
            <Search size={16} className="text-slate-500" />
            <input
              type="search" placeholder="Search by type, location, or report number..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm text-slate-300 placeholder-slate-500 focus:outline-none"
            />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field w-auto text-sm py-2">
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
          <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)} className="input-field w-auto text-sm py-2">
            <option value="">All Severities</option>
            {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <SkeletonTable rows={6} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={FileWarning} title="No incidents found" description="No incidents match your current filters." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  {['Report #', 'Type', 'Location', 'Severity', 'Status', 'Time', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filtered.map(inc => (
                  <tr key={inc.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-indigo-400 text-xs">{inc.reportNumber}</td>
                    <td className="px-4 py-3">
                      <p className="text-slate-200 font-medium capitalize">{inc.type.replace(/_/g, ' ')}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-400 max-w-[200px] truncate">{inc.location}</td>
                    <td className="px-4 py-3"><SeverityBadge severity={inc.severity} /></td>
                    <td className="px-4 py-3"><StatusBadge status={inc.status} /></td>
                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                      <Clock size={10} className="inline mr-1" />{new Date(inc.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => navigate(`/incidents/${inc.id}`)} className="btn-ghost p-1.5 text-xs gap-1">
                        <Eye size={14} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
