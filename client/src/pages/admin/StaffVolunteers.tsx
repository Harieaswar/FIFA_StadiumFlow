import React, { useEffect, useState } from 'react';
import { Users2, Plus, Loader2, AlertCircle, CheckCircle, Bot, X } from 'lucide-react';
import api from '../../services/api';
import { Task } from '../../types';
import { SkeletonTable } from '../../components/ui/SkeletonCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import clsx from 'clsx';

interface AITaskPreview { title: string; priority: string; suggestedPersonnel: string; instructions: string; estimatedDuration: number; zone: string; isDemo?: boolean; }

export default function StaffVolunteers() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [nlInput, setNlInput] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiPreview, setAiPreview] = useState<AITaskPreview | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api.get<Task[]>('/tasks').then(res => { if (res.success) setTasks(res.data); }).finally(() => setLoading(false));
  }, []);

  const generateTask = async () => {
    if (!nlInput.trim()) return;
    setAiGenerating(true);
    setAiPreview(null);
    try {
      const res = await api.post<AITaskPreview>('/ai/generate-task', { description: nlInput });
      if (res.success) setAiPreview(res.data);
    } catch { }
    finally { setAiGenerating(false); }
  };

  const assignTask = async () => {
    if (!aiPreview) return;
    setAssigning(true);
    try {
      const deadline = new Date(Date.now() + aiPreview.estimatedDuration * 60000).toISOString();
      const res = await api.post<Task>('/tasks', { title: aiPreview.title, description: aiPreview.instructions, priority: aiPreview.priority, zone: aiPreview.zone, deadline, estimatedDuration: aiPreview.estimatedDuration });
      if (res.success) {
        setTasks(prev => [res.data, ...prev]);
        setAiPreview(null);
        setNlInput('');
        setSuccess('Task created and assigned successfully!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } finally { setAssigning(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="section-header">Staff & Volunteers</h1>
        <p className="section-subheader">Task management and personnel coordination</p>
      </div>

      {success && <div className="p-3 bg-emerald-900/30 border border-emerald-800/50 rounded-xl flex items-center gap-2" role="status"><CheckCircle size={16} className="text-emerald-400" /><p className="text-sm text-emerald-300">{success}</p></div>}

      {/* AI Task Generator */}
      <div className="card p-5">
        <h2 className="text-base font-semibold text-slate-200 mb-1 flex items-center gap-2">
          <Bot size={18} className="text-indigo-400" /> AI Task Generator
        </h2>
        <p className="text-xs text-slate-500 mb-4">Describe an operational need and AI will generate a structured task.</p>
        <div className="flex gap-3">
          <textarea
            value={nlInput}
            onChange={e => setNlInput(e.target.value)}
            className="input-field flex-1 resize-none min-h-[60px]"
            placeholder='e.g. "Gate 3 is crowded and visitors need to be redirected"'
            aria-label="Describe operational need"
          />
          <button onClick={generateTask} disabled={!nlInput.trim() || aiGenerating} className="btn-primary flex-shrink-0">
            {aiGenerating ? <Loader2 size={16} className="animate-spin" /> : <Bot size={16} />}
            {aiGenerating ? 'Generating...' : 'Generate'}
          </button>
        </div>

        {aiPreview && (
          <div className="mt-4 p-4 bg-indigo-950/30 border border-indigo-800/50 rounded-xl">
            {aiPreview.isDemo && <p className="text-xs text-amber-400 mb-2">Demo AI response — connect Gemini for live generation</p>}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div><p className="text-xs text-slate-500">Title</p><p className="text-sm font-medium text-slate-200">{aiPreview.title}</p></div>
              <div><p className="text-xs text-slate-500">Priority</p><p className={clsx('text-sm font-semibold capitalize', aiPreview.priority === 'high' ? 'text-red-400' : aiPreview.priority === 'critical' ? 'text-red-500' : 'text-amber-400')}>{aiPreview.priority}</p></div>
              <div><p className="text-xs text-slate-500">Zone</p><p className="text-sm text-slate-300">{aiPreview.zone}</p></div>
              <div><p className="text-xs text-slate-500">Duration</p><p className="text-sm text-slate-300">{aiPreview.estimatedDuration} minutes</p></div>
            </div>
            <p className="text-xs text-slate-500 mb-1">Personnel</p>
            <p className="text-sm text-slate-300 mb-3">{aiPreview.suggestedPersonnel}</p>
            <p className="text-xs text-slate-500 mb-1">Instructions</p>
            <p className="text-sm text-slate-300 mb-4">{aiPreview.instructions}</p>
            <div className="flex gap-2">
              <button onClick={assignTask} disabled={assigning} className="btn-primary">{assigning ? 'Creating...' : '✓ Create Task'}</button>
              <button onClick={() => setAiPreview(null)} className="btn-ghost"><X size={14} /> Dismiss</button>
            </div>
          </div>
        )}
      </div>

      {/* Task List */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-200">All Tasks</h2>
          <span className="badge badge-info">{tasks.length} tasks</span>
        </div>
        {loading ? <SkeletonTable rows={5} /> : tasks.length === 0 ? (
          <EmptyState icon={Users2} title="No tasks" description="Create tasks using the AI generator above." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-800">{['Title', 'Zone', 'Priority', 'Status', 'Deadline'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-slate-800/50">
                {tasks.map(t => (
                  <tr key={t.id} className="hover:bg-slate-800/30">
                    <td className="px-4 py-3"><p className="text-slate-200 font-medium">{t.title}</p><p className="text-xs text-slate-500 truncate max-w-[200px]">{t.description}</p></td>
                    <td className="px-4 py-3 text-slate-400">{t.zone}</td>
                    <td className="px-4 py-3"><span className={clsx('badge', t.priority === 'critical' ? 'badge-critical' : t.priority === 'high' ? 'badge-high' : t.priority === 'medium' ? 'badge-medium' : 'badge-low')}>{t.priority}</span></td>
                    <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                    <td className="px-4 py-3 text-xs text-slate-400">{new Date(t.deadline).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
