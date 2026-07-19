import React from 'react';
import clsx from 'clsx';
import { AlertCircle, AlertTriangle, CheckCircle, Clock, Info } from 'lucide-react';

type Severity = 'low' | 'medium' | 'high' | 'critical';
type Status = 'submitted' | 'acknowledged' | 'staff_assigned' | 'in_progress' | 'resolved' | 'closed' | 'on_time' | 'delayed' | 'suspended' | 'available' | 'full' | 'not_started' | 'assigned' | 'blocked' | 'completed' | 'draft' | 'pending_review' | 'approved' | 'published' | 'rejected';

export function SeverityBadge({ severity }: { severity: Severity }) {
  const config: Record<Severity, { label: string; cls: string; icon: React.ElementType }> = {
    critical: { label: 'Critical', cls: 'badge-critical', icon: AlertCircle },
    high: { label: 'High', cls: 'badge-high', icon: AlertTriangle },
    medium: { label: 'Medium', cls: 'badge-medium', icon: Info },
    low: { label: 'Low', cls: 'badge-low', icon: CheckCircle },
  };
  const { label, cls, icon: Icon } = config[severity];
  return (
    <span className={clsx('badge', cls)} aria-label={`Severity: ${severity}`}>
      <Icon size={10} />{label}
    </span>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  const map: Record<string, string> = {
    submitted: 'badge-info', acknowledged: 'badge-medium', staff_assigned: 'badge-medium',
    in_progress: 'badge-high', resolved: 'badge-low', closed: 'bg-slate-700 text-slate-400',
    on_time: 'badge-low', delayed: 'badge-high', suspended: 'badge-critical', available: 'badge-low',
    full: 'badge-critical', not_started: 'badge-info', assigned: 'badge-medium', blocked: 'badge-critical',
    completed: 'badge-low', draft: 'badge-info', pending_review: 'badge-medium', approved: 'badge-low',
    published: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30', rejected: 'badge-critical',
  };
  return (
    <span className={clsx('badge', map[status] || 'badge-info')}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

export function CrowdLevelBadge({ level }: { level: string }) {
  const map: Record<string, { cls: string; icon: string }> = {
    low: { cls: 'badge-low', icon: '🟢' },
    moderate: { cls: 'badge-medium', icon: '🟡' },
    high: { cls: 'badge-high', icon: '🟠' },
    critical: { cls: 'badge-critical', icon: '🔴' },
  };
  const config = map[level] || map.low;
  return (
    <span className={clsx('badge', config.cls)} aria-label={`Crowd level: ${level}`}>
      <span aria-hidden="true">{config.icon}</span>
      {level.charAt(0).toUpperCase() + level.slice(1)}
    </span>
  );
}
