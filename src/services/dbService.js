import { doc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase/config';

// This function sets up a new user's initial data in a single batch operation
export const initializeUser = async (user, initialBalances) => {
  const batch = writeBatch(db);

  // 1. Create a user profile document to mark setup as complete
  const userProfileRef = doc(db, 'users', user.uid);
  batch.set(userProfileRef, {
    email: user.email,
    name: user.displayName,
    createdAt: new Date(),
  });

  // 2. Set initial account balances
  const cashAccountRef = doc(db, 'users', user.uid, 'accounts', 'cash');
  batch.set(cashAccountRef, {
    name: 'Cash in Hand',
    balance: initialBalances.cash,
    type: 'cash',
  });

  const bankAccountRef = doc(db, 'users', user.uid, 'accounts', 'bank');
  batch.set(bankAccountRef, {
    name: 'Bank Account',
    balance: initialBalances.bank,
    type: 'bank',
  });
  
  // 3. Set default categories (optional, can be expanded)
  const categoriesRef = doc(db, 'users', user.uid, 'config', 'categories');
  batch.set(categoriesRef, {
    income: ['Salary', 'Business', 'Investment Return', 'Gift'],
    expense: ['Food', 'Kirana', 'Milk', 'Subscriptions', 'Shopping', 'Transport', 'Bills', 'Health', 'Gifts']
  });

  // Commit all operations at once
  await batch.commit();
};
