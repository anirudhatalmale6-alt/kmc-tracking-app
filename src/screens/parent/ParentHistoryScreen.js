import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Card } from '../../components';
import { COLORS, SIZES } from '../../config/theme';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import {
  formatDurationText,
  formatDate,
  formatTime,
  getTodayRange,
  getWeekRange,
} from '../../utils/helpers';

const ParentHistoryScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'today', 'week'
  const [stats, setStats] = useState({ today: 0, week: 0, total: 0 });

  useEffect(() => {
    loadSessions();
  }, [filter]);

  const loadSessions = async () => {
    try {
      const sessionsRef = collection(db, 'sessions');
      let q;

      if (filter === 'today') {
        const { start, end } = getTodayRange();
        q = query(
          sessionsRef,
          where('parentId', '==', user.id),
          where('startTime', '>=', Timestamp.fromDate(start)),
          where('startTime', '<=', Timestamp.fromDate(end))
        );
      } else if (filter === 'week') {
        const { start, end } = getWeekRange();
        q = query(
          sessionsRef,
          where('parentId', '==', user.id),
          where('startTime', '>=', Timestamp.fromDate(start)),
          where('startTime', '<=', Timestamp.fromDate(end))
        );
      } else {
        q = query(sessionsRef, where('parentId', '==', user.id));
      }

      const querySnapshot = await getDocs(q);
      const sessionsData = [];
      let totalDuration = 0;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (!data.isActive && data.duration) {
          sessionsData.push({ id: doc.id, ...data });
          totalDuration += data.duration;
        }
      });

      // Sort by startTime descending
      sessionsData.sort((a, b) => {
        const timeA = a.startTime?.toDate?.() || new Date(0);
        const timeB = b.startTime?.toDate?.() || new Date(0);
        return timeB - timeA;
      });

      setSessions(sessionsData);

      // Calculate stats
      await calculateStats();
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateStats = async () => {
    try {
      const sessionsRef = collection(db, 'sessions');
      const { start: todayStart, end: todayEnd } = getTodayRange();
      const { start: weekStart, end: weekEnd } = getWeekRange();

      // Today's total
      const todayQuery = query(
        sessionsRef,
        where('parentId', '==', user.id),
        where('startTime', '>=', Timestamp.fromDate(todayStart)),
        where('startTime', '<=', Timestamp.fromDate(todayEnd))
      );
      const todaySnapshot = await getDocs(todayQuery);
      let todayTotal = 0;
      todaySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.duration) todayTotal += data.duration;
      });

      // Week's total
      const weekQuery = query(
        sessionsRef,
        where('parentId', '==', user.id),
        where('startTime', '>=', Timestamp.fromDate(weekStart)),
        where('startTime', '<=', Timestamp.fromDate(weekEnd))
      );
      const weekSnapshot = await getDocs(weekQuery);
      let weekTotal = 0;
      weekSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.duration) weekTotal += data.duration;
      });

      // All time total
      const allQuery = query(sessionsRef, where('parentId', '==', user.id));
      const allSnapshot = await getDocs(allQuery);
      let allTotal = 0;
      allSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.duration) allTotal += data.duration;
      });

      setStats({ today: todayTotal, week: weekTotal, total: allTotal });
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadSessions();
  };

  const renderSession = ({ item }) => {
    const startTime = item.startTime?.toDate?.() || new Date();
    const endTime = item.endTime?.toDate?.() || new Date();

    return (
      <Card style={styles.sessionCard}>
        <View style={styles.sessionHeader}>
          <Text style={styles.sessionDate}>{formatDate(startTime)}</Text>
          <Text style={styles.sessionDuration}>
            {formatDurationText(item.duration)}
          </Text>
        </View>
        <View style={styles.sessionTimes}>
          <Text style={styles.sessionTime}>
            {formatTime(startTime)} - {formatTime(endTime)}
          </Text>
        </View>
      </Card>
    );
  };

  const FilterButton = ({ title, value }) => (
    <TouchableOpacity
      style={[styles.filterButton, filter === value && styles.filterActive]}
      onPress={() => setFilter(value)}
    >
      <Text
        style={[
          styles.filterText,
          filter === value && styles.filterTextActive,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>KMC History</Text>
        <View style={{ width: 50 }} />
      </View>

      {/* Stats Summary */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatDurationText(stats.today)}</Text>
          <Text style={styles.statLabel}>Today</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatDurationText(stats.week)}</Text>
          <Text style={styles.statLabel}>This Week</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatDurationText(stats.total)}</Text>
          <Text style={styles.statLabel}>All Time</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <FilterButton title="All" value="all" />
        <FilterButton title="Today" value="today" />
        <FilterButton title="This Week" value="week" />
      </View>

      {/* Sessions List */}
      <FlatList
        data={sessions}
        renderItem={renderSession}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyText}>No sessions recorded yet</Text>
            <Text style={styles.emptySubtext}>
              Start a KMC session to see it here
            </Text>
          </View>
        }
      />
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
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingVertical: 20,
    paddingHorizontal: SIZES.padding,
    marginBottom: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  statValue: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    marginBottom: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: SIZES.radius,
    marginHorizontal: 4,
    backgroundColor: COLORS.lightGray,
  },
  filterActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: SIZES.font,
    color: COLORS.text,
    fontWeight: '500',
  },
  filterTextActive: {
    color: COLORS.white,
  },
  listContent: {
    padding: SIZES.padding,
    paddingBottom: 40,
  },
  sessionCard: {
    marginBottom: 12,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionDate: {
    fontSize: SIZES.font,
    fontWeight: '600',
    color: COLORS.text,
  },
  sessionDuration: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  sessionTimes: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionTime: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: SIZES.medium,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: SIZES.font,
    color: COLORS.textLight,
  },
});

export default ParentHistoryScreen;
