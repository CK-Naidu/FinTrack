import { doc, writeBatch, serverTimestamp, runTransaction, collection, Timestamp } from 'firebase/firestore';
// Corrected path to go up one directory to the src root
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

// Function to add an income or expense transaction
export const addTransaction = async (userId, transactionData) => {
  await runTransaction(db, async (transaction) => {
    const { accountId, type, amount } = transactionData;
    const accountRef = doc(db, 'users', userId, 'accounts', accountId);
    
    const accountDoc = await transaction.get(accountRef);
    if (!accountDoc.exists()) throw new Error("Account does not exist!");
    
    const currentBalance = accountDoc.data().balance;
    const newBalance = type === 'income' ? currentBalance + amount : currentBalance - amount;

    transaction.update(accountRef, { balance: newBalance });

    const newTransactionRef = doc(collection(db, 'users', userId, 'transactions'));
    transaction.set(newTransactionRef, {
      ...transactionData,
      createdAt: serverTimestamp(),
    });
  });
};

// Function to add an internal transfer
export const addTransfer = async (userId, transferData) => {
  await runTransaction(db, async (transaction) => {
    const { fromAccountId, toAccountId, amount, date, description } = transferData;

    const fromAccountRef = doc(db, 'users', userId, 'accounts', fromAccountId);
    const toAccountRef = doc(db, 'users', userId, 'accounts', toAccountId);

    const fromAccountDoc = await transaction.get(fromAccountRef);
    const toAccountDoc = await transaction.get(toAccountRef);

    if (!fromAccountDoc.exists() || !toAccountDoc.exists()) {
      throw new Error("One or both accounts do not exist!");
    }

    const fromAccountBalance = fromAccountDoc.data().balance;
    const toAccountBalance = toAccountDoc.data().balance;
    
    if (fromAccountBalance < amount) {
      throw new Error("Insufficient funds for transfer.");
    }

    const newFromBalance = fromAccountBalance - amount;
    const newToBalance = toAccountBalance + amount;

    transaction.update(fromAccountRef, { balance: newFromBalance });
    transaction.update(toAccountRef, { balance: newToBalance });

    const newTransactionRef = doc(collection(db, 'users', userId, 'transactions'));
    transaction.set(newTransactionRef, {
      type: 'transfer',
      amount,
      from: fromAccountDoc.data().name,
      to: toAccountDoc.data().name,
      date: Timestamp.fromDate(new Date(date)),
      description,
      createdAt: serverTimestamp(),
    });
  });
};