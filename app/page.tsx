'use client';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen bg-[conic-gradient(at_top_right,_#111111,_#1e40af,_#eeef46)] bg-fixed">
      <nav className="bg-gray-800/50 backdrop-blur-sm shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              {/* Logo */}
              <Link href="/" className="flex items-center">
                <Image
                  src="/images/logo.jpg"
                  alt="JAL Logo"
                  width={48}
                  height={48}
                  className="object-contain drop-shadow-[0_8px_8px_rgba(0,0,0,0.5)]"
                />
              </Link>

              {/* MME Link */}
              <Link 
                href="/mme" 
                className="px-3 py-2 text-white hover:bg-gray-700 rounded-md"
              >
                MME
              </Link>

              {/* Fixed Assets Link */}
              <Link 
                href="/fixedasset" 
                className="px-3 py-2 text-white hover:bg-gray-700 rounded-md"
              >
                Fixed Assets
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex flex-col items-center justify-center min-h-[80vh] text-white">
            <h1 className="text-4xl font-bold mb-4">Asset Management System</h1>
            <p className="text-xl text-center max-w-2xl">
              Manage and track your MME and Fixed Assets efficiently with our comprehensive system.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}