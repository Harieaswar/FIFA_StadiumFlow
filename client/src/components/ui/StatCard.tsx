import React from 'react';
import { LucideIcon } from 'lucide-react';
import clsx from 'clsx';
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  color?: 'blue' | 'teal' | 'amber' | 'red' | 'purple' | 'emerald';
}
const colorMap = {
  blue: 'from-blue-500/20 to-indigo-500/10 border-blue-500/20 text-blue-400',
  teal: 'from-teal-500/20 to-cyan-500/10 border-teal-500/20 text-teal-400',
  amber: 'from-amber-500/20 to-orange-500/10 border-amber-500/20 text-amber-400',
  red: 'from-red-500/20 to-rose-500/10 border-red-500/20 text-red-400',
  purple: 'from-purple-500/20 to-indigo-500/10 border-purple-500/20 text-purple-400',
  emerald: 'from-emerald-500/20 to-green-500/10 border-emerald-500/20 text-emerald-400',
};
export default function StatCard({ title, value, subtitle, icon: Icon, trend, color = 'blue' }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className={clsx('card p-5 bg-gradient-to-br border', c.split(' ').slice(0, 2).join(' '), c.split(' ')[2])}>
      <div className="flex items-start justify-between mb-3">
        <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br', c.split(' ').slice(0, 2).join(' '))}>
          <Icon size={20} className={c.split(' ')[3]} />
        </div>
        {trend && (
          <span className={clsx('text-xs font-medium', trend.value >= 0 ? 'text-emerald-400' : 'text-red-400')}>
            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
          </span>
        )}
      </div>
      <p className="text-2xl font-display font-bold text-slate-100 mb-0.5">{value}</p>
      <p className="text-sm font-medium text-slate-300">{title}</p>
      {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
    </div>
  );
}
