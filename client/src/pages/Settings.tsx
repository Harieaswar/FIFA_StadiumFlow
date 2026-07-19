import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Lock, Bell, Trash2, AlertCircle, CheckCircle, Loader2, Shield, Bot, Eye, EyeOff, KeyRound } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const profileSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email(),
});

const pwSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(10).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/).regex(/[^A-Za-z0-9]/),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

type ProfileData = z.infer<typeof profileSchema>;
type PwData = z.infer<typeof pwSchema>;

type TabId = 'profile' | 'security' | 'notifications' | 'privacy' | 'ai';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy', icon: Shield },
  { id: 'ai', label: 'AI & API', icon: Bot },
];

export default function Settings() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('sf_gemini_api_key') || '');
  const [apiKeyInput, setApiKeyInput] = useState(() => localStorage.getItem('sf_gemini_api_key') || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeySaved, setApiKeySaved] = useState(false);

  const profileForm = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { displayName: user?.displayName || '', email: user?.email || '' },
  });

  const pwForm = useForm<PwData>({ resolver: zodResolver(pwSchema) });

  const showMsg = (msg: string, isError = false) => {
    if (isError) setError(msg); else setSuccess(msg);
    setTimeout(() => { setSuccess(''); setError(''); }, 3000);
  };

  const onProfileSubmit = async (_data: ProfileData) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    setLoading(false);
    showMsg('Profile updated successfully');
  };

  const onPwSubmit = async (_data: PwData) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    setLoading(false);
    showMsg('Password changed successfully');
    pwForm.reset();
  };

  const saveApiKey = () => {
    const trimmed = apiKeyInput.trim();
    localStorage.setItem('sf_gemini_api_key', trimmed);
    setApiKey(trimmed);
    setApiKeySaved(true);
    showMsg(trimmed ? 'API key saved successfully' : 'API key cleared');
    setTimeout(() => setApiKeySaved(false), 3000);
  };

  const clearApiKey = () => {
    setApiKeyInput('');
    setApiKey('');
    localStorage.removeItem('sf_gemini_api_key');
    showMsg('API key removed');
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <h1 className="section-header">Settings</h1>
      <p className="section-subheader">Manage your account preferences</p>

      {success && <div className="mb-4 p-3 bg-emerald-900/30 border border-emerald-800/50 rounded-xl flex items-center gap-2" role="status"><CheckCircle size={16} className="text-emerald-400" /><p className="text-sm text-emerald-300">{success}</p></div>}
      {error && <div className="mb-4 p-3 bg-red-900/30 border border-red-800/50 rounded-xl flex items-center gap-2" role="alert"><AlertCircle size={16} className="text-red-400" /><p className="text-sm text-red-300">{error}</p></div>}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-900 p-1 rounded-xl border border-slate-800" role="tablist">
        {TABS.map(t => (
          <button
            key={t.id} role="tab" id={`tab-${t.id}`}
            aria-selected={activeTab === t.id}
            aria-controls={`panel-${t.id}`}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 px-3 rounded-lg transition-colors ${
              activeTab === t.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {activeTab === 'profile' && (
        <div className="card p-6" id="panel-profile" role="tabpanel" aria-labelledby="tab-profile">
          <h2 className="text-base font-semibold text-slate-200 mb-4">Profile Information</h2>
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
            <div>
              <label className="input-label">Display Name</label>
              <input {...profileForm.register('displayName')} className="input-field" />
              {profileForm.formState.errors.displayName && <p className="input-error">{profileForm.formState.errors.displayName.message}</p>}
            </div>
            <div>
              <label className="input-label">Email</label>
              <input {...profileForm.register('email')} type="email" className="input-field" readOnly />
              <p className="text-xs text-slate-500 mt-1">Email changes require re-verification</p>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-xl">
              <p className="text-xs text-slate-500">Role: <span className="text-indigo-400 font-medium capitalize">{user?.role}</span></p>
            </div>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? <><Loader2 size={16} className="animate-spin" />Saving...</> : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {/* Security tab */}
      {activeTab === 'security' && (
        <div className="space-y-4" id="panel-security" role="tabpanel" aria-labelledby="tab-security">
          <div className="card p-6">
            <h2 className="text-base font-semibold text-slate-200 mb-4">Change Password</h2>
            <form onSubmit={pwForm.handleSubmit(onPwSubmit)} className="space-y-4">
              {(['currentPassword', 'newPassword', 'confirmPassword'] as const).map(f => (
                <div key={f}>
                  <label className="input-label">{f === 'currentPassword' ? 'Current Password' : f === 'newPassword' ? 'New Password' : 'Confirm New Password'}</label>
                  <input type="password" {...pwForm.register(f)} className="input-field" />
                  {pwForm.formState.errors[f] && <p className="input-error">{pwForm.formState.errors[f]?.message}</p>}
                </div>
              ))}
              <button type="submit" disabled={loading} className="btn-primary">Change Password</button>
            </form>
          </div>

          <div className="card p-6">
            <h2 className="text-base font-semibold text-red-300 mb-2">Delete Account</h2>
            <p className="text-sm text-slate-400 mb-4">Permanently delete your account and all data. This action cannot be undone.</p>
            <button onClick={() => setShowDeleteConfirm(true)} className="btn-danger text-sm"><Trash2 size={14} />Delete Account</button>
          </div>
        </div>
      )}

      {/* Notifications tab */}
      {activeTab === 'notifications' && (
        <div className="card p-6" id="panel-notifications" role="tabpanel" aria-labelledby="tab-notifications">
          <h2 className="text-base font-semibold text-slate-200 mb-4">Notification Preferences</h2>
          <div className="space-y-3">
            {[['Crowd warnings', true],['Transport delays', true],['Emergency alerts', true],['Task assignments', true],['Incident updates', true],['Sustainability reminders', false]].map(([label, def]) => (
              <div key={label as string} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                <p className="text-sm text-slate-300">{label as string}</p>
                <input type="checkbox" defaultChecked={def as boolean} className="w-4 h-4 rounded text-indigo-500" aria-label={`${label} notifications`} />
              </div>
            ))}
          </div>
          <button className="btn-primary mt-4">Save Preferences</button>
        </div>
      )}

      {/* Privacy tab */}
      {activeTab === 'privacy' && (
        <div className="card p-6" id="panel-privacy" role="tabpanel" aria-labelledby="tab-privacy">
          <h2 className="text-base font-semibold text-slate-200 mb-4">Privacy Settings</h2>
          <div className="space-y-3 text-sm text-slate-400">
            <p>🔒 Your data is encrypted at rest and in transit.</p>
            <p>👁️ Location data is used only for navigation and is not shared with third parties.</p>
            <p>🤖 AI conversations are stored temporarily and used only to improve your stadium experience.</p>
            <p>🗑️ You can request deletion of your data at any time.</p>
          </div>
        </div>
      )}

      {/* AI & API tab */}
      {activeTab === 'ai' && (
        <div className="space-y-4" id="panel-ai" role="tabpanel" aria-labelledby="tab-ai">
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-teal-400 rounded-xl flex items-center justify-center">
                <KeyRound size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-200">Gemini API Key</h2>
                <p className="text-xs text-slate-500">Powers the FlowBot AI assistant</p>
              </div>
              {apiKey && (
                <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 bg-emerald-900/30 border border-emerald-700/40 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-emerald-400 font-medium">Key Active</span>
                </div>
              )}
              {!apiKey && (
                <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 bg-amber-900/30 border border-amber-700/40 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span className="text-xs text-amber-400 font-medium">Demo Mode</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="input-label" htmlFor="api-key-input">API Key</label>
                <div className="relative">
                  <input
                    id="api-key-input"
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKeyInput}
                    onChange={e => setApiKeyInput(e.target.value)}
                    className="input-field pr-10"
                    placeholder="AIza..."
                    aria-label="Gemini API Key"
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
                  >
                    {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={saveApiKey}
                  className="btn-primary flex-1"
                  id="save-api-key-btn"
                >
                  {apiKeySaved ? <><CheckCircle size={16} /> Saved!</> : <><KeyRound size={16} /> Save Key</>}
                </button>
                {apiKey && (
                  <button
                    onClick={clearApiKey}
                    className="btn-secondary px-4"
                    id="clear-api-key-btn"
                    aria-label="Clear API key"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <Bot size={16} className="text-indigo-400" />
              How to get your API key
            </h3>
            <ol className="space-y-2.5 text-sm text-slate-400">
              <li className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                <span>Visit <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2">Google AI Studio</a> and sign in with your Google account.</span>
              </li>
              <li className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                <span>Click <strong className="text-slate-300">"Create API Key"</strong> and copy it.</span>
              </li>
              <li className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                <span>Paste it above and click <strong className="text-slate-300">"Save Key"</strong>. FlowBot will use it for all future conversations.</span>
              </li>
            </ol>
            <div className="mt-4 p-3 bg-slate-800/50 rounded-xl flex items-start gap-2">
              <AlertCircle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-400">Your API key is stored only in your browser's local storage and is never sent to our servers.</p>
            </div>
          </div>
        </div>
      )}


      {/* Delete confirm dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="delete-title">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative card p-6 w-full max-w-md">
            <h2 id="delete-title" className="text-lg font-bold text-red-300 mb-2">Delete Account</h2>
            <p className="text-slate-400 text-sm mb-4">Type <strong className="text-slate-200">DELETE MY ACCOUNT</strong> to confirm:</p>
            <input value={deleteConfirmText} onChange={e => setDeleteConfirmText(e.target.value)} className="input-field mb-4" placeholder="DELETE MY ACCOUNT" />
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="btn-secondary flex-1">Cancel</button>
              <button disabled={deleteConfirmText !== 'DELETE MY ACCOUNT'} onClick={() => { logout(); }} className="btn-danger flex-1 disabled:opacity-40">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
