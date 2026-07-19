import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function EmergencyButton() {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-br from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-full shadow-lg hover:shadow-red-500/30 transition-all duration-200 flex items-center justify-center active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500"
        aria-label="Emergency - Report incident"
        title="Emergency Support"
      >
        <AlertTriangle size={22} />
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="emergency-title">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowConfirm(false)} />
          <div className="relative w-full max-w-sm bg-slate-900 border border-red-900/50 rounded-2xl p-6 shadow-xl">
            <button onClick={() => setShowConfirm(false)} className="absolute top-4 right-4 btn-ghost p-1" aria-label="Close">
              <X size={18} />
            </button>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-400" />
              </div>
              <h2 id="emergency-title" className="text-lg font-bold text-red-300">Emergency Support</h2>
            </div>
            <p className="text-sm text-slate-400 mb-4">
              For <strong className="text-red-300">life-threatening emergencies</strong>, call{' '}
              <strong className="text-red-400 text-lg">911</strong> immediately.
            </p>
            <p className="text-sm text-slate-400 mb-5">
              To report a non-life-threatening incident to stadium operations, use the incident report form.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => { setShowConfirm(false); navigate('/emergency'); }}
                className="btn-danger w-full"
              >
                🚨 Open Incident Report
              </button>
              <button onClick={() => setShowConfirm(false)} className="btn-ghost w-full text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
