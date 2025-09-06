import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';
import { Timestamp } from 'firebase/firestore';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

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

    const unsubscribeAccounts = onSnapshot(
      collection(db, basePath, 'accounts'),
      (snapshot) => {
        setAccounts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    );

    const unsubscribeTransactions = onSnapshot(
      collection(db, basePath, 'transactions'),
      (snapshot) => {
        const fetchedTransactions = snapshot.docs
          .map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              date: data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date),
              createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
            };
          })
          .sort((a, b) => {
            const dateA = a.date?.getTime() || 0;
            const dateB = b.date?.getTime() || 0;
            if (dateB !== dateA) return dateB - dateA;
            const createdA = a.createdAt?.getTime() || 0;
            const createdB = b.createdAt?.getTime() || 0;
            return createdB - createdA;
          });
        setTransactions(fetchedTransactions);
      }
    );

    const unsubscribeCategories = onSnapshot(
      collection(db, basePath, 'config'),
      (snapshot) => {
        if (!snapshot.empty) {
          const catDoc = snapshot.docs.find(doc => doc.id === 'categories');
          if (catDoc) setCategories(catDoc.data());
        }
      }
    );

    setLoading(false);
    return () => {
      unsubscribeAccounts();
      unsubscribeTransactions();
      unsubscribeCategories();
    };
  }, [currentUser]);

  const value = { accounts, transactions, categories, loading };
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
