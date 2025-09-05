import { doc, writeBatch, serverTimestamp, runTransaction, collection } from 'firebase/firestore';
import { db } from '../firebase/config';

// This function sets up a new user's initial data
export const initializeUser = async (user, initialBalances) => {
  const batch = writeBatch(db);
  const basePath = `users/${user.uid}`;

  const userProfileRef = doc(db, basePath);
  batch.set(userProfileRef, {
    email: user.email,
    name: user.displayName,
    createdAt: serverTimestamp(),
  });

  const cashAccountRef = doc(db, basePath, 'accounts', 'cash');
  batch.set(cashAccountRef, {
    name: 'Cash in Hand',
    balance: initialBalances.cash,
    type: 'cash',
  });

  const bankAccountRef = doc(db, basePath, 'accounts', 'bank');
  batch.set(bankAccountRef, {
    name: 'Bank Account',
    balance: initialBalances.bank,
    type: 'bank',
  });
  
  const categoriesRef = doc(db, basePath, 'config', 'categories');
  batch.set(categoriesRef, {
    income: ['Salary', 'Business', 'Investment Return', 'Gift'],
    expense: ['Food', 'Kirana', 'Milk', 'Subscriptions', 'Shopping', 'Transport', 'Bills', 'Health', 'Gifts']
  });

  await batch.commit();
};

// --- NEW FUNCTION TO ADD A TRANSACTION ---
export const addTransaction = async (userId, transactionData) => {
  // Use a Firestore transaction to ensure data consistency
  await runTransaction(db, async (transaction) => {
    const { accountId, type, amount } = transactionData;

    // 1. Get a reference to the account document
    const accountRef = doc(db, 'users', userId, 'accounts', accountId);
    
    // 2. Read the current account balance
    const accountDoc = await transaction.get(accountRef);
    if (!accountDoc.exists()) {
      throw new Error("Account does not exist!");
    }
    const currentBalance = accountDoc.data().balance;

    // 3. Calculate the new balance
    const newBalance = type === 'income' ? currentBalance + amount : currentBalance - amount;

    // 4. Update the account balance in the transaction
    transaction.update(accountRef, { balance: newBalance });

    // 5. Create the new transaction document
    const newTransactionRef = doc(collection(db, 'users', userId, 'transactions'));
    transaction.set(newTransactionRef, {
      ...transactionData,
      createdAt: serverTimestamp(),
    });
  });
};