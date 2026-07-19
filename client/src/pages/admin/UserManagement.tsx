import React, { useEffect, useState } from 'react';
import { UserCog, Search, Shield, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { User, UserRole } from '../../types';
import { SkeletonTable } from '../../components/ui/SkeletonCard';
import clsx from 'clsx';

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<User[]>('/users').then(res => { if (res.success) setUsers(res.data); }).finally(() => setLoading(false));
  }, []);

  const updateRole = async (uid: string, role: UserRole) => {
    setUpdating(uid);
    try {
      const res = await api.put<User>(`/users/${uid}/role`, { role });
      if (res.success) setUsers(prev => prev.map(u => u.uid === uid ? { ...u, role } : u));
    } catch { setError('Failed to update role'); }
    finally { setUpdating(null); }
  };

  const filtered = users.filter(u => search === '' || u.displayName.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  const roleColors: Record<UserRole, string> = { admin: 'text-purple-400', staff: 'text-blue-400', volunteer: 'text-teal-400', fan: 'text-indigo-400' };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="section-header">User Management</h1>
        <p className="section-subheader">{users.length} registered users</p>
      </div>

      {error && <div className="p-3 bg-red-900/30 border border-red-800/50 rounded-xl flex items-center gap-2" role="alert"><AlertCircle size={16} className="text-red-400" /><p className="text-sm text-red-300">{error}</p></div>}

      <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-xl border border-slate-700 max-w-md">
        <Search size={16} className="text-slate-500" />
        <input type="search" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-sm text-slate-300 placeholder-slate-500 focus:outline-none" />
      </div>

      {loading ? <SkeletonTable rows={5} /> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-800">{['User', 'Email', 'Role', 'Verified', 'Joined', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-slate-800/50">
                {filtered.map(u => (
                  <tr key={u.uid} className="hover:bg-slate-800/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-teal-400 flex items-center justify-center"><span className="text-white text-xs font-bold">{u.displayName?.charAt(0)}</span></div>
                        <span className="text-slate-200 font-medium">{u.displayName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{u.email}</td>
                    <td className="px-4 py-3">
                      <select value={u.role} onChange={e => updateRole(u.uid, e.target.value as UserRole)}
                        disabled={updating === u.uid}
                        className={clsx('bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs font-medium focus:outline-none', roleColors[u.role as UserRole] || 'text-slate-400')}>
                        {(['fan', 'volunteer', 'staff', 'admin'] as UserRole[]).map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span className={clsx('badge', u.emailVerified ? 'badge-low' : 'badge-medium')}>{u.emailVerified ? 'Verified' : 'Pending'}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}</td>
                    <td className="px-4 py-3">
                      {updating === u.uid && <span className="text-xs text-slate-500">Updating...</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
