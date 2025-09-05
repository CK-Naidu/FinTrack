import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import DashboardView from '../../views/DashboardView';
import TransactionsView from '../../views/TransactionsView';
import InvestmentsView from '../../views/InvestmentsView';
import ReportsView from '../../views/ReportsView';
import SettingsView from '../../views/SettingsView';
import Modal from '../common/Modal';
import AddTransactionModal from '../transactions/AddTransactionModal';
import { Plus } from 'lucide-react';

const MainLayout = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'transactions':
        return <TransactionsView />;
      case 'investments':
        return <InvestmentsView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto">
          {renderView()}
        </main>
        <Footer />
      </div>

      {/* Floating Action Button - Moved outside the main scrolling area and position changed to 'fixed' */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed right-8 bottom-8 flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 z-40"
        aria-label="Add Transaction"
      >
        <Plus size={28} />
      </button>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Add New Transaction"
      >
        <AddTransactionModal onClose={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default MainLayout;