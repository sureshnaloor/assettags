'use client';
import { useState, useEffect } from 'react';
import { useAppTheme } from '@/app/contexts/ThemeContext';
import { SunIcon, MoonIcon, SparklesIcon } from '@heroicons/react/24/outline';

export default function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useAppTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="rounded-lg p-2">
        <div className="h-5 w-5"></div>
      </div>
    );
  }

  const cycleTheme = () => {
    const themes: Array<'default' | 'glassmorphic' | 'light'> = ['light', 'glassmorphic', 'default'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <SunIcon className="h-4 w-4 text-slate-700 dark:text-slate-300 transition-transform duration-300 hover:scale-125 hover:rotate-12" />;
      case 'glassmorphic':
        return <SparklesIcon className="h-4 w-4 text-slate-700 dark:text-slate-300 transition-transform duration-300 hover:scale-125 hover:rotate-12" />;
      case 'default':
        return <MoonIcon className="h-4 w-4 text-slate-600 dark:text-slate-300 transition-transform duration-300 hover:scale-125 hover:rotate-12" />;
      default:
        return <SunIcon className="h-4 w-4 text-slate-700 dark:text-slate-300 transition-transform duration-300 hover:scale-125 hover:rotate-12" />;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light':
        return 'Light';
      case 'glassmorphic':
        return 'Glass';
      case 'default':
        return 'Dark';
      default:
        return 'Theme';
    }
  };

  return (
    <button
      onClick={cycleTheme}
      className="rounded-lg p-2.5 hover:bg-gradient-to-r hover:from-slate-100/90 hover:to-slate-50/90 dark:hover:from-slate-700/90 dark:hover:to-slate-600/90 transition-all duration-300 hover:shadow-md hover:shadow-slate-200/50 dark:hover:shadow-slate-800/50 border border-transparent hover:border-slate-200/50 dark:hover:border-slate-600/50 hover:scale-105 flex items-center gap-2"
      aria-label={`Switch theme (Current: ${getThemeLabel()})`}
      title={`Current theme: ${getThemeLabel()}. Click to cycle themes.`}
    >
      {getThemeIcon()}
      <span className="text-xs font-medium text-slate-700 dark:text-slate-300 hidden sm:inline">
        {getThemeLabel()}
      </span>
    </button>
  );
} 