import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { addAccount } from '../../services/dbService';

const AddAccountModal = ({ onClose }) => {
  const { currentUser } = useAuth();
  const [accountName, setAccountName] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!accountName || !initialBalance || parseFloat(initialBalance) < 0) {
      setError('Please enter a valid name and non-negative starting balance.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const accountData = {
        name: accountName,
        balance: parseFloat(initialBalance),
        type: 'bank', // All user-added accounts are of type 'bank'
      };
      await addAccount(currentUser.uid, accountData);
      onClose();
    } catch (err) {
      console.error("Failed to add account:", err);
      setError('Failed to add account. Please try again.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="acc-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Account Name</label>
        <input
          id="acc-name" type="text" value={accountName} onChange={(e) => setAccountName(e.target.value)}
          placeholder="e.g., HDFC Savings" required
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
        />
      </div>
      <div>
        <label htmlFor="acc-balance" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Initial Balance (₹)</label>
        <input
          id="acc-balance" type="number" value={initialBalance} onChange={(e) => setInitialBalance(e.target.value)}
          placeholder="0.00" required
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="pt-2">
        <button type="submit" disabled={loading} className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-400">
          {loading ? 'Saving...' : 'Add Account'}
        </button>
      </div>
    </form>
  );
};

export default AddAccountModal;