import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initDatabase, loginParent as dbLoginParent, loginStaff as dbLoginStaff } from '../config/database';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null); // 'parent', 'staff', 'admin'
  const [loading, setLoading] = useState(true);
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize database
      await initDatabase();
      setDbReady(true);

      // Load stored user
      await loadStoredUser();
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      setLoading(false);
    }
  };

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
    }
  };

  const loginParent = async (mobile, pin) => {
    try {
      const parentData = await dbLoginParent(mobile, pin);

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
      const staffData = await dbLoginStaff(username, password);
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
      dbReady,
      loginParent,
      loginStaff,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
