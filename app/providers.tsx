'use client';
import { ThemeProvider } from 'next-themes';
import { ToastProvider } from '@/components/ui/toaster';
import { NavigationProvider } from '@/app/contexts/NavigationContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider 
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
    >
      <NavigationProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </NavigationProvider>
    </ThemeProvider>
  );
} 