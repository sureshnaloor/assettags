'use client';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen bg-[conic-gradient(at_top_right,_#111111,_#1e40af,_#eeef46)] bg-fixed">
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