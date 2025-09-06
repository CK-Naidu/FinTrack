import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  CandlestickChart,
  BarChart2,
  Settings,
  Wallet,
  HandHelping,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../firebase/config';
import { signOut } from 'firebase/auth';

const Sidebar = ({ activeView, setActiveView, isOpen, setIsOpen }) => {
  const { currentUser } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'investments', label: 'Investments', icon: CandlestickChart },
    { id: 'liabilities', label: 'Liabilities', icon: HandHelping },
    { id: 'reports', label: 'Reports', icon: BarChart2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleSignOut = () => {
    signOut(auth).catch(error => console.error("Sign out error", error));
  };
  
  const handleNavClick = (viewId) => {
    setActiveView(viewId);
    setIsOpen(false);
  };

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-30 w-64 flex-col justify-between 
      bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 
      p-4 transform transition-transform duration-300 ease-in-out
      md:relative md:translate-x-0 md:flex
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
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
                onClick={() => handleNavClick(item.id)}
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

      <div>
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
        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">
          Developed by Kandi Chenna Kesava Naidu
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;