import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
interface ErrorStateProps { message?: string; onRetry?: () => void; }
export default function ErrorState({ message = 'Something went wrong.', onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center" role="alert">
      <div className="w-16 h-16 bg-red-900/20 border border-red-900/40 rounded-2xl flex items-center justify-center mb-4">
        <AlertCircle size={28} className="text-red-400" />
      </div>
      <h3 className="text-lg font-semibold text-red-300 mb-2">Error</h3>
      <p className="text-slate-400 text-sm max-w-xs">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary mt-6 gap-2">
          <RefreshCw size={16} /> Retry
        </button>
      )}
    </div>
  );
}
