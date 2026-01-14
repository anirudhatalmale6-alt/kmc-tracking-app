import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Button, Card } from '../../components';
import { COLORS, SIZES, SHADOWS } from '../../config/theme';
import { useAuth } from '../../context/AuthContext';
import {
  getBabyById,
  startSession,
  stopSession,
  getActiveSession,
  getTodaySessionsByParent,
  getWeekSessionsByParent,
} from '../../config/database';
import { formatDuration, formatDurationText } from '../../utils/helpers';

const ParentHomeScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [baby, setBaby] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentSession, setCurrentSession] = useState(null);
  const [todayTotal, setTodayTotal] = useState(0);
  const [weekTotal, setWeekTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1000);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const loadData = async () => {
    try {
      // Load baby details
      if (user?.babyId) {
        const babyData = await getBabyById(user.babyId);
        setBaby(babyData);
      }

      // Load session stats
      await loadSessionStats();

      // Check for active session
      await checkActiveSession();
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSessionStats = async () => {
    try {
      // Get today's sessions
      const todaySessions = await getTodaySessionsByParent(user.id);
      let todayMs = 0;
      todaySessions.forEach((session) => {
        if (session.duration) todayMs += session.duration;
      });
      setTodayTotal(todayMs);

      // Get week's sessions
      const weekSessions = await getWeekSessionsByParent(user.id);
      let weekMs = 0;
      weekSessions.forEach((session) => {
        if (session.duration) weekMs += session.duration;
      });
      setWeekTotal(weekMs);
    } catch (error) {
      console.error('Error loading session stats:', error);
    }
  };

  const checkActiveSession = async () => {
    try {
      const activeSession = await getActiveSession(user.id);
      if (activeSession) {
        setCurrentSession(activeSession);
        const startTime = new Date(activeSession.startTime);
        const elapsed = Date.now() - startTime.getTime();
        setElapsedTime(elapsed);
        setIsRunning(true);
      }
    } catch (error) {
      console.error('Error checking active session:', error);
    }
  };

  const startKMC = async () => {
    try {
      const newSession = await startSession(user.id, user.babyId || null);
      setCurrentSession(newSession);
      setElapsedTime(0);
      setIsRunning(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to start KMC session. Please try again.');
      console.error('Error starting KMC:', error);
    }
  };

  const stopKMC = async () => {
    if (!currentSession) return;

    try {
      const duration = elapsedTime;
      await stopSession(currentSession.id, duration);

      setIsRunning(false);
      setCurrentSession(null);
      setTodayTotal((prev) => prev + duration);
      setWeekTotal((prev) => prev + duration);

      Alert.alert(
        'KMC Session Completed',
        `Great job! You completed ${formatDurationText(duration)} of KMC.`,
        [{ text: 'OK' }]
      );

      setElapsedTime(0);
    } catch (error) {
      Alert.alert('Error', 'Failed to stop KMC session. Please try again.');
      console.error('Error stopping KMC:', error);
    }
  };

  const handleLogout = () => {
    if (isRunning) {
      Alert.alert(
        'Active Session',
        'Please stop the current KMC session before logging out.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: logout, style: 'destructive' },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Niloufer KMC</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Baby Info Card */}
        <Card style={styles.babyCard}>
          <View style={styles.babyHeader}>
            <View style={styles.babyIcon}>
              <Text style={styles.babyEmoji}>👶</Text>
            </View>
            <View style={styles.babyInfo}>
              <Text style={styles.babyName}>{baby?.name || 'Baby'}</Text>
              {baby?.uhid && (
                <Text style={styles.babyDetail}>UHID: {baby.uhid}</Text>
              )}
              {baby?.bedNo && (
                <Text style={styles.babyDetail}>Bed: {baby.bedNo}</Text>
              )}
            </View>
          </View>
        </Card>

        {/* Timer Section */}
        <View style={styles.timerSection}>
          <View style={[styles.timerCircle, isRunning && styles.timerActive]}>
            <Text style={styles.timerLabel}>
              {isRunning ? 'KMC In Progress' : 'KMC Timer'}
            </Text>
            <Text style={styles.timerText}>{formatDuration(elapsedTime)}</Text>
            {isRunning && (
              <Text style={styles.timerSubtext}>Keep going!</Text>
            )}
          </View>

          <Button
            title={isRunning ? 'Stop KMC' : 'Start KMC'}
            onPress={isRunning ? stopKMC : startKMC}
            variant={isRunning ? 'secondary' : 'primary'}
            size="large"
            style={styles.timerButton}
          />
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>Today</Text>
            <Text style={styles.statValue}>{formatDurationText(todayTotal)}</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>This Week</Text>
            <Text style={styles.statValue}>{formatDurationText(weekTotal)}</Text>
          </Card>
        </View>

        {/* History Button */}
        <Button
          title="View History"
          onPress={() => navigation.navigate('ParentHistory')}
          variant="outline"
          style={styles.historyButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.padding,
    backgroundColor: COLORS.primary,
  },
  headerTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  logoutText: {
    fontSize: SIZES.font,
    color: COLORS.white,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: SIZES.padding,
  },
  babyCard: {
    marginBottom: 20,
  },
  babyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  babyIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  babyEmoji: {
    fontSize: 30,
  },
  babyInfo: {
    flex: 1,
  },
  babyName: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  babyDetail: {
    fontSize: SIZES.font,
    color: COLORS.textLight,
  },
  timerSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  timerCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 8,
    borderColor: COLORS.primaryLight,
    ...SHADOWS.medium,
  },
  timerActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  timerLabel: {
    fontSize: SIZES.font,
    color: COLORS.textLight,
    marginBottom: 8,
  },
  timerText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  timerSubtext: {
    fontSize: SIZES.font,
    color: COLORS.primary,
    marginTop: 8,
  },
  timerButton: {
    marginTop: 24,
    minWidth: 200,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 20,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 6,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: SIZES.font,
    color: COLORS.textLight,
    marginBottom: 8,
  },
  statValue: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  historyButton: {
    marginTop: 20,
    marginBottom: 40,
  },
});

export default ParentHomeScreen;
