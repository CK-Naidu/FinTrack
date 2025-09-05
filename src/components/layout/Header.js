import React, { useState, useEffect } from 'react';
import { Sun, Moon, Menu } from 'lucide-react';

const Header = ({ onMenuClick }) => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = theme === 'dark';
    root.classList.toggle('dark', isDark);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <header className="flex items-center justify-between h-16 px-4 md:px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      {/* Hamburger Menu Button for Mobile */}
      <button 
        onClick={onMenuClick}
        className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors md:hidden"
        aria-label="Open menu"
      >
        <Menu size={24} />
      </button>

      {/* Spacer to push theme toggle to the right */}
      <div className="flex-grow"></div>

      {/* Theme Toggle Button */}
      <button 
        onClick={toggleTheme}
        className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Toggle theme"
      >
        <Sun size={20} className="dark:hidden" />
        <Moon size={20} className="hidden dark:block" />
      </button>
    </header>
  );
};

export default Header;