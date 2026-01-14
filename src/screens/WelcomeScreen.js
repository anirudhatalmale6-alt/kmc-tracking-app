import React from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView } from 'react-native';
import { Button } from '../components';
import { COLORS, SIZES } from '../config/theme';

const WelcomeScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>👶</Text>
          </View>
          <Text style={styles.hospital}>Niloufer Hospital</Text>
          <Text style={styles.title}>KMC Tracking</Text>
          <Text style={styles.subtitle}>Kangaroo Mother Care Monitor</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Track and monitor Kangaroo Mother Care sessions for your little one
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="I'm a Parent"
            onPress={() => navigation.navigate('ParentLogin')}
            size="large"
            style={styles.button}
          />
          <Button
            title="Staff Login"
            onPress={() => navigation.navigate('StaffLogin')}
            variant="outline"
            size="large"
            style={styles.button}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: SIZES.padding * 2,
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logoEmoji: {
    fontSize: 60,
  },
  hospital: {
    fontSize: SIZES.large,
    fontWeight: '600',
    color: COLORS.primaryDark,
    marginBottom: 4,
  },
  title: {
    fontSize: SIZES.xxlarge,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: SIZES.medium,
    color: COLORS.textLight,
  },
  infoContainer: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding * 1.5,
    borderRadius: SIZES.radius,
    marginVertical: 40,
  },
  infoText: {
    fontSize: SIZES.medium,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    marginBottom: 40,
  },
  button: {
    marginBottom: SIZES.margin,
  },
});

export default WelcomeScreen;
