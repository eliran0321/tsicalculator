import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { db } from './firebase';

// User Management
export const saveUser = async (username, password, userDetails) => {
  try {
    await setDoc(doc(db, 'users', username), {
      ...userDetails,
      password,
      createdAt: serverTimestamp(),
      status: 'pending'
    });
    return true;
  } catch (error) {
    console.error('Error saving user:', error);
    return false;
  }
};

export const getUser = async (username) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', username));
    return userDoc.exists() ? userDoc.data() : null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

export const getAllUsers = async () => {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const users = [];
    usersSnapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return users;
  } catch (error) {
    console.error('Error getting all users:', error);
    return [];
  }
};

export const updateUserStatus = async (username, status) => {
  try {
    await updateDoc(doc(db, 'users', username), {
      status,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating user status:', error);
    return false;
  }
};

export const deleteUser = async (username) => {
  try {
    await deleteDoc(doc(db, 'users', username));
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    return false;
  }
};

// Formula Management
export const saveFormulas = async (formulasData) => {
  try {
    await setDoc(doc(db, 'settings', 'formulas'), {
      formulas: formulasData,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error saving formulas:', error);
    return false;
  }
};

export const loadFormulas = async () => {
  try {
    const formulasDoc = await getDoc(doc(db, 'settings', 'formulas'));
    return formulasDoc.exists() ? formulasDoc.data().formulas : null;
  } catch (error) {
    console.error('Error loading formulas:', error);
    return null;
  }
};

// Trading Journal Management - מתוקן!
export const saveTrade = async (userId, tradeData) => {
  try {
    console.log('Saving trade for user:', userId, tradeData); // דיבוג
    const tradeRef = doc(collection(db, 'trades'));
    await setDoc(tradeRef, {
      userId,
      ...tradeData,
      createdAt: serverTimestamp()
    });
    console.log('Trade saved with ID:', tradeRef.id); // דיבוג
    return tradeRef.id;
  } catch (error) {
    console.error('Error saving trade:', error);
    return null;
  }
};

export const getUserTrades = async (userId) => {
  try {
    console.log('Getting trades for user:', userId); // דיבוג
    
    // נסה קודם בלי orderBy במקרה שיש בעיה באינדקס
    const tradesRef = collection(db, 'trades');
    const q = query(tradesRef, where('userId', '==', userId));
    
    const snapshot = await getDocs(q);
    const trades = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      trades.push({
        id: doc.id,
        ...data,
        // וודא שיש תאריך
        date: data.date || (data.createdAt ? data.createdAt.toDate().toISOString().split('T')[0] : new Date().toISOString().split('T')[0])
      });
    });
    
    // מיין לפי תאריך בצד הלקוח
    trades.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    console.log('Trades found:', trades.length, trades); // דיבוג
    return trades;
  } catch (error) {
    console.error('Error getting user trades:', error);
    return [];
  }
};

export const updateTrade = async (tradeId, tradeData) => {
  try {
    await updateDoc(doc(db, 'trades', tradeId), {
      ...tradeData,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating trade:', error);
    return false;
  }
};

export const deleteTrade = async (tradeId) => {
  try {
    console.log('Deleting trade:', tradeId); // דיבוג
    await deleteDoc(doc(db, 'trades', tradeId));
    console.log('Trade deleted successfully'); // דיבוג
    return true;
  } catch (error) {
    console.error('Error deleting trade:', error);
    return false;
  }
};

// Portfolio Management - מתוקן!
export const savePortfolio = async (userId, portfolioData) => {
  try {
    console.log('Saving portfolio for user:', userId, portfolioData); // דיבוג
    await setDoc(doc(db, 'portfolios', userId), {
      stocks: portfolioData,
      updatedAt: serverTimestamp()
    });
    console.log('Portfolio saved successfully'); // דיבוג
    return true;
  } catch (error) {
    console.error('Error saving portfolio:', error);
    return false;
  }
};

export const getUserPortfolio = async (userId) => {
  try {
    console.log('Getting portfolio for user:', userId); // דיבוג
    const portfolioDoc = await getDoc(doc(db, 'portfolios', userId));
    const result = portfolioDoc.exists() ? portfolioDoc.data().stocks : [];
    console.log('Portfolio found:', result); // דיבוג
    return result || [];
  } catch (error) {
    console.error('Error getting portfolio:', error);
    return [];
  }
};

// Calculation History (optional for future use)
export const saveCalculation = async (userId, calculationData) => {
  try {
    const calcRef = doc(collection(db, 'calculations'));
    await setDoc(calcRef, {
      userId,
      ...calculationData,
      createdAt: serverTimestamp()
    });
    return calcRef.id;
  } catch (error) {
    console.error('Error saving calculation:', error);
    return null;
  }
};

export const getUserCalculations = async (userId, limit = 10) => {
  try {
    const q = query(
      collection(db, 'calculations'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    const calculations = [];
    snapshot.forEach((doc) => {
      calculations.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return calculations.slice(0, limit);
  } catch (error) {
    console.error('Error getting user calculations:', error);
    return [];
  }
};

// Constants
export const USER_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  BLOCKED: 'blocked'
};

export const TRADE_TYPES = {
  BUY: 'buy',
  SELL: 'sell'
};