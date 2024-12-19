export default function Footer() {
  return (
    <footer className="w-full py-2 mt-auto">
      <div className="container mx-auto max-w-4xl text-center text-xs text-zinc-400">
        © {new Date().getFullYear()} JAL Asset Management
      </div>
    </footer>
  );
} 