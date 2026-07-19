import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, Sun, Moon, Search, ChevronDown, User, Settings, LogOut, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import clsx from 'clsx';



interface TopBarProps {
  onMenuClick: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { settings, toggleDarkMode } = useAccessibility();
  const [showProfile, setShowProfile] = useState(false);
  const [search, setSearch] = useState('');

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800 flex items-center gap-3 px-4 lg:px-6 flex-shrink-0">
      {/* Mobile menu */}
      <button onClick={onMenuClick} className="lg:hidden btn-ghost p-2" aria-label="Open menu">
        <Menu size={20} />
      </button>

      {/* Stadium selector */}
      <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-xl border border-slate-700">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
        <span className="text-sm font-medium text-slate-300">MetroFlow Arena</span>
        <span className="text-xs text-slate-500">• NY, USA</span>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-xs hidden md:flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-xl border border-slate-700">
        <Search size={16} className="text-slate-500" />
        <input
          type="search"
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-sm text-slate-300 placeholder-slate-500 focus:outline-none"
          aria-label="Search"
        />
      </div>

      <div className="flex items-center gap-1 ml-auto">
        {/* Emergency status */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-red-950/40 border border-red-900/50 rounded-xl">
          <AlertCircle size={14} className="text-red-400" />
          <span className="text-xs text-red-400 font-medium">3 Active Incidents</span>
        </div>


        {/* Dark mode */}
        <button onClick={toggleDarkMode} className="btn-ghost p-2" aria-label="Toggle dark mode">
          {settings.darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <button onClick={() => navigate('/notifications')} className="btn-ghost p-2 relative" aria-label="Notifications">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" aria-hidden="true" />
        </button>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => { setShowProfile(s => !s); }}
            className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-800 transition-colors"
            aria-expanded={showProfile}
            aria-label="User menu"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-teal-400 flex items-center justify-center">
              <span className="text-white text-xs font-bold">{user?.displayName?.charAt(0)}</span>
            </div>
            <span className="hidden sm:block text-sm font-medium text-slate-300 max-w-[100px] truncate">{user?.displayName}</span>
            <ChevronDown size={14} className="text-slate-500" />
          </button>
          {showProfile && (
            <div className="absolute right-0 top-full mt-1 w-48 card py-1 z-50">
              <div className="px-4 py-2 border-b border-slate-800">
                <p className="text-sm font-medium text-slate-200">{user?.displayName}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
              <button onClick={() => { navigate('/settings'); setShowProfile(false); }} className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-800 flex items-center gap-2">
                <Settings size={14} /> Settings
              </button>
              <button onClick={() => { logout(); navigate('/login'); }} className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-slate-800 flex items-center gap-2">
                <LogOut size={14} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
