import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
// Corrected path to go up one directory to the src root
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';

const DataContext = createContext();

export const useData = () => {
  return useContext(DataContext);
};

export const DataProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState({ income: [], expense: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      setAccounts([]);
      setTransactions([]);
      setCategories({ income: [], expense: [] });
      return;
    }

    setLoading(true);
    const basePath = `users/${currentUser.uid}`;

    const unsubscribeAccounts = onSnapshot(query(collection(db, basePath, 'accounts')), (snapshot) => {
      setAccounts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubscribeTransactions = onSnapshot(query(collection(db, basePath, 'transactions'), orderBy('createdAt', 'desc')), (snapshot) => {
      const fetchedTransactions = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.date?.toDate(),
          createdAt: data.createdAt?.toDate(),
        };
      });
      setTransactions(fetchedTransactions);
    });
    
    const unsubscribeCategories = onSnapshot(collection(db, basePath, 'config'), (snapshot) => {
      if (!snapshot.empty) {
        const catDoc = snapshot.docs.find(doc => doc.id === 'categories');
        if (catDoc) {
          setCategories(catDoc.data());
        }
      }
    });

    const allUnsubs = [unsubscribeAccounts, unsubscribeTransactions, unsubscribeCategories];
    
    // Unsubscribe after the first data load to set loading to false
    const initialLoad = onSnapshot(query(collection(db, basePath, 'transactions'), orderBy('createdAt', 'desc')), () => {
        setLoading(false);
        initialLoad(); 
    });

    return () => {
      allUnsubs.forEach(unsub => unsub());
    };
  }, [currentUser]);

  const value = {
    accounts,
    transactions,
    categories,
    loading,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};