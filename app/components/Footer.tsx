import Link from "next/link";


export default function Footer() {
  return (
    <footer className="w-full bg-slate-200 dark:bg-slate-800 py-2 mt-auto">
      <div className="container mx-auto min-h-6  max-w-4xl text-center text-xs text-zinc-400 dark:text-zinc-500">
        © {new Date().getFullYear()} SmartTags Asset Management
      </div>
      <div className="container gap-3 flex justify-center mx-auto min-h-6  max-w-4xl text-center text-xs text-zinc-400 dark:text-zinc-500">
        <Link href="/privacy" className="hover:text-zinc-300 dark:hover:text-zinc-400 transition-colors">Privacy Policy</Link>
        <Link href="/terms" className="hover:text-zinc-300 dark:hover:text-zinc-400 transition-colors">Terms of Service</Link>
        <Link href="/contact" className="hover:text-zinc-300 dark:hover:text-zinc-400 transition-colors">Contact Us</Link>
      </div>
    </footer>
  );
} 