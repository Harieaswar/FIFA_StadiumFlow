import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, User, AlertCircle, Loader2, MessageSquare, UserCheck } from 'lucide-react';
import api from '../services/api';
import { Incident } from '../types';
import { SeverityBadge, StatusBadge } from '../components/ui/StatusBadge';
import ErrorState from '../components/ui/ErrorState';
import { useAuth } from '../contexts/AuthContext';

const STATUS_FLOW = ['submitted', 'acknowledged', 'staff_assigned', 'in_progress', 'resolved', 'closed'];

export default function IncidentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    api.get<Incident>(`/incidents/${id}`).then(res => {
      if (res.success) { setIncident(res.data); setNewStatus(res.data.status); }
      else setError(res.message);
    }).catch(() => setError('Failed to load incident')).finally(() => setLoading(false));
  }, [id]);

  const update = async () => {
    if (!incident) return;
    setUpdating(true);
    try {
      const res = await api.put<Incident>(`/incidents/${id}`, { status: newStatus, note: note || undefined });
      if (res.success) { setIncident(res.data); setNote(''); }
    } catch { setError('Update failed'); }
    finally { setUpdating(false); }
  };

  if (loading) return <div className="card p-8 flex justify-center"><Loader2 size={24} className="text-indigo-400 animate-spin" /></div>;
  if (error) return <ErrorState message={error} onRetry={() => navigate('/incidents')} />;
  if (!incident) return null;

  const canEdit = user?.role === 'admin' || user?.role === 'staff';
  const currentStatusIdx = STATUS_FLOW.indexOf(incident.status);

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <button onClick={() => navigate('/incidents')} className="flex items-center gap-1 text-slate-500 hover:text-slate-300 text-sm mb-4">
        <ArrowLeft size={14} /> Back to Incidents
      </button>

      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="section-header capitalize">{incident.type.replace(/_/g, ' ')}</h1>
          <p className="font-mono text-indigo-400 text-sm">{incident.reportNumber}</p>
        </div>
        <div className="flex gap-2">
          <SeverityBadge severity={incident.severity} />
          <StatusBadge status={incident.status} />
        </div>
      </div>

      {/* Status Timeline */}
      <div className="card p-5 mb-4">
        <h2 className="text-sm font-semibold text-slate-300 mb-4">Status Timeline</h2>
        <div className="flex items-center gap-0">
          {STATUS_FLOW.map((s, i) => (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs ${i <= currentStatusIdx ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-600'}`}>
                  {i < currentStatusIdx ? '✓' : i === currentStatusIdx ? '●' : ''}
                </div>
                <p className={`text-xs mt-1 whitespace-nowrap capitalize ${i <= currentStatusIdx ? 'text-indigo-400' : 'text-slate-600'}`}>
                  {s.replace(/_/g, ' ')}
                </p>
              </div>
              {i < STATUS_FLOW.length - 1 && (
                <div className={`flex-1 h-0.5 mb-5 ${i < currentStatusIdx ? 'bg-indigo-600' : 'bg-slate-800'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="card p-4">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Details</h2>
          <dl className="space-y-2 text-sm">
            <div><dt className="text-slate-500">Location</dt><dd className="text-slate-200">{incident.location}</dd></div>
            <div><dt className="text-slate-500">Description</dt><dd className="text-slate-200">{incident.description}</dd></div>
            <div><dt className="text-slate-500">Reported</dt><dd className="text-slate-200">{new Date(incident.createdAt).toLocaleString()}</dd></div>
            {incident.assignedTo && <div><dt className="text-slate-500">Assigned to</dt><dd className="text-slate-200 flex items-center gap-1"><UserCheck size={12} />{incident.assignedTo}</dd></div>}
          </dl>
        </div>
        <div className="card p-4">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Notes ({incident.notes.length})</h2>
          {incident.notes.length === 0 ? (
            <p className="text-slate-600 text-sm">No notes yet.</p>
          ) : (
            <ul className="space-y-2">
              {incident.notes.map((note, i) => (
                <li key={i} className="text-xs text-slate-400 bg-slate-800/50 rounded-lg p-2">{note}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Update panel - staff/admin only */}
      {canEdit && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-200 mb-4">Update Incident</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="input-label">Update Status</label>
              <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className="input-field">
                {STATUS_FLOW.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="input-label">Add Note</label>
            <textarea value={note} onChange={e => setNote(e.target.value)} className="input-field min-h-[80px] resize-none" placeholder="Add an internal note..." />
          </div>
          <button onClick={update} disabled={updating} className="btn-primary">
            {updating ? <><Loader2 size={16} className="animate-spin" />Updating...</> : 'Update Incident'}
          </button>
        </div>
      )}
    </div>
  );
}
