import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard, Bot, Map, Activity, Bus, Accessibility, AlertTriangle,
  FileWarning, Leaf, Bell, Settings, HelpCircle, LogOut, ChevronLeft,
  ChevronRight, Shield, UserCog, ClipboardList, Megaphone, Building2,
  Users2, X
} from 'lucide-react';
import clsx from 'clsx';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  roles?: string[];
  badge?: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'AI Assistant', path: '/assistant', icon: Bot },
  { label: 'Smart Navigation', path: '/navigation', icon: Map },
  { label: 'Crowd Intelligence', path: '/crowd', icon: Activity },
  { label: 'Transportation', path: '/transport', icon: Bus },
  { label: 'Accessibility', path: '/accessibility', icon: Accessibility },
  { label: 'Emergency Support', path: '/emergency', icon: AlertTriangle },
  { label: 'Incident Reports', path: '/incidents', icon: FileWarning },
  { label: 'Sustainability', path: '/sustainability', icon: Leaf },
  { label: 'Notifications', path: '/notifications', icon: Bell },
  { label: 'Settings', path: '/settings', icon: Settings },
  { label: 'Help & Support', path: '/help', icon: HelpCircle },
];

const adminItems: NavItem[] = [
  { label: 'Operations Centre', path: '/operations', icon: Shield, roles: ['admin'] },
  { label: 'Staff & Volunteers', path: '/staff', icon: Users2, roles: ['admin'] },
  { label: 'Announcements', path: '/announcements', icon: Megaphone, roles: ['admin'] },
  { label: 'User Management', path: '/users', icon: UserCog, roles: ['admin'] },
  { label: 'Audit Logs', path: '/audit-logs', icon: ClipboardList, roles: ['admin'] },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  isMobile?: boolean;
}

export default function Sidebar({ collapsed, onToggle, isMobile }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleNav = (path: string) => {
    navigate(path);
    if (isMobile) onToggle();
  };

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const roleColors: Record<string, string> = {
    admin: 'bg-purple-500/20 text-purple-300',
    staff: 'bg-blue-500/20 text-blue-300',
    volunteer: 'bg-teal-500/20 text-teal-300',
    fan: 'bg-indigo-500/20 text-indigo-300',
  };

  return (
    <aside
      className="flex flex-col h-full bg-slate-900 border-r border-slate-800"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className={clsx(
        'flex items-center h-16 px-4 border-b border-slate-800 flex-shrink-0',
        collapsed ? 'justify-center' : 'justify-between'
      )}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-teal-400 rounded-lg flex items-center justify-center flex-shrink-0">
              <Building2 size={16} className="text-white" />
            </div>
            <div>
              <span className="text-sm font-display font-bold gradient-text">StadiumFlow</span>
              <span className="block text-xs text-slate-500">AI Platform</span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-teal-400 rounded-lg flex items-center justify-center">
            <Building2 size={16} className="text-white" />
          </div>
        )}
        {!isMobile && (
          <button
            onClick={onToggle}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
        {isMobile && (
          <button onClick={onToggle} className="btn-ghost p-1" aria-label="Close sidebar">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5" aria-label="Sidebar navigation">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => handleNav(item.path)}
            title={collapsed ? item.label : undefined}
            className={clsx('nav-item w-full text-left', isActive(item.path) && 'active')}
            aria-current={isActive(item.path) ? 'page' : undefined}
          >
            <item.icon size={18} className="flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}

        {user?.role === 'admin' && (
          <>
            <div className={clsx('mt-4 mb-2 px-3', collapsed && 'hidden')}>
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Admin</p>
            </div>
            {!collapsed && <div className="border-t border-slate-800 mb-2" />}
            {adminItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                title={collapsed ? item.label : undefined}
                className={clsx('nav-item w-full text-left', isActive(item.path) && 'active')}
                aria-current={isActive(item.path) ? 'page' : undefined}
              >
                <item.icon size={18} className="flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            ))}
          </>
        )}
      </nav>

      {/* User profile + logout */}
      <div className="border-t border-slate-800 p-3 flex-shrink-0">
        {!collapsed ? (
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-teal-400 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold">
                {user?.displayName?.charAt(0) || '?'}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-200 truncate">{user?.displayName}</p>
              <span className={clsx('badge text-xs', roleColors[user?.role || 'fan'])}>{user?.role}</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-teal-400 flex items-center justify-center">
              <span className="text-white text-xs font-bold">{user?.displayName?.charAt(0) || '?'}</span>
            </div>
          </div>
        )}

        <button
          onClick={() => setShowLogoutConfirm(true)}
          title={collapsed ? 'Logout' : undefined}
          className={clsx(
            'nav-item w-full text-red-400 hover:text-red-300 hover:bg-red-900/20',
            collapsed && 'justify-center'
          )}
        >
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Logout confirmation dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="logout-title">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowLogoutConfirm(false)} />
          <div className="relative card p-6 w-full max-w-sm">
            <h2 id="logout-title" className="text-lg font-bold text-slate-100 mb-2">Confirm Logout</h2>
            <p className="text-slate-400 mb-6">Are you sure you want to log out of StadiumFlow AI?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutConfirm(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleLogout} className="btn-danger flex-1">Logout</button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
