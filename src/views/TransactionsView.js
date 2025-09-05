import React from 'react';
import { useData } from '../context/DataContext';
import TransactionList from '../components/transactions/TransactionList';

const TransactionsView = () => {
  const { transactions, loading } = useData();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Transactions</h1>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
        {loading ? (
          <p className="text-center text-gray-500 dark:text-gray-400">Loading transactions...</p>
        ) : (
          <TransactionList transactions={transactions} />
        )}
      </div>
    </div>
  );
};

export default TransactionsView;