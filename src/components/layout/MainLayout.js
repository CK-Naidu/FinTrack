import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import DashboardView from '../../views/DashboardView';
import TransactionsView from '../../views/TransactionsView';
import InvestmentsView from '../../views/InvestmentsView';
import ReportsView from '../../views/ReportsView';
import SettingsView from '../../views/SettingsView';

// This component replaces the old logic from App.js
const MainLayout = () => {
  const [activeView, setActiveView] = useState('dashboard');

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
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {renderView()}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
