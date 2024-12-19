import Image from 'next/image';

export default function Header() {
  return (
    <header className="w-full">
      <div className="container mx-auto max-w-4xl flex items-center justify-between p-2">
        <div className="relative w-20 sm:w-40 md:w-24">
          <Image
            src="/images/logo.jpg"
            alt="JAL Logo"
            width={60}
            height={30}
            className="object-contain w-full h-auto drop-shadow-[0_8px_8px_rgba(0,0,0,0.5)]"
            priority
          />
        </div>
        
        <div className="text-sm sm:text-base md:text-lg font-semibold italic uppercase 
                      text-zinc-100 tracking-wider
                      drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]
                      transform hover:scale-105 transition-transform duration-200">
          Asset Tags
        </div>
      </div>
    </header>
  );
} 