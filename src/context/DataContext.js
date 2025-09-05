import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
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

    // Update the query to sort by creation timestamp for the most accurate "recent" order
    const unsubscribeTransactions = onSnapshot(query(collection(db, basePath, 'transactions'), orderBy('createdAt', 'desc')), (snapshot) => {
      const fetchedTransactions = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Ensure both date fields are converted to JS Date objects if they exist
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

    // This logic can be simplified as the onSnapshot listeners handle loading state implicitly.
    // However, keeping it ensures we have a clear point when all initial fetches are registered.
    const allUnsubs = [unsubscribeAccounts, unsubscribeTransactions, unsubscribeCategories];
    
    // A simple mechanism to set loading to false after the first batch of data comes in.
    const initialLoad = onSnapshot(query(collection(db, basePath, 'transactions'), orderBy('createdAt', 'desc')), () => {
        setLoading(false);
        initialLoad(); // Unsubscribe after first successful load
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

