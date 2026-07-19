import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, X, Loader2, CheckCircle, AlertCircle, Phone } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../services/api';
import clsx from 'clsx';

const INCIDENT_TYPES = [
  { value: 'medical_emergency', label: '🏥 Medical Emergency', desc: 'Injury, illness, unconscious person' },
  { value: 'fire_smoke', label: '🔥 Fire or Smoke', desc: 'Fire, smoke, or strong smell' },
  { value: 'missing_person', label: '🔍 Missing Person', desc: 'Adult reported missing' },
  { value: 'security_threat', label: '🔒 Security Threat', desc: 'Suspicious behavior or unattended bag' },
  { value: 'crowd_crush_risk', label: '⚠️ Crowd Crush Risk', desc: 'Dangerously dense crowd' },
  { value: 'lost_child', label: '👶 Lost Child', desc: 'Child separated from family' },
  { value: 'accessibility_assistance', label: '♿ Accessibility Help', desc: 'Need mobility or sensory assistance' },
  { value: 'other', label: '📋 Other Incident', desc: 'Other safety concern' },
];

const schema = z.object({
  type: z.enum(['medical_emergency', 'fire_smoke', 'missing_person', 'security_threat', 'crowd_crush_risk', 'lost_child', 'accessibility_assistance', 'other']),
  location: z.string().min(2, 'Please describe your location').max(200),
  description: z.string().min(10, 'Please provide more details').max(1000),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  immediateAssistanceNeeded: z.boolean().default(false),
});

type FormData = z.infer<typeof schema>;

