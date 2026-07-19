import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AccessibilitySettings } from '../types';

interface AccessibilityContextValue {
  settings: AccessibilitySettings;
  updateSettings: (updates: Partial<AccessibilitySettings>) => void;
  toggleDarkMode: () => void;
  toggleHighContrast: () => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  toggleReducedMotion: () => void;
  toggleDyslexiaFont: () => void;
}

const defaults: AccessibilitySettings = {
  fontSize: 'normal',
  highContrast: false,
  reducedMotion: false,
  dyslexiaFont: false,
  darkMode: true,
};

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

export const AccessibilityProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    try {
      const saved = localStorage.getItem('sf_accessibility');
      return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
    } catch { return defaults; }
  });

  useEffect(() => {
    localStorage.setItem('sf_accessibility', JSON.stringify(settings));
    const html = document.documentElement;

    // Dark mode
    html.classList.toggle('dark', settings.darkMode);

    // Font size
    html.style.fontSize = settings.fontSize === 'xl' ? '20px' : settings.fontSize === 'large' ? '18px' : '16px';

    // High contrast
    html.classList.toggle('high-contrast', settings.highContrast);

    // Reduced motion
    if (settings.reducedMotion) {
      html.style.setProperty('--animation-duration', '0ms');
    } else {
      html.style.removeProperty('--animation-duration');
    }

    // Dyslexia font
    html.classList.toggle('dyslexia-font', settings.dyslexiaFont);
  }, [settings]);

  const updateSettings = (updates: Partial<AccessibilitySettings>) =>
    setSettings(s => ({ ...s, ...updates }));

  const toggleDarkMode = () => updateSettings({ darkMode: !settings.darkMode });
  const toggleHighContrast = () => updateSettings({ highContrast: !settings.highContrast });
  const toggleReducedMotion = () => updateSettings({ reducedMotion: !settings.reducedMotion });
  const toggleDyslexiaFont = () => updateSettings({ dyslexiaFont: !settings.dyslexiaFont });

  const fontSizes: AccessibilitySettings['fontSize'][] = ['normal', 'large', 'xl'];
  const increaseFontSize = () => {
    const idx = fontSizes.indexOf(settings.fontSize);
    if (idx < fontSizes.length - 1) updateSettings({ fontSize: fontSizes[idx + 1] });
  };
  const decreaseFontSize = () => {
    const idx = fontSizes.indexOf(settings.fontSize);
    if (idx > 0) updateSettings({ fontSize: fontSizes[idx - 1] });
  };

  return (
    <AccessibilityContext.Provider value={{
      settings, updateSettings, toggleDarkMode, toggleHighContrast,
      increaseFontSize, decreaseFontSize, toggleReducedMotion, toggleDyslexiaFont,
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error('useAccessibility must be used within AccessibilityProvider');
  return ctx;
};
