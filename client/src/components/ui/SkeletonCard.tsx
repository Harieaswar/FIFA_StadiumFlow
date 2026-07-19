import React from 'react';
export function SkeletonCard({ lines = 3, height = 'h-32' }: { lines?: number; height?: string }) {
  return (
    <div className="card p-5 space-y-3 overflow-hidden">
      <div className={`skeleton h-4 w-2/3 rounded`} />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`skeleton h-3 rounded ${height}`} style={{ width: `${100 - i * 15}%` }} />
      ))}
    </div>
  );
}
export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="card overflow-hidden">
      <div className="p-4 border-b border-slate-800">
        <div className="skeleton h-5 w-1/4 rounded" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 border-b border-slate-800/50">
          <div className="skeleton h-4 w-24 rounded" />
          <div className="skeleton h-4 flex-1 rounded" />
          <div className="skeleton h-4 w-16 rounded" />
          <div className="skeleton h-4 w-20 rounded" />
        </div>
      ))}
    </div>
  );
}
