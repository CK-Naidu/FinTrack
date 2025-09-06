import { 
  doc, writeBatch, serverTimestamp, runTransaction, collection, Timestamp, addDoc, getDocs, query, where, deleteDoc 
} from 'firebase/firestore';
import { db } from '../firebase/config';

// --- ACCOUNT MANAGEMENT ---
export const addAccount = async (userId, accountData) => {
  const accountsRef = collection(db, 'users', userId, 'accounts');
  await addDoc(accountsRef, {
    ...accountData,
    createdAt: serverTimestamp(),
  });
};

export const updateAccountName = async (userId, accountId, newName) => {
  const batch = writeBatch(db);
  const basePath = `users/${userId}`;

  const accountRef = doc(db, basePath, 'accounts', accountId);
  batch.update(accountRef, { name: newName });

  const transactionsQuery = query(
    collection(db, basePath, 'transactions'),
    where('accountId', '==', accountId)
  );
  const querySnapshot = await getDocs(transactionsQuery);
  querySnapshot.forEach(doc => {
    batch.update(doc.ref, { accountName: newName });
  });

  await batch.commit();
};

export const deleteAccount = async (userId, accountId) => {
  const basePath = `users/${userId}`;
  const transactionsQuery = query(
    collection(db, basePath, 'transactions'),
    where('accountId', '==', accountId)
  );
  const querySnapshot = await getDocs(transactionsQuery);
  if (!querySnapshot.empty) throw new Error("Cannot delete account. It has associated transactions.");

  const accountRef = doc(db, basePath, 'accounts', accountId);
  await deleteDoc(accountRef);
};

// --- USER INITIALIZATION ---
export const initializeUser = async (user, initialBalances) => {
  const batch = writeBatch(db);
  const basePath = `users/${user.uid}`;

  const userProfileRef = doc(db, basePath);
  batch.set(userProfileRef, { email: user.email, name: user.displayName, createdAt: serverTimestamp() });

  const cashAccountRef = doc(db, basePath, 'accounts', 'cash');
  batch.set(cashAccountRef, { name: 'Cash in Hand', balance: initialBalances.cash, type: 'cash' });

  const bankAccountRef = doc(db, basePath, 'accounts', 'bank');
  batch.set(bankAccountRef, { name: 'Bank Account', balance: initialBalances.bank, type: 'bank' });

  const categoriesRef = doc(db, basePath, 'config', 'categories');
  batch.set(categoriesRef, {
    income: ['Salary', 'Business', 'Investment Return', 'Gift'],
    expense: ['Food', 'Kirana', 'Milk', 'Subscriptions', 'Shopping', 'Transport', 'Bills', 'Health', 'Gifts', 'Peer Transfer']
  });

  await batch.commit();
};

// --- TRANSACTION MANAGEMENT ---
export const addTransaction = async (userId, transactionData) => {
  await runTransaction(db, async (transaction) => {
    const { accountId, type, amount, date } = transactionData;
    const accountRef = doc(db, 'users', userId, 'accounts', accountId);

    const accountDoc = await transaction.get(accountRef);
    if (!accountDoc.exists()) throw new Error("Account does not exist!");

    const newBalance = type === 'income' 
      ? accountDoc.data().balance + amount 
      : accountDoc.data().balance - amount;
    transaction.update(accountRef, { balance: newBalance });

    const newTxRef = doc(collection(db, 'users', userId, 'transactions'));
    transaction.set(newTxRef, {
      ...transactionData,
      date: date instanceof Timestamp ? date : Timestamp.fromDate(new Date(date)),
      createdAt: serverTimestamp(),
    });
  });
};

// --- PEER TRANSFER ---
export const addPeerTransfer = async (userId, transferData) => {
  const { accountId, amount, recipientName, date, description } = transferData;

  await runTransaction(db, async (transaction) => {
    const accountRef = doc(db, 'users', userId, 'accounts', accountId);
    const accountDoc = await transaction.get(accountRef);
    if (!accountDoc.exists()) throw new Error("Selected account does not exist!");
    if (accountDoc.data().balance < amount) throw new Error("Insufficient funds for transfer.");

    // Deduct from selected account
    transaction.update(accountRef, { balance: accountDoc.data().balance - amount });

    // Create peer transfer transaction
    const newTxRef = doc(collection(db, 'users', userId, 'transactions'));
    transaction.set(newTxRef, {
      type: 'peer-transfer',
      category: 'Peer Transfer',
      amount,
      accountId,
      fromAccountId: accountId,          // store the “from” account
      from: accountDoc.data().name,      // store from account name
      recipient: recipientName,
      description,
      date: date instanceof Timestamp ? date : Timestamp.fromDate(new Date(date)),
      createdAt: serverTimestamp(),
    });
  });
};

