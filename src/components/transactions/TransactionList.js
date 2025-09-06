import React, { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, ArrowRightLeft, MoreVertical, Edit, Trash2, Users, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { deleteTransaction } from '../../services/dbService';
import { useDetectOutsideClick } from '../../hooks/useDetectOutsideClick';
import ConfirmationModal from '../common/ConfirmationModal';
import Modal from '../common/Modal';
import EditTransactionModal from './EditTransactionModal';

// Dropdown Menu for Edit/Delete actions
const ActionMenu = ({ onAction, transactionType }) => {
  const { triggerRef, nodeRef, isActive, toggle } = useDetectOutsideClick(false);

  const handleAction = (actionType) => {
    onAction(actionType);
    toggle(false); // Close the menu
  };

  // Do not render the menu for system events
  if (transactionType === 'event') {
    return <div className="w-10 h-10"></div>; // Placeholder for alignment
  }

  return (
    <div className="relative">
      <button ref={triggerRef} onClick={toggle} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
        <MoreVertical size={20} />
      </button>
      {isActive && (
        <div ref={nodeRef} className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-lg z-10">
          <button onClick={() => handleAction('edit')} className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
            <Edit size={14} />
            <span>Edit</span>
          </button>
          <button onClick={() => handleAction('delete')} className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/50">
            <Trash2 size={14} />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
};

// A single item in the transaction list
const TransactionItem = ({ transaction, onAction }) => {
  const { type, category, date, from, to, recipient, accountName, amount, description, title: eventTitle } = transaction;
  const isExpense = type === 'expense';
  const isIncome = type === 'income';
  const isTransfer = type === 'transfer';
  const isPeerTransfer = category === 'Peer Transfer';
  const isEvent = type === 'event';

  let Icon, amountColor, title, subtitle;
  const formattedDate = date ? date.toLocaleDateString('en-GB') : 'No Date';

  // Logic to determine what to display for each transaction type
  if (isEvent) {
    Icon = Info;
    amountColor = 'text-blue-500';
    title = eventTitle; // "Account Created: HDFC"
    subtitle = formattedDate;
  } else if (isPeerTransfer) {
    Icon = Users;
    amountColor = 'text-red-500';
    title = `Paid to ${recipient}`;
    subtitle = `${formattedDate} · ${accountName || ''}`;
  } else if (isExpense) {
    Icon = ArrowUpRight;
    amountColor = 'text-red-500';
    title = category;
    subtitle = `${formattedDate} · ${accountName || ''}`;
  } else if (isIncome) {
    Icon = ArrowDownLeft;
    amountColor = 'text-green-500';
    title = category;
    subtitle = `${formattedDate} · ${accountName || ''}`;
  } else if (isTransfer) {
    Icon = ArrowRightLeft;
    amountColor = 'text-gray-500 dark:text-gray-400';
    title = 'Self Transfer';
    subtitle = `${from} → ${to}`;
  } else {
    // Fallback for any unknown transaction type to prevent crashing
    Icon = Info;
    amountColor = 'text-gray-500';
    title = "Unknown Transaction";
    subtitle = formattedDate;
  }
  
  return (
    <li className="flex items-center justify-between py-4">
      <div className="flex items-center space-x-4 flex-1 min-w-0">
        <div className={`p-2 rounded-full ${
          isExpense ? 'bg-red-100 dark:bg-red-900/50' : 
          isIncome ? 'bg-green-100 dark:bg-green-900/50' : 
          isEvent ? 'bg-blue-100 dark:bg-blue-900/50' :
          'bg-gray-100 dark:bg-gray-700'
        }`}>
          <Icon size={20} className={amountColor} />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-gray-800 dark:text-white truncate">{title}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
          {description && (<p className="text-xs text-gray-400 italic mt-1 truncate">{description}</p>)}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {!isEvent && (
          <p className={`font-bold text-lg whitespace-nowrap ${amountColor}`}>
            {isExpense ? '-' : isIncome ? '+' : ''}
            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount)}
          </p>
        )}
        <ActionMenu onAction={(actionType) => onAction(actionType, transaction)} transactionType={type} />
      </div>
    </li>
  );
};

// The list component that manages state for actions
const TransactionList = ({ transactions }) => {
  const { currentUser } = useAuth();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);

  const handleAction = (actionType, transaction) => {
    setSelectedTx(transaction);
    if (actionType === 'delete') {
      setIsConfirmOpen(true);
    } else if (actionType === 'edit') {
      if (transaction.type === 'transfer') {
        alert("Editing self transfers is not supported yet.");
        return;
      }
      setIsEditOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedTx) {
      try {
        await deleteTransaction(currentUser.uid, selectedTx);
      } catch (error) {
        console.error("Failed to delete transaction:", error);
        alert("Could not delete the transaction. Please try again.");
      } finally {
        setIsConfirmOpen(false);
        setSelectedTx(null);
      }
    }
  };

  if (!transactions || transactions.length === 0) {
    return <p className="text-center text-gray-500 dark:text-gray-400 py-8">No transactions yet.</p>;
  }

  return (
    <>
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {transactions.map(tx => (
          <TransactionItem key={tx.id} transaction={tx} onAction={handleAction} />
        ))}
      </ul>
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Transaction"
        message="Are you sure? This will permanently delete the transaction and reverse its effect on your account balance."
      />
      {selectedTx && (
        <Modal 
          isOpen={isEditOpen} 
          onClose={() => setIsEditOpen(false)} 
          title="Edit Transaction"
        >
          <EditTransactionModal 
            transaction={selectedTx} 
            onClose={() => setIsEditOpen(false)} 
          />
        </Modal>
      )}
    </>
  );
};

export default TransactionList;