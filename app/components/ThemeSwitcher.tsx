'use client';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

export default function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

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

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggleTheme}
      className="rounded-lg p-2.5 hover:bg-gradient-to-r hover:from-slate-100/90 hover:to-slate-50/90 dark:hover:from-slate-700/90 dark:hover:to-slate-600/90 transition-all duration-300 hover:shadow-md hover:shadow-slate-200/50 dark:hover:shadow-slate-800/50 border border-transparent hover:border-slate-200/50 dark:hover:border-slate-600/50 hover:scale-105"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <MoonIcon className="h-4 w-4 text-slate-700 dark:text-slate-300 transition-transform duration-300 hover:scale-125 hover:rotate-12" />
      ) : (
        <SunIcon className="h-4 w-4 text-slate-600 dark:text-slate-300 transition-transform duration-300 hover:scale-125 hover:rotate-12" />
      )}
    </button>
  );
} 