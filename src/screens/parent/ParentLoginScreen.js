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
import { validateMobile } from '../../utils/helpers';

const ParentLoginScreen = ({ navigation }) => {
  const [mobile, setMobile] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { loginParent } = useAuth();

  const validate = () => {
    const newErrors = {};

    if (!mobile) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!validateMobile(mobile)) {
      newErrors.mobile = 'Please enter a valid 10-digit mobile number';
    }

    if (!pin) {
      newErrors.pin = 'PIN is required';
    } else if (pin.length !== 4) {
      newErrors.pin = 'PIN must be 4 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await loginParent(mobile, pin);
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
              <Text style={styles.icon}>👶</Text>
            </View>
            <Text style={styles.title}>Parent Login</Text>
            <Text style={styles.subtitle}>
              Enter your registered mobile number and PIN
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Mobile Number"
              value={mobile}
              onChangeText={(text) => {
                setMobile(text.replace(/[^0-9]/g, ''));
                setErrors({ ...errors, mobile: null });
              }}
              placeholder="Enter 10-digit mobile number"
              keyboardType="phone-pad"
              maxLength={10}
              error={errors.mobile}
            />

            <Input
              label="PIN"
              value={pin}
              onChangeText={(text) => {
                setPin(text.replace(/[^0-9]/g, ''));
                setErrors({ ...errors, pin: null });
              }}
              placeholder="Enter 4-digit PIN"
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
              error={errors.pin}
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
              Don't have login credentials?
            </Text>
            <Text style={styles.helpSubtext}>
              Please contact the NICU staff to register your account
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
    marginBottom: 4,
  },
  helpSubtext: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    textAlign: 'center',
  },
});

export default ParentLoginScreen;
