import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { addTransaction } from '../../services/dbService';
import { Timestamp } from 'firebase/firestore';

const AddTransactionModal = ({ onClose }) => {
  const { currentUser } = useAuth();
  const { accounts, categories } = useData();

  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [accountId, setAccountId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Set default account when the component loads
  useEffect(() => {
    if (accounts.length > 0) {
      setAccountId(accounts[0].id);
    }
  }, [accounts]);

  // Set default category when the transaction type changes
  useEffect(() => {
    const categoryList = categories[type] || [];
    if (categoryList.length > 0) {
      setCategory(categoryList[0]);
    } else {
      setCategory('');
    }
  }, [type, categories]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !category || !accountId || parseFloat(amount) <= 0) {
      setError('Please fill out all fields with a valid amount.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const transactionData = {
        userId: currentUser.uid,
        type,
        amount: parseFloat(amount),
        category,
        accountId,
        date: Timestamp.fromDate(new Date(date)),
        description,
      };
      // Call the database function to save the data
      await addTransaction(currentUser.uid, transactionData);
      onClose(); // Close the modal on success
    } catch (err) {
      console.error("Failed to add transaction:", err);
      setError('Failed to add transaction. Please try again.');
      setLoading(false);
    }
  };

  const categoryList = categories[type] || [];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Transaction Type Switch */}
      <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        <button
          type="button"
          onClick={() => setType('expense')}
          className={`w-full py-2 rounded-md text-sm font-semibold transition-colors ${type === 'expense' ? 'bg-red-500 text-white shadow' : 'text-gray-600 dark:text-gray-300'}`}
        >
          Expense
        </button>
        <button
          type="button"
          onClick={() => setType('income')}
          className={`w-full py-2 rounded-md text-sm font-semibold transition-colors ${type === 'income' ? 'bg-green-500 text-white shadow' : 'text-gray-600 dark:text-gray-300'}`}
        >
          Income
        </button>
      </div>

      {/* Amount Input */}
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount (₹)</label>
        <input
          id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00" required
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      {/* Account Select */}
      <div>
        <label htmlFor="account" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Account</label>
        <select
          id="account" value={accountId} onChange={(e) => setAccountId(e.target.value)} required
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          {accounts.map(acc => (
            <option key={acc.id} value={acc.id}>{acc.name}</option>
          ))}
        </select>
      </div>

      {/* Category Select */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
        <select
          id="category" value={category} onChange={(e) => setCategory(e.target.value)} required
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select a category</option>
          {categoryList.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      {/* Date and Description */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
          <input
            id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
          <input
            id="description" type="text" value={description} onChange={(e) => setDescription(e.target.value)}
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
          {loading ? 'Saving...' : 'Add Transaction'}
        </button>
      </div>
    </form>
  );
};

export default AddTransactionModal;