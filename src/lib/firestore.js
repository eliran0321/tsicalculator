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
    return calculations;
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