import React from 'react';
import { useData } from '../context/DataContext';
import { Landmark, Wallet, IndianRupee } from 'lucide-react';
import TransactionList from '../components/transactions/TransactionList';

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
  const { accounts, transactions, loading } = useData();

  // Calculate total balance
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const formattedTotalBalance = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totalBalance);

  // Sort accounts to show Cash first, then others alphabetically
  const sortedAccounts = [...accounts].sort((a, b) => {
    if (a.type === 'cash') return -1;
    if (b.type === 'cash') return 1;
    return a.name.localeCompare(b.name);
  });

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Balance"
          value={formattedTotalBalance}
          icon={<IndianRupee size={24} />}
          loading={loading}
        />
        {/* Map over the newly sorted accounts array */}
        {sortedAccounts.map(account => (
          <StatCard
            key={account.id}
            title={account.name}
            value={new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(account.balance)}
            icon={account.type === 'cash' ? <Wallet size={24} /> : <Landmark size={24} />}
            loading={loading}
          />
        ))}
      </div>

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