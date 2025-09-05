import React from 'react';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';

// A single item in the transaction list
const TransactionItem = ({ transaction }) => {
  const isExpense = transaction.type === 'expense';
  const amountColor = isExpense ? 'text-red-500' : 'text-green-500';
  const Icon = isExpense ? ArrowUpRight : ArrowDownLeft;

  return (
    <li className="flex items-center justify-between py-4">
      <div className="flex items-center space-x-4">
        <div className={`p-2 rounded-full ${isExpense ? 'bg-red-100' : 'bg-green-100'}`}>
          <Icon size={20} className={amountColor} />
        </div>
        <div>
          <p className="font-semibold text-gray-800 dark:text-white">{transaction.category}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {transaction.date.toLocaleDateString('en-GB')}
          </p>
        </div>
      </div>
      <p className={`font-bold text-lg ${amountColor}`}>
        {isExpense ? '-' : '+'}
        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(transaction.amount)}
      </p>
    </li>
  );
};

// The list component that maps over the transactions
const TransactionList = ({ transactions }) => {
  if (!transactions || transactions.length === 0) {
    return <p className="text-center text-gray-500 dark:text-gray-400 py-8">No transactions yet.</p>;
  }

  return (
    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
      {transactions.map(tx => (
        <TransactionItem key={tx.id} transaction={tx} />
      ))}
    </ul>
  );
};

export default TransactionList;
