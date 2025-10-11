export default function Footer() {
  return (
    <footer className="w-full bg-slate-200 py-2 mt-auto">
      <div className="container mx-auto min-h-6  max-w-4xl text-center text-xs text-zinc-400">
        © {new Date().getFullYear()} SmartTags Asset Management
      </div>
    </footer>
  );
} 