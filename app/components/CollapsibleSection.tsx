'use client';
import { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { Palette } from 'lucide-react';
import type { Theme } from '@/app/components/AssetDetails';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  theme?: Theme;
  onThemeChange?: (theme: Theme) => void;
  showThemeSwitcher?: boolean;
}

export default function CollapsibleSection({ 
  title, 
  children, 
  defaultExpanded = true,
  theme = 'default',
  onThemeChange,
  showThemeSwitcher = false
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  const getRibbonStyles = () => {
    switch (theme) {
      case 'glassmorphic':
        return 'bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/15';
      case 'light':
        return 'bg-blue-100/90 border border-blue-200 hover:bg-blue-200/90';
      default:
        return 'bg-sky-600/80 dark:bg-sky-700/80 hover:bg-sky-600/90 dark:hover:bg-sky-700/90';
    }
  };

  const getTextStyles = () => {
    switch (theme) {
      case 'glassmorphic':
        return 'text-white';
      case 'light':
        return 'text-blue-900';
      default:
        return 'text-emerald-200 dark:text-emerald-300';
    }
  };

  const cycleTheme = () => {
    if (!onThemeChange) return;
    const themes: Theme[] = ['default', 'glassmorphic', 'light'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    onThemeChange(themes[nextIndex]);
  };

  return (
    <div className="w-full">
      <div className="w-full flex items-center gap-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex-1 flex items-center justify-between p-3 rounded-lg transition-colors ${getRibbonStyles()}`}
        >
          <h2 className={`text-sm font-semibold ${getTextStyles()}`}>{title}</h2>
          <ChevronDownIcon 
            className={`h-5 w-5 ${getTextStyles()} transition-transform duration-200 ${
              isExpanded ? 'transform rotate-180' : ''
            }`}
          />
        </button>
        {showThemeSwitcher && onThemeChange && (
          <div className="relative">
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className={`p-3 rounded-lg transition-colors ${getRibbonStyles()} ${getTextStyles()}`}
              title="Change Theme"
            >
              <Palette className="h-5 w-5" />
            </button>
            {showThemeMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowThemeMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                  <button
                    onClick={() => {
                      onThemeChange('default');
                      setShowThemeMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      theme === 'default'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    Default Theme
                  </button>
                  <button
                    onClick={() => {
                      onThemeChange('glassmorphic');
                      setShowThemeMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      theme === 'glassmorphic'
                        ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-900 dark:text-teal-100'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    Glassmorphic Theme
                  </button>
                  <button
                    onClick={() => {
                      onThemeChange('light');
                      setShowThemeMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      theme === 'light'
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-900 dark:text-yellow-100'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    Light Modern Theme
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      <div
        className={`transition-all duration-200 ease-in-out ${
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="pt-3 flex justify-center items-center">
          {children}
        </div>
      </div>
    </div>
  );
} 