export default function EmergencySupport() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'type' | 'details' | 'success'>('type');
  const [selectedType, setSelectedType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [reportNumber, setReportNumber] = useState('');

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const selectType = (type: string) => {
    setSelectedType(type);
    setValue('type', type as FormData['type']);
    setStep('details');
  };

  const onSubmit = async (data: FormData) => {
    setError('');
    setIsLoading(true);
    try {
      const res = await api.post<{ reportNumber: string }>('/incidents', data);
      if (res.success) {
        setReportNumber(res.data.reportNumber);
        setStep('success');
      } else {
        setError(res.message);
      }
    } catch {
      setError('Failed to submit report. Please find a stadium marshal immediately.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="section-header text-red-400">🚨 Emergency Support</h1>
        <div className="p-3 bg-red-950/30 border border-red-900/50 rounded-xl">
          <p className="text-sm text-red-300 font-medium">
            ⚠️ For life-threatening emergencies, call <strong>911</strong> immediately and alert the nearest stadium marshal.
          </p>
          <p className="text-xs text-red-400 mt-1">
            This app is in DEMO MODE — reports are simulated and do NOT contact real emergency services.
          </p>
        </div>
      </div>

      {step === 'type' && (
        <div className="card p-6">
          <h2 className="text-base font-semibold text-slate-200 mb-4">What type of incident are you reporting?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {INCIDENT_TYPES.map(t => (
              <button
                key={t.value}
                onClick={() => selectType(t.value)}
                className="text-left p-4 bg-slate-800/60 border border-slate-700 hover:border-indigo-500/50 hover:bg-slate-800 rounded-xl transition-all duration-200 group"
              >
                <p className="font-medium text-slate-200 group-hover:text-indigo-300">{t.label}</p>
                <p className="text-xs text-slate-500 mt-1">{t.desc}</p>
              </button>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-950/30 border border-blue-900/50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Phone size={16} className="text-blue-400" />
              <p className="text-sm font-semibold text-blue-300">Emergency Contacts</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><p className="text-slate-400">US Emergency</p><p className="text-slate-200 font-mono">911</p></div>
              <div><p className="text-slate-400">Stadium Security</p><p className="text-slate-200 font-mono">+1 (555) 0100</p></div>
              <div><p className="text-slate-400">Medical Team</p><p className="text-slate-200 font-mono">+1 (555) 0101</p></div>
              <div><p className="text-slate-400">Operations</p><p className="text-slate-200 font-mono">+1 (555) 0102</p></div>
            </div>
          </div>
        </div>
      )}

      {step === 'details' && (
        <div className="card p-6">
          <button onClick={() => setStep('type')} className="btn-ghost text-sm mb-4">← Back</button>
          <h2 className="text-base font-semibold text-slate-200 mb-4">
            {INCIDENT_TYPES.find(t => t.value === selectedType)?.label}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-800/50 rounded-xl flex items-start gap-2" role="alert">
              <AlertCircle size={16} className="text-red-400 mt-0.5" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input type="hidden" {...register('type')} />

            <div>
              <label className="input-label" htmlFor="location">Your Current Location *</label>
              <input
                id="location"
                {...register('location')}
                className="input-field"
                placeholder="e.g. Gate A, Section B Row 12, North Concourse near food court"
              />
              {errors.location && <p className="input-error"><AlertCircle size={12} />{errors.location.message}</p>}
            </div>

            <div>
              <label className="input-label" htmlFor="description">Description *</label>
              <textarea
                id="description"
                {...register('description')}
                className="input-field min-h-[100px] resize-none"
                placeholder="Describe what is happening. Include any relevant details."
              />
              {errors.description && <p className="input-error"><AlertCircle size={12} />{errors.description.message}</p>}
            </div>

            <div>
              <label className="input-label" htmlFor="severity">Severity</label>
              <select id="severity" {...register('severity')} className="input-field">
                <option value="low">Low — Not urgent</option>
                <option value="medium">Medium — Needs attention soon</option>
                <option value="high">High — Urgent</option>
                <option value="critical">Critical — Immediate danger</option>
              </select>
            </div>

            <label className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl cursor-pointer">
              <input type="checkbox" {...register('immediateAssistanceNeeded')} className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-red-500" />
              <div>
                <p className="text-sm font-medium text-slate-200">Immediate assistance needed</p>
                <p className="text-xs text-slate-500">Check this if someone requires immediate help on the scene</p>
              </div>
            </label>

            <button type="submit" disabled={isLoading} className="btn-danger w-full">
              {isLoading ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : '🚨 Submit Incident Report'}
            </button>
          </form>
        </div>
      )}

      {step === 'success' && (
        <div className="card p-8 text-center">
          <div className="w-16 h-16 bg-emerald-900/20 border border-emerald-700/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-100 mb-2">Report Submitted</h2>
          <p className="text-slate-400 mb-4">Your incident report has been received by the operations team.</p>
          <div className="bg-slate-800/60 rounded-xl p-4 mb-6 inline-block">
            <p className="text-xs text-slate-500 mb-1">Report Number</p>
            <p className="text-2xl font-mono font-bold text-indigo-400">{reportNumber}</p>
          </div>

          <div className="p-4 bg-blue-950/30 border border-blue-900/40 rounded-xl mb-6 text-left">
            <p className="text-sm font-semibold text-blue-300 mb-2">What happens next:</p>
            <ol className="space-y-1 text-xs text-slate-400">
              <li>1. Operations team has been notified</li>
              <li>2. A staff member will be assigned to your report</li>
              <li>3. You'll see status updates in the Incident Reports page</li>
              <li>4. Save your report number for reference</li>
            </ol>
          </div>

          <div className="p-3 bg-red-950/30 border border-red-900/40 rounded-xl mb-6">
            <p className="text-xs text-red-300">Remember: For immediate life-threatening danger, always call <strong>911</strong></p>
          </div>

          <div className="flex gap-3">
            <button onClick={() => navigate('/incidents')} className="btn-secondary flex-1">View My Reports</button>
            <button onClick={() => { setStep('type'); setSelectedType(''); setError(''); }} className="btn-primary flex-1">Report Another</button>
          </div>
        </div>
      )}
    </div>
  );
}
