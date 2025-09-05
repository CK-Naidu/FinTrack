import React from 'react';
import { useData } from '../context/DataContext';
import { Landmark, Wallet } from 'lucide-react';
import TransactionList from '../components/transactions/TransactionList'; // Import the TransactionList

// A reusable card component for the dashboard
const StatCard = ({ title, value, icon, loading }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
      {loading ? (
        <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse mt-2"></div>
      ) : (
        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
      )}
    </div>
    <div className="text-blue-500 bg-blue-100 dark:bg-gray-700 p-3 rounded-full">
      {icon}
    </div>
  </div>
);

const DashboardView = () => {
  const { accounts, transactions, loading } = useData(); // Get transactions from context

  const cashAccount = accounts.find(acc => acc.type === 'cash');
  const bankAccount = accounts.find(acc => acc.type === 'bank');

  const cashBalance = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(cashAccount?.balance || 0);
  const bankBalance = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(bankAccount?.balance || 0);
  const totalBalance = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format((cashAccount?.balance || 0) + (bankAccount?.balance || 0));

  // Get the 5 most recent transactions
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Cash in Hand" 
          value={cashBalance} 
          icon={<Wallet size={24} />} 
          loading={loading}
        />
        <StatCard 
          title="Bank Account" 
          value={bankBalance} 
          icon={<Landmark size={24} />} 
          loading={loading}
        />
        <StatCard 
          title="Total Balance" 
          value={totalBalance} 
          icon={<Landmark size={24} />}
          loading={loading}
        />
      </div>

      {/* Display recent transactions */}
      <div className="mt-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-white mb-4">Recent Activity</h2>
          {loading ? (
            <p className="text-center text-gray-500">Loading activity...</p>
          ) : (
            <TransactionList transactions={recentTransactions} />
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;