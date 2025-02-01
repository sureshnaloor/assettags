'use client';
import Link from 'next/link';

export default function PendingApprovalPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-white/10 backdrop-blur-sm p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Registration Pending Approval</h1>
        
        <div className="text-gray-200 mb-6">
          <p className="mb-4">
            Your registration request has been submitted successfully. An administrator will review your request and approve your account.
          </p>
          <p>
            You will be able to sign in once your account is approved.
          </p>
        </div>

        <Link 
          href="/auth/signin" 
          className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors duration-200"
        >
          Return to Sign In
        </Link>
      </div>
    </div>
  );
}