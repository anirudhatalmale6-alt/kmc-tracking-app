import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Card } from '../../components';
import { COLORS, SIZES } from '../../config/theme';
import {
  getParentsByBabyId,
  getSessionsByBaby,
  getTodaySessionsByBaby,
  getWeekSessionsByBaby,
} from '../../config/database';
import { formatDurationText, formatDate, formatTime } from '../../utils/helpers';

const BabyDetailsScreen = ({ route, navigation }) => {
  const { baby } = route.params;
  const [sessions, setSessions] = useState([]);
  const [parent, setParent] = useState(null);
  const [stats, setStats] = useState({ today: 0, week: 0, total: 0, sessions: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDetails();
  }, []);

  const loadDetails = async () => {
    try {
      // Load parent info
      const parents = await getParentsByBabyId(baby.id);
      if (parents.length > 0) {
        setParent(parents[0]);
      }

      // Load sessions
      const sessionsData = await getSessionsByBaby(baby.id);
      setSessions(sessionsData);

      // Calculate stats
      const todaySessions = await getTodaySessionsByBaby(baby.id);
      let todayTotal = 0;
      todaySessions.forEach((session) => {
        if (session.duration) todayTotal += session.duration;
      });

      const weekSessions = await getWeekSessionsByBaby(baby.id);
      let weekTotal = 0;
      weekSessions.forEach((session) => {
        if (session.duration) weekTotal += session.duration;
      });

      let totalDuration = 0;
      sessionsData.forEach((session) => {
        if (session.duration) totalDuration += session.duration;
      });

      setStats({
        today: todayTotal,
        week: weekTotal,
        total: totalDuration,
        sessions: sessionsData.length,
      });
    } catch (error) {
      console.error('Error loading details:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderSession = ({ item }) => {
    const startTime = new Date(item.startTime);
    const endTime = new Date(item.endTime);

    return (
      <View style={styles.sessionItem}>
        <View style={styles.sessionInfo}>
          <Text style={styles.sessionDate}>{formatDate(startTime)}</Text>
          <Text style={styles.sessionTime}>
            {formatTime(startTime)} - {formatTime(endTime)}
          </Text>
        </View>
        <Text style={styles.sessionDuration}>
          {formatDurationText(item.duration)}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Baby Details</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Baby Info Card */}
        <Card style={styles.infoCard}>
          <View style={styles.babyIcon}>
            <Text style={styles.babyEmoji}>👶</Text>
          </View>
          <Text style={styles.babyName}>{baby.name || 'Unknown'}</Text>

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>UHID</Text>
              <Text style={styles.detailValue}>{baby.uhid || 'N/A'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Bed No</Text>
              <Text style={styles.detailValue}>{baby.bedNo || 'N/A'}</Text>
            </View>
          </View>
        </Card>

        {/* Parent Info */}
        {parent && (
          <Card>
            <Text style={styles.sectionTitle}>Parent Information</Text>
            <View style={styles.parentInfo}>
              <Text style={styles.parentName}>
                {parent.motherName || 'Mother'}
              </Text>
              <Text style={styles.parentMobile}>{parent.mobile}</Text>
            </View>
          </Card>
        )}

        {/* KMC Stats */}
        <Card>
          <Text style={styles.sectionTitle}>KMC Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {formatDurationText(stats.today)}
              </Text>
              <Text style={styles.statLabel}>Today</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {formatDurationText(stats.week)}
              </Text>
              <Text style={styles.statLabel}>This Week</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {formatDurationText(stats.total)}
              </Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.sessions}</Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
          </View>
        </Card>

        {/* Recent Sessions */}
        <Card>
          <Text style={styles.sectionTitle}>Recent Sessions</Text>
          {sessions.length > 0 ? (
            <FlatList
              data={sessions.slice(0, 10)}
              renderItem={renderSession}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          ) : (
            <Text style={styles.noSessions}>No sessions recorded yet</Text>
          )}
        </Card>
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
  backText: {
    fontSize: SIZES.font,
    color: COLORS.white,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  content: {
    flex: 1,
    padding: SIZES.padding,
  },
  infoCard: {
    alignItems: 'center',
  },
  babyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  babyEmoji: {
    fontSize: 40,
  },
  babyName: {
    fontSize: SIZES.xlarge,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  detailItem: {
    width: '50%',
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: SIZES.font,
    fontWeight: '600',
    color: COLORS.text,
  },
  sectionTitle: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  parentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  parentName: {
    fontSize: SIZES.font,
    fontWeight: '600',
    color: COLORS.text,
  },
  parentMobile: {
    fontSize: SIZES.font,
    color: COLORS.textLight,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statItem: {
    width: '50%',
    marginBottom: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
  },
  sessionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionDate: {
    fontSize: SIZES.font,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 4,
  },
  sessionTime: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
  },
  sessionDuration: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  noSessions: {
    fontSize: SIZES.font,
    color: COLORS.textLight,
    textAlign: 'center',
    paddingVertical: 20,
  },
});

export default BabyDetailsScreen;
