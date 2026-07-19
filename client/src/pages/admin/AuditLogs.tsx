import React, { useEffect, useState } from 'react';
import { ClipboardList, Search, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import { AuditLog } from '../../types';
import { SkeletonTable } from '../../components/ui/SkeletonCard';
import EmptyState from '../../components/ui/EmptyState';

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);

  const fetch = async () => {
    setLoading(true);
    api.get<{ logs: AuditLog[]; total: number }>('/audit-logs').then(res => {
      if (res.success) { setLogs(res.data.logs); setTotal(res.data.total); }
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const filtered = logs.filter(l =>
    search === '' || l.action.toLowerCase().includes(search.toLowerCase()) || l.performedBy.toLowerCase().includes(search.toLowerCase())
  );

  const ACTION_COLORS: Record<string, string> = {
    USER_LOGIN: 'text-emerald-400', USER_SIGNUP: 'text-blue-400', USER_LOGOUT: 'text-slate-400',
    INCIDENT_CREATED: 'text-red-400', INCIDENT_UPDATED: 'text-orange-400',
    TASK_CREATED: 'text-indigo-400', TASK_UPDATED: 'text-indigo-300', TASK_DELETED: 'text-red-400',
    ROLE_UPDATED: 'text-purple-400', USER_DELETED: 'text-red-500',
    ANNOUNCEMENT_CREATED: 'text-teal-400', ANNOUNCEMENT_STATUS_CHANGED: 'text-teal-300',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-header">Audit Logs</h1>
          <p className="section-subheader">{total} total events logged</p>
        </div>
        <button onClick={fetch} className="btn-secondary gap-2 text-sm"><RefreshCw size={14} />Refresh</button>
      </div>

      <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-xl border border-slate-700 max-w-md">
        <Search size={16} className="text-slate-500" />
        <input type="search" placeholder="Search actions or users..." value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-sm text-slate-300 placeholder-slate-500 focus:outline-none" />
      </div>

      {loading ? <SkeletonTable rows={8} /> : filtered.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No audit logs" description="Audit logs will appear here as actions are performed." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-800">{['Action', 'Performed By', 'Target', 'Details', 'Timestamp'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-slate-800/50">
                {filtered.map(log => (
                  <tr key={log.id} className="hover:bg-slate-800/30">
                    <td className="px-4 py-3">
                      <span className={`text-xs font-mono font-semibold ${ACTION_COLORS[log.action] || 'text-slate-400'}`}>{log.action}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs font-mono truncate max-w-[120px]">{log.performedBy}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs font-mono">{log.targetId || '-'}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{JSON.stringify(log.details).slice(0, 60)}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
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
