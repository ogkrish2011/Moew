import { useState, useEffect } from 'react';
import type { DashboardSettingsTheme } from '@workspace/api-client-react';

export function useTheme() {
  const [theme, setTheme] = useState<DashboardSettingsTheme>(() => {
    const saved = localStorage.getItem('dashboard-theme') as DashboardSettingsTheme;
    return saved || 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    // Remove all theme classes
    root.classList.remove(
      'theme-dark', 
      'theme-light', 
      'theme-midnight', 
      'theme-ocean', 
      'theme-forest', 
      'theme-sunset'
    );
    
    // Add current theme class
    root.classList.add(`theme-${theme}`);
    localStorage.setItem('dashboard-theme', theme);
  }, [theme]);

  return { theme, setTheme };
}
