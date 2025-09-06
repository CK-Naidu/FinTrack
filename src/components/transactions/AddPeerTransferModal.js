import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { addPeerTransfer } from '../../services/dbService';
import { Timestamp } from 'firebase/firestore';

const AddPeerTransferModal = ({ onClose }) => {
  const { currentUser } = useAuth();
  const { accounts } = useData();
  const [amount, setAmount] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [accountId, setAccountId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    // Default to first bank account if exists
    const bankAccount = accounts.find(acc => acc.type === 'bank');
    if (bankAccount) {
      setAccountId(bankAccount.id);
    } else if (accounts.length > 0) {
      setAccountId(accounts[0].id);
    }
  }, [accounts]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !recipientName || !accountId || parseFloat(amount) <= 0) {
      setError('Please fill out all fields with a valid amount.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const transferData = {
        amount: parseFloat(amount),
        recipientName,
        accountId,
        date: Timestamp.fromDate(new Date(date)),
        description,
      };

      await addPeerTransfer(currentUser.uid, transferData);
      onClose();
    } catch (err) {
      console.error("Peer transfer failed:", err);
      setError(err.message || 'Failed to process payment. Please try again.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="recipient-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Recipient's Name
        </label>
        <input
          id="recipient-name"
          type="text"
          value={recipientName}
          onChange={(e) => setRecipientName(e.target.value)}
          placeholder="e.g., John Doe"
          required
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="peer-amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Amount (₹)
          </label>
          <input
            id="peer-amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm"
          />
        </div>

        <div>
          <label htmlFor="peer-account" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            From Account
          </label>
          <select
            id="peer-account"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm"
          >
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>
                {acc.name} (Balance: ₹{acc.balance})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="peer-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Date
          </label>
          <input
            id="peer-date"
            type="date"
            value={date}
            max={today}
            onChange={(e) => setDate(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm"
          />
        </div>

        <div>
          <label htmlFor="peer-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <input
            id="peer-description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="(Optional)"
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm"
          />
        </div>
      </div>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 transition-colors disabled:bg-purple-400"
        >
          {loading ? 'Processing...' : 'Send Payment'}
        </button>
      </div>
    </form>
  );
};

export default AddPeerTransferModal;
