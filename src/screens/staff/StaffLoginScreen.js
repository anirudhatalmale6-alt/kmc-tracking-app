import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Button, Input } from '../../components';
import { COLORS, SIZES } from '../../config/theme';
import { useAuth } from '../../context/AuthContext';

const StaffLoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { loginStaff } = useAuth();

  const validate = () => {
    const newErrors = {};

    if (!username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 4) {
      newErrors.password = 'Password must be at least 4 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await loginStaff(username.trim().toLowerCase(), password);
      // Navigation will be handled by App.js based on auth state
    } catch (error) {
      Alert.alert('Login Failed', error.message || 'Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Text style={styles.icon}>👩‍⚕️</Text>
            </View>
            <Text style={styles.title}>Staff Login</Text>
            <Text style={styles.subtitle}>
              Enter your staff credentials to continue
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Username"
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                setErrors({ ...errors, username: null });
              }}
              placeholder="Enter your username"
              error={errors.username}
            />

            <Input
              label="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrors({ ...errors, password: null });
              }}
              placeholder="Enter your password"
              secureTextEntry
              error={errors.password}
            />

            <Button
              title="Login"
              onPress={handleLogin}
              loading={loading}
              size="large"
              style={styles.loginButton}
            />
          </View>

          <View style={styles.helpContainer}>
            <Text style={styles.helpText}>
              Contact admin for login credentials
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SIZES.padding * 1.5,
  },
  backButton: {
    marginBottom: 20,
  },
  backText: {
    fontSize: SIZES.medium,
    color: COLORS.primary,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: SIZES.xlarge,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: SIZES.font,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  form: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding * 1.5,
    marginBottom: 24,
  },
  loginButton: {
    marginTop: 8,
  },
  helpContainer: {
    alignItems: 'center',
    padding: SIZES.padding,
  },
  helpText: {
    fontSize: SIZES.font,
    color: COLORS.textLight,
  },
});

export default StaffLoginScreen;