// --- OTHER TRANSACTIONS ---
export const addTransfer = async (userId, transferData) => {
  await runTransaction(db, async (transaction) => {
    const { fromAccountId, toAccountId, amount, date, description } = transferData;

    const fromRef = doc(db, 'users', userId, 'accounts', fromAccountId);
    const toRef = doc(db, 'users', userId, 'accounts', toAccountId);

    const [fromDoc, toDoc] = await Promise.all([transaction.get(fromRef), transaction.get(toRef)]);
    if (!fromDoc.exists() || !toDoc.exists()) throw new Error("One or both accounts do not exist!");
    if (fromDoc.data().balance < amount) throw new Error("Insufficient funds for transfer.");

    transaction.update(fromRef, { balance: fromDoc.data().balance - amount });
    transaction.update(toRef, { balance: toDoc.data().balance + amount });

    const newTxRef = doc(collection(db, 'users', userId, 'transactions'));
    transaction.set(newTxRef, {
      type: 'transfer',
      amount,
      from: fromDoc.data().name,
      to: toDoc.data().name,
      fromAccountId,
      toAccountId,
      date: Timestamp.fromDate(new Date(date)),
      description,
      createdAt: serverTimestamp(),
    });
  });
};

export const updateTransaction = async (userId, oldTx, newTxData) => {
  await runTransaction(db, async (transaction) => {
    const txRef = doc(db, 'users', userId, 'transactions', oldTx.id);

    if (oldTx.type === 'transfer') {
      const oldFromRef = doc(db, 'users', userId, 'accounts', oldTx.fromAccountId);
      const oldToRef = doc(db, 'users', userId, 'accounts', oldTx.toAccountId);
      const newFromRef = doc(db, 'users', userId, 'accounts', newTxData.fromAccountId);
      const newToRef = doc(db, 'users', userId, 'accounts', newTxData.toAccountId);

      const [oldFromDoc, oldToDoc, newFromDoc, newToDoc] = await Promise.all([
        transaction.get(oldFromRef),
        transaction.get(oldToRef),
        transaction.get(newFromRef),
        transaction.get(newToRef),
      ]);

      if (!oldFromDoc.exists() || !oldToDoc.exists() || !newFromDoc.exists() || !newToDoc.exists())
        throw new Error("One or more accounts not found!");

      transaction.update(oldFromRef, { balance: oldFromDoc.data().balance + oldTx.amount });
      transaction.update(oldToRef, { balance: oldToDoc.data().balance - oldTx.amount });
      transaction.update(newFromRef, { balance: newFromDoc.data().balance - newTxData.amount });
      transaction.update(newToRef, { balance: newToDoc.data().balance + newTxData.amount });

      transaction.update(txRef, { 
        ...newTxData,
        from: newFromDoc.data().name,
        to: newToDoc.data().name,
        date: newTxData.date instanceof Timestamp ? newTxData.date : Timestamp.fromDate(new Date(newTxData.date)),
      });

    } else {
      const accountRef = doc(db, 'users', userId, 'accounts', newTxData.accountId);
      const accountDoc = await transaction.get(accountRef);
      if (!accountDoc.exists()) throw new Error("Account not found!");

      const currentBalance = oldTx.type === 'income' 
        ? accountDoc.data().balance - oldTx.amount 
        : accountDoc.data().balance + oldTx.amount;

      const newBalance = newTxData.type === 'income' 
        ? currentBalance + newTxData.amount 
        : currentBalance - newTxData.amount;

      transaction.update(accountRef, { balance: newBalance });
      transaction.update(txRef, { 
        ...newTxData,
        date: newTxData.date instanceof Timestamp ? newTxData.date : Timestamp.fromDate(new Date(newTxData.date)),
      });
    }
  });
};

export const deleteTransaction = async (userId, txToDelete) => {
  await runTransaction(db, async (transaction) => {
    const { id, type, amount, accountId, fromAccountId, toAccountId } = txToDelete;

    const txRef = doc(db, 'users', userId, 'transactions', id);
    transaction.delete(txRef);

    if (type === 'income' || type === 'expense' || type === 'peer-transfer') {
      const accountRef = doc(db, 'users', userId, 'accounts', accountId);
      const accountDoc = await transaction.get(accountRef);
      if (accountDoc.exists()) {
        const newBalance = type === 'income' 
          ? accountDoc.data().balance - amount 
          : accountDoc.data().balance + amount;
        transaction.update(accountRef, { balance: newBalance });
      }
    } else if (type === 'transfer') {
      const fromRef = doc(db, 'users', userId, 'accounts', fromAccountId);
      const toRef = doc(db, 'users', userId, 'accounts', toAccountId);

      const [fromDoc, toDoc] = await Promise.all([transaction.get(fromRef), transaction.get(toRef)]);
      if (fromDoc.exists() && toDoc.exists()) {
        transaction.update(fromRef, { balance: fromDoc.data().balance + amount });
        transaction.update(toRef, { balance: toDoc.data().balance - amount });
      }
    }
  });
};
