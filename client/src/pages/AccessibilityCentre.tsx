import React from 'react';
import { Accessibility, Type, Contrast, Volume2, Keyboard, Monitor, Eye, Mic } from 'lucide-react';
import { useAccessibility } from '../contexts/AccessibilityContext';
import clsx from 'clsx';

interface ToggleSwitchProps { checked: boolean; onChange: () => void; label: string; description: string; id: string; }
function ToggleSwitch({ checked, onChange, label, description, id }: ToggleSwitchProps) {
  return (
    <div className="flex items-start justify-between gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-800">
      <div>
        <label htmlFor={id} className="text-sm font-medium text-slate-200 cursor-pointer">{label}</label>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={clsx(
          'relative inline-flex items-center h-6 w-11 rounded-full transition-colors flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
          checked ? 'bg-indigo-600' : 'bg-slate-700'
        )}
        aria-label={label}
      >
        <span className={clsx('inline-block w-4 h-4 bg-white rounded-full transition-transform', checked ? 'translate-x-6' : 'translate-x-1')} />
      </button>
    </div>
  );
}

export default function AccessibilityCentre() {
  const { settings, toggleDarkMode, toggleHighContrast, toggleReducedMotion, toggleDyslexiaFont, increaseFontSize, decreaseFontSize } = useAccessibility();

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="section-header">Accessibility Centre</h1>
        <p className="section-subheader">Customize your experience. Settings are saved automatically.</p>
      </div>

      <div className="space-y-6">
        <section aria-labelledby="font-section">
          <h2 id="font-section" className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Type size={14} /> Text Size
          </h2>
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-slate-200">Font Size</p>
                <p className="text-xs text-slate-500">Current: <span className="text-indigo-400 capitalize">{settings.fontSize}</span></p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={decreaseFontSize} className="btn-secondary px-3 py-1.5 text-sm" disabled={settings.fontSize === 'normal'} aria-label="Decrease font size">A-</button>
                <div className="flex gap-1">
                  {(['normal', 'large', 'xl'] as const).map(s => (
                    <div key={s} className={clsx('w-2 h-2 rounded-full', settings.fontSize === s ? 'bg-indigo-500' : 'bg-slate-700')} aria-hidden="true" />
                  ))}
                </div>
                <button onClick={increaseFontSize} className="btn-secondary px-3 py-1.5 text-sm" disabled={settings.fontSize === 'xl'} aria-label="Increase font size">A+</button>
              </div>
            </div>
            <div className="p-3 bg-slate-900 rounded-lg">
              <p className="text-slate-300" style={{ fontSize: settings.fontSize === 'xl' ? '20px' : settings.fontSize === 'large' ? '18px' : '16px' }}>
                Sample text: Welcome to StadiumFlow AI for FIFA World Cup 2026.
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="display-section">
          <h2 id="display-section" className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Monitor size={14} /> Display
          </h2>
          <div className="space-y-2">
            <ToggleSwitch id="dark-mode" checked={settings.darkMode} onChange={toggleDarkMode} label="Dark Mode" description="Use a dark colour scheme to reduce eye strain in low-light environments" />
            <ToggleSwitch id="high-contrast" checked={settings.highContrast} onChange={toggleHighContrast} label="High Contrast Mode" description="Increase contrast between text and background for better readability" />
            <ToggleSwitch id="reduced-motion" checked={settings.reducedMotion} onChange={toggleReducedMotion} label="Reduced Motion" description="Minimise animations and transitions for users sensitive to motion" />
            <ToggleSwitch id="dyslexia-font" checked={settings.dyslexiaFont} onChange={toggleDyslexiaFont} label="Dyslexia-Friendly Font" description="Use OpenDyslexic font with increased letter and word spacing" />
          </div>
        </section>

        <section aria-labelledby="keyboard-section">
          <h2 id="keyboard-section" className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Keyboard size={14} /> Keyboard Navigation
          </h2>
          <div className="card p-4">
            <p className="text-sm text-slate-300 mb-3">This application is fully keyboard navigable:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                ['Tab', 'Move to next element'],
                ['Shift + Tab', 'Move to previous element'],
                ['Enter / Space', 'Activate button/link'],
                ['Arrow Keys', 'Navigate menus'],
                ['Escape', 'Close dialogs'],
                ['/', 'Focus search bar'],
              ].map(([key, action]) => (
                <div key={key} className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg">
                  <kbd className="px-1.5 py-0.5 bg-slate-700 border border-slate-600 rounded text-slate-300 font-mono text-xs">{key}</kbd>
                  <span className="text-slate-400">{action}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="sr-section">
          <h2 id="sr-section" className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Eye size={14} /> Screen Reader Support
          </h2>
          <div className="card p-4">
            <p className="text-sm text-slate-300 mb-2">StadiumFlow AI is optimised for screen readers:</p>
            <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
              <li>All interactive elements have descriptive ARIA labels</li>
              <li>Live regions announce dynamic content changes</li>
              <li>Status updates are announced automatically</li>
              <li>Form errors are associated with their inputs</li>
              <li>Skip to main content link at top of page</li>
              <li>Semantic HTML headings and landmark regions throughout</li>
            </ul>
          </div>
        </section>

        <div className="card p-4 border border-emerald-900/40">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-emerald-900/30 rounded-lg flex items-center justify-center">
              <Accessibility size={14} className="text-emerald-400" />
            </div>
            <p className="text-sm font-semibold text-emerald-300">WCAG 2.2 AA Compliant</p>
          </div>
          <p className="text-xs text-slate-400">This application targets WCAG 2.2 Level AA accessibility standards, including sufficient colour contrast ratios, keyboard navigation, screen reader support, and focus management.</p>
        </div>
      </div>
    </div>
  );
}
