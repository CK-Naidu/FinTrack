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
import AddTransferModal from '../transactions/AddTransferModal';
import { Plus, X, ArrowRightLeft, Receipt } from 'lucide-react';

const MainLayout = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [activeModal, setActiveModal] = useState(null);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for mobile sidebar

  const openModal = (modalType) => {
    setActiveModal(modalType);
    setIsFabOpen(false);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <DashboardView />;
      case 'transactions': return <TransactionsView />;
      case 'investments': return <InvestmentsView />;
      case 'reports': return <ReportsView />;
      case 'settings': return <SettingsView />;
      default: return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {renderView()}
        </main>
        <Footer />
      </div>

      {/* Floating Action Button Speed Dial */}
      <div className="fixed right-6 bottom-6 md:right-8 md:bottom-8 z-40 flex flex-col items-center space-y-3">
        {isFabOpen && (
          <div className="flex flex-col items-center space-y-3 transition-all duration-300">
            <div className="flex items-center space-x-2">
              <span className="bg-white dark:bg-gray-700 text-sm px-2 py-1 rounded-md shadow text-gray-700 dark:text-gray-200">Transfer</span>
              <button
                onClick={() => openModal('transfer')}
                className="flex items-center justify-center w-12 h-12 bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-transform transform hover:scale-110"
                aria-label="Add Transfer"
              >
                <ArrowRightLeft size={22} />
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <span className="bg-white dark:bg-gray-700 text-sm px-2 py-1 rounded-md shadow text-gray-700 dark:text-gray-200">Transaction</span>
              <button
                onClick={() => openModal('transaction')}
                className="flex items-center justify-center w-12 h-12 bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-transform transform hover:scale-110"
                aria-label="Add Transaction"
              >
                <Receipt size={22} />
              </button>
            </div>
          </div>
        )}
        <button
          onClick={() => setIsFabOpen(!isFabOpen)}
          className="flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Toggle Menu"
        >
          {isFabOpen ? <X size={28} /> : <Plus size={28} />}
        </button>
      </div>

      <Modal isOpen={activeModal === 'transaction'} onClose={closeModal} title="Add New Transaction">
        <AddTransactionModal onClose={closeModal} />
      </Modal>
      <Modal isOpen={activeModal === 'transfer'} onClose={closeModal} title="Transfer Funds">
        <AddTransferModal onClose={closeModal} />
      </Modal>
    </div>
  );
};

export default MainLayout;