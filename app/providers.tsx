'use client';
import { ThemeProvider } from 'next-themes';
import { ToastProvider } from '@/components/ui/toaster';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider 
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
    >
      <ToastProvider>
        {children}
      </ToastProvider>
    </ThemeProvider>
  );
} 