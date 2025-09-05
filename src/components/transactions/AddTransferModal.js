import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { addTransfer } from '../../services/dbService'; // Import the new transfer function

const AddTransferModal = ({ onClose }) => {
  const { currentUser } = useAuth();
  const { accounts } = useData();

  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Set default accounts when component loads
  useEffect(() => {
    if (accounts.length >= 2) {
      setFromAccountId(accounts.find(a => a.type === 'bank')?.id || accounts[0].id);
      setToAccountId(accounts.find(a => a.type === 'cash')?.id || accounts[1].id);
    }
  }, [accounts]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0 || !fromAccountId || !toAccountId || fromAccountId === toAccountId) {
      setError('Please select valid, different accounts and enter a positive amount.');
      return;
    }
    setLoading(true);
    setError('');
    
    try {
      const transferData = {
        fromAccountId,
        toAccountId,
        amount: parsedAmount,
        date,
        description
      };
      // Call the database function to save the transfer
      await addTransfer(currentUser.uid, transferData);
      onClose(); // Close the modal on success
    } catch (err) {
      console.error("Transfer failed:", err);
      setError(err.message || 'Failed to process transfer. Please try again.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Amount Input */}
      <div>
        <label htmlFor="transfer-amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount (₹)</label>
        <input
          id="transfer-amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00" required
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* From Account Select */}
      <div>
        <label htmlFor="from-account" className="block text-sm font-medium text-gray-700 dark:text-gray-300">From</label>
        <select
          id="from-account" value={fromAccountId} onChange={(e) => setFromAccountId(e.target.value)} required
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          {accounts.map(acc => (
            <option key={acc.id} value={acc.id}>{acc.name}</option>
          ))}
        </select>
      </div>

      {/* To Account Select */}
      <div>
        <label htmlFor="to-account" className="block text-sm font-medium text-gray-700 dark:text-gray-300">To</label>
        <select
          id="to-account" value={toAccountId} onChange={(e) => setToAccountId(e.target.value)} required
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          {accounts.filter(acc => acc.id !== fromAccountId).map(acc => (
            <option key={acc.id} value={acc.id}>{acc.name}</option>
          ))}
        </select>
      </div>
      
      {/* Date and Description */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="transfer-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
          <input
            id="transfer-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor="transfer-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
          <input
            id="transfer-description" type="text" value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="(Optional)"
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit" disabled={loading}
          className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200 disabled:bg-blue-400"
        >
          {loading ? 'Processing...' : 'Transfer Funds'}
        </button>
      </div>
    </form>
  );
};

export default AddTransferModal;

