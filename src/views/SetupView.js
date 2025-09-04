import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { initializeUser } from '../services/dbService';

const SetupView = () => {
  const { currentUser, setIsNewUser } = useAuth();
  const [cash, setCash] = useState('');
  const [bank, setBank] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSetup = async () => {
    if (!cash || !bank || parseFloat(cash) < 0 || parseFloat(bank) < 0) {
      setError('Please enter valid, non-negative starting balances.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await initializeUser(currentUser, {
        cash: parseFloat(cash),
        bank: parseFloat(bank)
      });
      setIsNewUser(false); // Update the state to show the main app
    } catch (err) {
      console.error("Setup failed:", err);
      setError('Could not complete setup. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-xl text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to FinTrack!</h1>
        <p className="text-gray-600 mb-8">Let's get your finances set up. Please enter your starting balances.</p>
        
        <div className="space-y-4 text-left">
          <div>
            <label htmlFor="cash" className="block text-sm font-medium text-gray-700">Cash in Hand (₹)</label>
            <input
              id="cash"
              type="number"
              value={cash}
              onChange={(e) => setCash(e.target.value)}
              placeholder="e.g., 1500"
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="bank" className="block text-sm font-medium text-gray-700">Bank Account Balance (₹)</label>
            <input
              id="bank"
              type="number"
              value={bank}
              onChange={(e) => setBank(e.target.value)}
              placeholder="e.g., 50000"
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

        <button
          onClick={handleSetup}
          disabled={loading}
          className="w-full mt-8 py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200 disabled:bg-blue-300"
        >
          {loading ? 'Saving...' : 'Get Started'}
        </button>
      </div>
    </div>
  );
};

export default SetupView;