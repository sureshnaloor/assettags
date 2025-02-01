import Image from 'next/image';
import ThemeSwitcher from './ThemeSwitcher';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-8">
            <Image
              src="/images/logo.jpg"
              alt="JAL Logo"
              fill
              className="object-contain drop-shadow-sm"
              priority
            />
          </div>
          
          <div className="text-sm sm:text-base font-semibold italic uppercase 
                        text-slate-800 dark:text-zinc-100 tracking-wider
                        transform hover:scale-105 transition-transform duration-200">
            Asset Tags
          </div>
        </div>
        <ThemeSwitcher />
      </div>
    </header>
  );
}