import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateAccountName } from '../../services/dbService';

const EditAccountModal = ({ account, onClose }) => {
  const { currentUser } = useAuth();
  const [accountName, setAccountName] = useState(account.name);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!accountName.trim()) {
      setError('Account name cannot be empty.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      await updateAccountName(currentUser.uid, account.id, accountName.trim());
      onClose();
    } catch (err) {
      console.error("Failed to update account:", err);
      setError('Failed to update account. Please try again.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="edit-acc-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Account Name</label>
        <input
          id="edit-acc-name" type="text" value={accountName} onChange={(e) => setAccountName(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="pt-2">
        <button type="submit" disabled={loading} className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-400">
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default EditAccountModal;