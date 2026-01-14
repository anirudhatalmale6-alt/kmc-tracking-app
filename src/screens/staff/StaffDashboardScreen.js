import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import { Card } from '../../components';
import { COLORS, SIZES } from '../../config/theme';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase';
import { collection, query, getDocs, where, Timestamp } from 'firebase/firestore';
import { formatDurationText, getTodayRange, getWeekRange } from '../../utils/helpers';

const StaffDashboardScreen = ({ navigation }) => {
  const { user, userType, logout } = useAuth();
  const [babies, setBabies] = useState([]);
  const [filteredBabies, setFilteredBabies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name'); // 'name', 'todayKMC', 'weekKMC'
  const [overallStats, setOverallStats] = useState({ totalBabies: 0, lowKMC: 0 });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterAndSortBabies();
  }, [searchQuery, sortBy, babies]);

  const loadData = async () => {
    try {
      // Load all babies
      const babiesRef = collection(db, 'babies');
      const babiesSnapshot = await getDocs(babiesRef);
      const babiesData = [];

      for (const babyDoc of babiesSnapshot.docs) {
        const babyData = { id: babyDoc.id, ...babyDoc.data() };

        // Get KMC stats for each baby
        const stats = await getBabyKMCStats(babyDoc.id);
        babiesData.push({ ...babyData, ...stats });
      }

      setBabies(babiesData);

      // Calculate overall stats
      const lowKMCCount = babiesData.filter((b) => b.todayKMC < 3600000).length; // Less than 1 hour
      setOverallStats({ totalBabies: babiesData.length, lowKMC: lowKMCCount });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getBabyKMCStats = async (babyId) => {
    try {
      const sessionsRef = collection(db, 'sessions');
      const { start: todayStart, end: todayEnd } = getTodayRange();
      const { start: weekStart, end: weekEnd } = getWeekRange();

      // Today's KMC
      const todayQuery = query(
        sessionsRef,
        where('babyId', '==', babyId),
        where('startTime', '>=', Timestamp.fromDate(todayStart)),
        where('startTime', '<=', Timestamp.fromDate(todayEnd))
      );
      const todaySnapshot = await getDocs(todayQuery);
      let todayKMC = 0;
      todaySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.duration) todayKMC += data.duration;
      });

      // Week's KMC
      const weekQuery = query(
        sessionsRef,
        where('babyId', '==', babyId),
        where('startTime', '>=', Timestamp.fromDate(weekStart)),
        where('startTime', '<=', Timestamp.fromDate(weekEnd))
      );
      const weekSnapshot = await getDocs(weekQuery);
      let weekKMC = 0;
      weekSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.duration) weekKMC += data.duration;
      });

      return { todayKMC, weekKMC };
    } catch (error) {
      console.error('Error getting baby KMC stats:', error);
      return { todayKMC: 0, weekKMC: 0 };
    }
  };

  const filterAndSortBabies = () => {
    let filtered = [...babies];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (baby) =>
          baby.name?.toLowerCase().includes(query) ||
          baby.uhid?.toLowerCase().includes(query) ||
          baby.bedNo?.toLowerCase().includes(query)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'todayKMC':
          return a.todayKMC - b.todayKMC; // Lowest first
        case 'weekKMC':
          return a.weekKMC - b.weekKMC; // Lowest first
        default:
          return (a.name || '').localeCompare(b.name || '');
      }
    });

    setFilteredBabies(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const renderBabyCard = ({ item }) => {
    const isLowKMC = item.todayKMC < 3600000; // Less than 1 hour

    return (
      <Card
        style={[styles.babyCard, isLowKMC && styles.lowKMCCard]}
        onPress={() => navigation.navigate('BabyDetails', { baby: item })}
      >
        <View style={styles.babyHeader}>
          <View style={styles.babyInfo}>
            <Text style={styles.babyName}>{item.name || 'Unknown'}</Text>
            <Text style={styles.babyDetail}>
              UHID: {item.uhid || 'N/A'} | Bed: {item.bedNo || 'N/A'}
            </Text>
          </View>
          {isLowKMC && (
            <View style={styles.lowBadge}>
              <Text style={styles.lowBadgeText}>Low KMC</Text>
            </View>
          )}
        </View>

        <View style={styles.kmcStats}>
          <View style={styles.kmcStat}>
            <Text style={styles.kmcLabel}>Today</Text>
            <Text style={[styles.kmcValue, isLowKMC && styles.lowKMCValue]}>
              {formatDurationText(item.todayKMC)}
            </Text>
          </View>
          <View style={styles.kmcStat}>
            <Text style={styles.kmcLabel}>This Week</Text>
            <Text style={styles.kmcValue}>{formatDurationText(item.weekKMC)}</Text>
          </View>
        </View>
      </Card>
    );
  };

  const SortButton = ({ title, value }) => (
    <TouchableOpacity
      style={[styles.sortButton, sortBy === value && styles.sortActive]}
      onPress={() => setSortBy(value)}
    >
      <Text style={[styles.sortText, sortBy === value && styles.sortTextActive]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Staff Dashboard</Text>
          <Text style={styles.headerSubtitle}>
            {user?.name || 'Staff'} {userType === 'admin' ? '(Admin)' : ''}
          </Text>
        </View>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Overview */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{overallStats.totalBabies}</Text>
          <Text style={styles.statLabel}>Total Babies</Text>
        </View>
        <View style={[styles.statBox, styles.alertBox]}>
          <Text style={[styles.statNumber, styles.alertNumber]}>
            {overallStats.lowKMC}
          </Text>
          <Text style={styles.statLabel}>Low KMC Today</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, UHID, or bed..."
          placeholderTextColor={COLORS.gray}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <SortButton title="Name" value="name" />
        <SortButton title="Today KMC" value="todayKMC" />
        <SortButton title="Week KMC" value="weekKMC" />
      </View>

      {/* Baby List */}
      <FlatList
        data={filteredBabies}
        renderItem={renderBabyCard}
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
            <Text style={styles.emptyEmoji}>👶</Text>
            <Text style={styles.emptyText}>No babies found</Text>
          </View>
        }
      />

      {/* Admin Button */}
      {userType === 'admin' && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AdminPanel')}
        >
          <Text style={styles.addButtonText}>+ Admin Panel</Text>
        </TouchableOpacity>
      )}
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
  headerSubtitle: {
    fontSize: SIZES.small,
    color: COLORS.white,
    opacity: 0.9,
  },
  logoutText: {
    fontSize: SIZES.font,
    color: COLORS.white,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: SIZES.padding,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    alignItems: 'center',
  },
  alertBox: {
    backgroundColor: '#FFF3E0',
  },
  statNumber: {
    fontSize: SIZES.xxlarge,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  alertNumber: {
    color: COLORS.warning,
  },
  statLabel: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: SIZES.padding,
    marginBottom: 8,
  },
  searchInput: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding,
    paddingVertical: 12,
    fontSize: SIZES.font,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    marginBottom: 8,
  },
  sortLabel: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    marginRight: 8,
  },
  sortButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: COLORS.lightGray,
  },
  sortActive: {
    backgroundColor: COLORS.primary,
  },
  sortText: {
    fontSize: SIZES.small,
    color: COLORS.text,
  },
  sortTextActive: {
    color: COLORS.white,
  },
  listContent: {
    padding: SIZES.padding,
    paddingBottom: 100,
  },
  babyCard: {
    marginBottom: 12,
  },
  lowKMCCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  babyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  babyInfo: {
    flex: 1,
  },
  babyName: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  babyDetail: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
  },
  lowBadge: {
    backgroundColor: COLORS.warning,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  lowBadgeText: {
    fontSize: 10,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  kmcStats: {
    flexDirection: 'row',
  },
  kmcStat: {
    flex: 1,
  },
  kmcLabel: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  kmcValue: {
    fontSize: SIZES.medium,
    fontWeight: '600',
    color: COLORS.primary,
  },
  lowKMCValue: {
    color: COLORS.warning,
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
    color: COLORS.textLight,
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: SIZES.font,
    fontWeight: 'bold',
  },
});

export default StaffDashboardScreen;
