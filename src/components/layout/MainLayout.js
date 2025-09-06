import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import DashboardView from '../../views/DashboardView';
import TransactionsView from '../../views/TransactionsView';
import InvestmentsView from '../../views/InvestmentsView';
import LiabilitiesView from '../../views/LiabilitiesView';
import ReportsView from '../../views/ReportsView';
import SettingsView from '../../views/SettingsView';
import Modal from '../common/Modal';
import AddTransactionModal from '../transactions/AddTransactionModal';
import AddTransferModal from '../transactions/AddTransferModal';
import AddPeerTransferModal from '../transactions/AddPeerTransferModal'; // Import new modal
import { ArrowUp, ArrowDown, ArrowRightLeft, Users } from 'lucide-react';

const MainLayout = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [activeModal, setActiveModal] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const openModal = (modalConfig) => {
    setActiveModal(modalConfig);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <DashboardView />;
      case 'transactions': return <TransactionsView />;
      case 'investments': return <InvestmentsView />;
      case 'liabilities': return <LiabilitiesView />;
      case 'reports': return <ReportsView />;
      case 'settings': return <SettingsView />;
      default: return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
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

      {/* Bottom Action Bar */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
        <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => openModal({ type: 'transfer' })}
            className="flex flex-col items-center justify-center w-20 h-14 rounded-l-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ArrowRightLeft size={20} className="text-blue-500" />
            <span className="text-xs mt-1">Self Transfer</span>
          </button>
          <button
            onClick={() => openModal({ type: 'peerTransfer' })} // Updated onClick
            className="flex flex-col items-center justify-center w-20 h-14 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Users size={20} className="text-purple-500" />
            <span className="text-xs mt-1">Peer Transfer</span>
          </button>
          <div className="h-10 w-px bg-gray-200 dark:bg-gray-600"></div>
          <button
            onClick={() => openModal({ type: 'transaction', initial: 'income' })}
            className="flex flex-col items-center justify-center w-20 h-14 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ArrowDown size={20} className="text-green-500" />
            <span className="text-xs mt-1">Income</span>
          </button>
          <button
            onClick={() => openModal({ type: 'transaction', initial: 'expense' })}
            className="flex flex-col items-center justify-center w-20 h-14 rounded-r-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ArrowUp size={20} className="text-red-500" />
            <span className="text-xs mt-1">Expense</span>
          </button>
        </div>
      </div>

      <Modal isOpen={activeModal?.type === 'transaction'} onClose={closeModal} title={`Add New ${activeModal?.initial === 'income' ? 'Income' : 'Expense'}`}>
        <AddTransactionModal onClose={closeModal} initialType={activeModal?.initial} />
      </Modal>
      <Modal isOpen={activeModal?.type === 'transfer'} onClose={closeModal} title="Transfer Funds">
        <AddTransferModal onClose={closeModal} />
      </Modal>
      <Modal isOpen={activeModal?.type === 'peerTransfer'} onClose={closeModal} title="Peer Transfer">
        <AddPeerTransferModal onClose={closeModal} />
      </Modal>
    </div>
  );
};

export default MainLayout;