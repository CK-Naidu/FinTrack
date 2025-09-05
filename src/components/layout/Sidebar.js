import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  CandlestickChart,
  BarChart2,
  Settings,
  Wallet,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../firebase/config';
import { signOut } from 'firebase/auth';

const Sidebar = ({ activeView, setActiveView }) => {
  const { currentUser } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'investments', label: 'Investments', icon: CandlestickChart },
    { id: 'reports', label: 'Reports', icon: BarChart2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleSignOut = () => {
    signOut(auth).catch(error => console.error("Sign out error", error));
  };

  return (
    <aside className="hidden md:flex w-64 flex-col justify-between bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
      <div>
        <div className="flex items-center space-x-3 mb-8">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Wallet className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">FinTrack</h1>
        </div>
        <nav className="flex flex-col space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex items-center space-x-3 px-4 py-2 text-left rounded-md transition-colors duration-200 ${
                  activeView === item.id
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex items-center space-x-3 p-2">
          <img
            src={currentUser?.photoURL || 'https://placehold.co/40x40'}
            alt="User"
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-white">{currentUser?.displayName}</p>
            <button onClick={handleSignOut} className="text-xs text-red-500 hover:underline">
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

