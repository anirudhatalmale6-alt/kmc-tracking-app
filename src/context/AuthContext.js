import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null); // 'parent', 'staff', 'admin'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('kmc_user');
      const storedType = await AsyncStorage.getItem('kmc_user_type');
      if (storedUser && storedType) {
        setUser(JSON.parse(storedUser));
        setUserType(storedType);
      }
    } catch (error) {
      console.error('Error loading stored user:', error);
    } finally {
      setLoading(false);
    }
  };

  const loginParent = async (mobile, pin) => {
    try {
      const parentsRef = collection(db, 'parents');
      const q = query(parentsRef, where('mobile', '==', mobile), where('pin', '==', pin));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error('Invalid mobile number or PIN');
      }

      const parentDoc = querySnapshot.docs[0];
      const parentData = { id: parentDoc.id, ...parentDoc.data() };

      await AsyncStorage.setItem('kmc_user', JSON.stringify(parentData));
      await AsyncStorage.setItem('kmc_user_type', 'parent');

      setUser(parentData);
      setUserType('parent');
      return parentData;
    } catch (error) {
      throw error;
    }
  };

  const loginStaff = async (username, password) => {
    try {
      const staffRef = collection(db, 'staff');
      const q = query(staffRef, where('username', '==', username), where('password', '==', password));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error('Invalid username or password');
      }

      const staffDoc = querySnapshot.docs[0];
      const staffData = { id: staffDoc.id, ...staffDoc.data() };
      const type = staffData.isAdmin ? 'admin' : 'staff';

      await AsyncStorage.setItem('kmc_user', JSON.stringify(staffData));
      await AsyncStorage.setItem('kmc_user_type', type);

      setUser(staffData);
      setUserType(type);
      return staffData;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('kmc_user');
      await AsyncStorage.removeItem('kmc_user_type');
      setUser(null);
      setUserType(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      userType,
      loading,
      loginParent,
      loginStaff,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
