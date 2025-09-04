import React from 'react';
import './App.css';
import MainLayout from './components/layout/MainLayout';
import LoginView from './views/LoginView';
import SetupView from './views/SetupView';
import { useAuth } from './context/AuthContext';

function App() {
  const { currentUser, isNewUser } = useAuth();

  if (!currentUser) {
    return <LoginView />;
  }
  
  if (isNewUser) {
    return <SetupView />;
  }

  // Show the main app only if a user is logged in and has completed setup
  return <MainLayout />;
}

export default App;