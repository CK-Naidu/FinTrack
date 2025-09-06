import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Modal from '../components/common/Modal';
import AddAccountModal from '../components/accounts/AddAccountModal';
import EditAccountModal from '../components/accounts/EditAccountModal';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { deleteAccount } from '../services/dbService';

const SettingsView = () => {
  const { currentUser } = useAuth();
  const { accounts } = useData();
  const [activeModal, setActiveModal] = useState(null); // 'add', 'edit', 'delete'
  const [selectedAccount, setSelectedAccount] = useState(null);

  const openModal = (type, account = null) => {
    setSelectedAccount(account);
    setActiveModal(type);
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedAccount(null);
  };

  const handleDelete = async () => {
    if (selectedAccount) {
      try {
        await deleteAccount(currentUser.uid, selectedAccount);
      } catch (error) {
        console.error(error);
        alert(error.message); // Show the user why it failed
      }
    }
    closeModal();
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Settings</h1>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-white">Your Accounts</h2>
          <button
            onClick={() => openModal('add')}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            <span>Add Account</span>
          </button>
        </div>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {accounts.map(account => (
            <li key={account.id} className="py-3 flex justify-between items-center">
              <div>
                <span className="font-medium">{account.name}</span>
                <span className="text-xs text-gray-400 ml-2">({account.type})</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-600 dark:text-gray-300">
                  {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(account.balance)}
                </span>
                {/* Allow editing of all accounts except 'cash' */}
                {account.type !== 'cash' && (
                  <button onClick={() => openModal('edit', account)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><Edit size={16} /></button>
                )}
                {/* Only allow deleting non-default bank accounts */}
                {account.type !== 'cash' && account.id !== 'bank' && (
                  <button onClick={() => openModal('delete', account)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-red-500"><Trash2 size={16} /></button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <Modal isOpen={activeModal === 'add'} onClose={closeModal} title="Add New Bank Account">
        <AddAccountModal onClose={closeModal} />
      </Modal>
      {selectedAccount && (
        <>
          <Modal isOpen={activeModal === 'edit'} onClose={closeModal} title="Edit Account Name">
            <EditAccountModal account={selectedAccount} onClose={closeModal} />
          </Modal>
          <ConfirmationModal
            isOpen={activeModal === 'delete'}
            onClose={closeModal}
            onConfirm={handleDelete}
            title="Delete Account"
            message={`Are you sure you want to delete the account "${selectedAccount.name}"? This action cannot be undone.`}
          />
        </>
      )}
    </div>
  );
};

export default SettingsView;