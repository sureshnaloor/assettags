import Link from "next/link";


export default function Footer() {
  return (
    <footer className="w-full bg-slate-200 dark:bg-slate-800 py-2 mt-auto">
      <div className="container mx-auto min-h-6 max-w-4xl flex items-center justify-between px-4">
        <div className="text-xs text-zinc-400 dark:text-zinc-500">
          © {new Date().getFullYear()} SmartTags Asset Management
        </div>
        <div className="text-right">
          <h2 className="text-lg font-bold bg-gradient-to-r from-slate-500 via-slate-400 to-slate-500 dark:from-slate-400 dark:via-slate-300 dark:to-slate-400 bg-clip-text text-transparent" 
              style={{
                textShadow: '1px 1px 2px rgba(0,0,0,0.2), 2px 2px 4px rgba(0,0,0,0.1)',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontWeight: '700',
                letterSpacing: '0.08em'
              }}>
            SMART TAGS
          </h2>
        </div>
      </div>
      <div className="container gap-3 flex justify-center mx-auto min-h-6 max-w-4xl text-center text-xs text-zinc-400 dark:text-zinc-500">
        <Link href="/privacy" className="hover:text-zinc-300 dark:hover:text-zinc-400 transition-colors">Privacy Policy</Link>
        <Link href="/terms" className="hover:text-zinc-300 dark:hover:text-zinc-400 transition-colors">Terms of Service</Link>
        <Link href="/contact" className="hover:text-zinc-300 dark:hover:text-zinc-400 transition-colors">Contact Us</Link>
      </div>
    </footer>
  );
} 