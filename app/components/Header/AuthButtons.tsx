'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import { useState } from 'react';

export default function AuthButtons() {
  const { data: session, status } = useSession();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  if (status === 'loading') {
    return (
      <div className="animate-pulse">
        <div className="h-8 w-8 rounded-full bg-gray-200"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <button
        onClick={() => signIn()}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Sign In
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowProfileMenu(!showProfileMenu)}
        className="flex items-center space-x-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <div className="relative h-8 w-8 rounded-full bg-gray-200">
          {session.user?.image ? (
            <Image
              src={session.user.image}
              alt="Profile"
              fill
              className="rounded-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white">
              {session.user?.email?.[0].toUpperCase()}
            </div>
          )}
        </div>
      </button>

      {showProfileMenu && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="px-4 py-2 text-sm text-gray-700">
            {session.user?.email}
          </div>
          <div className="border-t border-gray-100">
            <button
              onClick={() => signOut()}
              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 