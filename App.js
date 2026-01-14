import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { COLORS } from './src/config/theme';

// Screens
import WelcomeScreen from './src/screens/WelcomeScreen';
import ParentLoginScreen from './src/screens/parent/ParentLoginScreen';
import ParentHomeScreen from './src/screens/parent/ParentHomeScreen';
import ParentHistoryScreen from './src/screens/parent/ParentHistoryScreen';
import StaffLoginScreen from './src/screens/staff/StaffLoginScreen';
import StaffDashboardScreen from './src/screens/staff/StaffDashboardScreen';
import BabyDetailsScreen from './src/screens/staff/BabyDetailsScreen';
import AdminPanelScreen from './src/screens/admin/AdminPanelScreen';

const Stack = createNativeStackNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Welcome" component={WelcomeScreen} />
    <Stack.Screen name="ParentLogin" component={ParentLoginScreen} />
    <Stack.Screen name="StaffLogin" component={StaffLoginScreen} />
  </Stack.Navigator>
);

const ParentStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ParentHome" component={ParentHomeScreen} />
    <Stack.Screen name="ParentHistory" component={ParentHistoryScreen} />
  </Stack.Navigator>
);

const StaffStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="StaffDashboard" component={StaffDashboardScreen} />
    <Stack.Screen name="BabyDetails" component={BabyDetailsScreen} />
    <Stack.Screen name="AdminPanel" component={AdminPanelScreen} />
  </Stack.Navigator>
);

const Navigation = () => {
  const { user, userType, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!user ? (
        <AuthStack />
      ) : userType === 'parent' ? (
        <ParentStack />
      ) : (
        <StaffStack />
      )}
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="light" backgroundColor={COLORS.primary} />
      <Navigation />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});
