import React from 'react';
import { Building2 } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div
      className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-50"
      role="status"
      aria-label="Loading StadiumFlow AI"
    >
      <div className="relative mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-teal-400 rounded-2xl flex items-center justify-center animate-bounce-gentle">
          <Building2 size={28} className="text-white" />
        </div>
        <div className="absolute -inset-1 bg-gradient-to-br from-indigo-500/20 to-teal-400/20 rounded-3xl blur animate-pulse" />
      </div>
      <h1 className="text-xl font-display font-bold gradient-text mb-2">StadiumFlow AI</h1>
      <p className="text-slate-500 text-sm">Loading your experience...</p>
      <div className="mt-6 flex gap-1">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  );
}
