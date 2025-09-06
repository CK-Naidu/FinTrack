import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { updateTransaction } from '../../services/dbService';
import { Timestamp } from 'firebase/firestore';

const EditTransactionModal = ({ transaction, onClose }) => {
  const { currentUser } = useAuth();
  const { accounts, categories } = useData();

  const [type, setType] = useState(transaction.type);
  const [amount, setAmount] = useState(transaction.amount);
  const [category, setCategory] = useState(transaction.category);
  const [accountId, setAccountId] = useState(transaction.accountId);
  const [date, setDate] = useState(new Date(transaction.date).toISOString().slice(0, 10));
  const [description, setDescription] = useState(transaction.description || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const categoryList = categories[type] || [];
    if (!categoryList.includes(category)) setCategory(categoryList[0] || '');
  }, [type, categories, category]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !category || !accountId || parseFloat(amount) <= 0) {
      setError('Please fill out all fields with a valid amount.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const updatedData = {
        type,
        amount: parseFloat(amount),
        category,
        accountId,
        date: Timestamp.fromDate(new Date(date)),
        description,
        // Do NOT touch createdAt
      };
      await updateTransaction(currentUser.uid, transaction, updatedData);
      onClose();
    } catch (err) {
      console.error("Failed to update transaction:", err);
      setError('Failed to update transaction. Please try again.');
      setLoading(false);
    }
  };

  const categoryList = categories[type] || [];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

      <div>
        <label htmlFor="edit-amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount (₹)</label>
        <input
          id="edit-amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm"
        />
      </div>

      <div>
        <label htmlFor="edit-account" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Account</label>
        <select
          id="edit-account" value={accountId} onChange={(e) => setAccountId(e.target.value)} required
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm"
        >
          {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor="edit-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
        <select
          id="edit-category" value={category} onChange={(e) => setCategory(e.target.value)} required
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm"
        >
          <option value="">Select a category</option>
          {categoryList.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="edit-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
          <input
            id="edit-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm"
          />
        </div>
        <div>
          <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
          <input
            id="edit-description" type="text" value={description} onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm"
          />
        </div>
      </div>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      <div className="pt-2">
        <button
          type="submit" disabled={loading}
          className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200 disabled:bg-blue-400"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default EditTransactionModal;
