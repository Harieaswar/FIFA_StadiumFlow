import React, { useEffect, useState } from 'react';
import { Megaphone, Plus, Loader2, AlertCircle, Bot, CheckCircle, X, Eye } from 'lucide-react';
import api from '../../services/api';
import { Announcement } from '../../types';
import { SkeletonCard } from '../../components/ui/SkeletonCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import clsx from 'clsx';

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [preview, setPreview] = useState<Announcement | null>(null);
  const [form, setForm] = useState({ purpose: '', location: '', tone: 'calm', urgency: 'medium', languages: ['hindi', 'spanish', 'french'] });
  const [generated, setGenerated] = useState<any | null>(null);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api.get<Announcement[]>('/announcements').then(res => { if (res.success) setAnnouncements(res.data); }).finally(() => setLoading(false));
  }, []);

  const generate = async () => {
    if (!form.purpose.trim()) return;
    setGenerating(true);
    setGenerated(null);
    try {
      const res = await api.post<any>('/ai/generate-announcement', { ...form });
      if (res.success) setGenerated(res.data);
    } finally { setGenerating(false); }
  };

  const publish = async () => {
    if (!generated) return;
    try {
      const res = await api.post<Announcement>('/announcements', {
        purpose: form.purpose, location: form.location, tone: form.tone, urgency: form.urgency,
        languages: form.languages, englishText: generated.english || '',
        translations: generated.translations || {},
      });
      if (res.success) {
        setAnnouncements(prev => [res.data, ...prev]);
        setShowCreate(false);
        setGenerated(null);
        setForm({ purpose: '', location: '', tone: 'calm', urgency: 'medium', languages: ['hindi', 'spanish', 'french'] });
        setSuccess('Announcement created for review');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch { }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="section-header">Announcements</h1><p className="section-subheader">AI-generated multilingual stadium announcements</p></div>
        <button onClick={() => setShowCreate(true)} className="btn-primary gap-2"><Plus size={16} />New Announcement</button>
      </div>

      {success && <div className="p-3 bg-emerald-900/30 border border-emerald-800/50 rounded-xl flex items-center gap-2" role="status"><CheckCircle size={16} className="text-emerald-400" /><p className="text-sm text-emerald-300">{success}</p></div>}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="ann-title">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowCreate(false)} />
          <div className="relative w-full max-w-2xl card p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 id="ann-title" className="text-lg font-bold text-slate-100">Create Announcement</h2>
              <button onClick={() => setShowCreate(false)} className="btn-ghost p-1"><X size={18} /></button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="col-span-2"><label className="input-label">Purpose / Message</label><input value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} className="input-field" placeholder="e.g. Gate change notification" /></div>
              <div><label className="input-label">Location</label><input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="input-field" placeholder="e.g. Gate A" /></div>
              <div><label className="input-label">Tone</label>
                <select value={form.tone} onChange={e => setForm(f => ({ ...f, tone: e.target.value }))} className="input-field">
                  {['calm', 'urgent', 'informational', 'warning'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div><label className="input-label">Urgency</label>
                <select value={form.urgency} onChange={e => setForm(f => ({ ...f, urgency: e.target.value }))} className="input-field">
                  {['low', 'medium', 'high'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <button onClick={generate} disabled={!form.purpose.trim() || generating} className="btn-primary mb-4">
              {generating ? <><Loader2 size={16} className="animate-spin" />Generating...</> : <><Bot size={16} />Generate with AI</>}
            </button>

            {generated && (
              <div className="space-y-3">
                <div className="p-3 bg-slate-800/60 rounded-xl">
                  <p className="text-xs text-slate-500 mb-1">English</p>
                  <p className="text-sm text-slate-200">{generated.english}</p>
                </div>
                <div className="p-3 bg-slate-800/60 rounded-xl">
                  <p className="text-xs text-slate-500 mb-1">Display Board</p>
                  <p className="text-sm font-mono text-amber-300">{generated.displayBoard}</p>
                </div>
                {generated.translations && Object.entries(generated.translations).slice(0, 3).map(([lang, text]) => (
                  <div key={lang} className="p-3 bg-slate-800/60 rounded-xl">
                    <p className="text-xs text-slate-500 mb-1 capitalize">{lang}</p>
                    <p className="text-sm text-slate-300">{text as React.ReactNode}</p>
                  </div>
                ))}
                <button onClick={publish} className="btn-primary w-full">Submit for Review</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">{[0,1,2].map(i => <SkeletonCard key={i} height="h-28" />)}</div>
      ) : announcements.length === 0 ? (
        <EmptyState icon={Megaphone} title="No announcements" description="Create multilingual announcements using the AI generator." action={{ label: 'Create Announcement', onClick: () => setShowCreate(true) }} />
      ) : (
        <div className="space-y-3">
          {announcements.map(ann => (
            <div key={ann.id} className="card p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2"><StatusBadge status={ann.status} /><span className="text-xs text-slate-500">{ann.location}</span></div>
                  <p className="text-sm font-medium text-slate-200 mb-1">{ann.purpose}</p>
                  <p className="text-xs text-slate-400 truncate">{ann.englishText}</p>
                  <p className="text-xs text-slate-600 mt-1 font-mono">{ann.displayBoardVersion}</p>
                </div>
                <div className="flex gap-1">
                  {ann.status === 'pending_review' && (
                    <>
                      <button onClick={async () => { await api.put(`/announcements/${ann.id}/status`, { status: 'approved' }); setAnnouncements(prev => prev.map(a => a.id === ann.id ? { ...a, status: 'approved' } : a)); }} className="btn-secondary text-xs py-1">Approve</button>
                      <button onClick={async () => { await api.put(`/announcements/${ann.id}/status`, { status: 'rejected' }); setAnnouncements(prev => prev.map(a => a.id === ann.id ? { ...a, status: 'rejected' } : a)); }} className="btn-ghost text-xs py-1 text-red-400">Reject</button>
                    </>
                  )}
                  <button onClick={() => setPreview(ann)} className="btn-ghost p-1.5"><Eye size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview modal */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/70" onClick={() => setPreview(null)} />
          <div className="relative w-full max-w-lg card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Announcement Preview</h2>
              <button onClick={() => setPreview(null)} className="btn-ghost p-1"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div><p className="text-xs text-slate-500">English</p><p className="text-sm text-slate-200">{preview.englishText}</p></div>
              <div><p className="text-xs text-slate-500">Display Board</p><p className="text-sm font-mono text-amber-300">{preview.displayBoardVersion}</p></div>
              <div><p className="text-xs text-slate-500">Audio</p><p className="text-sm text-slate-300">{preview.audioVersion}</p></div>
              {Object.entries(preview.translations).map(([lang, text]) => (
                <div key={lang}><p className="text-xs text-slate-500 capitalize">{lang}</p><p className="text-sm text-slate-300">{text as React.ReactNode}</p></div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
