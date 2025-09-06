import React from 'react';
import { useData } from '../context/DataContext';
import ExpenseBreakdownChart from '../components/reports/ExpenseBreakdownChart';

const ReportsView = () => {
  const { transactions, loading } = useData();

  // Process transactions to get expense data for the chart
  const expenseData = transactions
    .filter(tx => tx.type === 'expense')
    .reduce((acc, currentTx) => {
      const existingCategory = acc.find(item => item.name === currentTx.category);
      if (existingCategory) {
        existingCategory.value += currentTx.amount;
      } else {
        acc.push({ name: currentTx.category, value: currentTx.amount });
      }
      return acc;
    }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Reports</h1>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-white mb-4">Expense Breakdown</h2>
        {loading ? (
          <p className="text-center text-gray-500 dark:text-gray-400">Loading chart data...</p>
        ) : (
          <ExpenseBreakdownChart data={expenseData} />
        )}
      </div>
    </div>
  );
};

export default ReportsView;