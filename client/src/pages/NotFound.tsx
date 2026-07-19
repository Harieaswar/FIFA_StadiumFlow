import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, ArrowLeft } from 'lucide-react';
export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="text-8xl font-display font-bold gradient-text mb-4">404</div>
      <h1 className="text-2xl font-bold text-slate-200 mb-2">Page not found</h1>
      <p className="text-slate-400 mb-8 max-w-xs">The page you're looking for doesn't exist or you don't have permission to view it.</p>
      <Link to="/dashboard" className="btn-primary">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>
    </div>
  );
}
