import React from 'react';
import { signInWithPopup } from 'firebase/auth';
// Corrected path to go up one directory to the src root
import { auth, googleProvider } from '../firebase/config';
import { Wallet } from 'lucide-react';

const LoginView = () => {
  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Authentication failed:", error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 rounded-2xl">
        <div className="text-center">
          <div className="inline-block p-3 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
            <Wallet className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome to FinTrack</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Sign in to begin your financial journey.</p>
        </div>
        <button
          onClick={handleSignIn}
          className="w-full inline-flex items-center justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
        >
          <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C44.637,32.406,48,27.14,48,20C48,20,43.611,20.083,43.611,20.083z"></path>
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.519-3.317-11.28-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C44.637,32.406,48,27.14,48,20C48,20,43.611,20.083,43.611,20.083z"></path>
          </svg>
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default LoginView;