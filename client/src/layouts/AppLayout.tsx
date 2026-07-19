import React, { useState, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, Bot, Map, Users2, Bus, Accessibility, AlertTriangle,
  FileWarning, Leaf, Bell, Settings, HelpCircle, LogOut, ChevronLeft,
  ChevronRight, Menu, X, Shield, UserCog, ClipboardList, Megaphone,
  Activity, Zap, AlertCircle, Globe, Sun, Moon, Search, Building2
} from 'lucide-react';
import clsx from 'clsx';
import { useAccessibility } from '../contexts/AccessibilityContext';
import EmergencyButton from '../components/emergency/EmergencyButton';
import TopBar from '../components/layout/TopBar';
import Sidebar from '../components/layout/Sidebar';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { settings } = useAccessibility();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      {/* Desktop Sidebar */}
      <div className={clsx(
        'hidden lg:flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out',
        sidebarOpen ? 'w-64' : 'w-16'
      )}>
        <Sidebar collapsed={!sidebarOpen} onToggle={() => setSidebarOpen(s => !s)} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        </div>
      )}

      {/* Mobile Sidebar Drawer */}
      <div className={clsx(
        'fixed inset-y-0 left-0 z-50 w-72 lg:hidden transition-transform duration-300',
        mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <Sidebar collapsed={false} onToggle={() => setMobileSidebarOpen(false)} isMobile />
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar onMenuClick={() => setMobileSidebarOpen(true)} />

        <main
          id="main-content"
          className="flex-1 overflow-y-auto p-4 lg:p-6 animate-fade-in"
          tabIndex={-1}
        >
          <Outlet />
        </main>
      </div>

      {/* Emergency button - always visible */}
      <EmergencyButton />
    </div>
  );
}
