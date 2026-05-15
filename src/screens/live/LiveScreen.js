import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLiveClasses } from '../../store/slices/liveSlice';
import { COLORS } from '../../constants/colors';
import LiveClassCard from '../../components/LiveClassCard';

const LiveScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { classes, isLoading } = useSelector((state) => state.live);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, live, scheduled

  useEffect(() => {
    dispatch(fetchLiveClasses());
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchLiveClasses());
    setRefreshing(false);
  };

  const filteredClasses = filter === 'all'
    ? classes
    : classes.filter((c) => c.status === filter);

  const liveNow = classes.filter((c) => c.status === 'live');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <View style={styles.header}>
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.headerTitle}>Live Classes</Text>
        </View>
        {liveNow.length > 0 && (
          <View style={styles.liveCountBadge}>
            <Text style={styles.liveCountText}>{liveNow.length} Live</Text>
          </View>
        )}
      </View>

      {/* Filter */}
      <View style={styles.filterRow}>
        {['all', 'live', 'scheduled'].map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'all' ? 'All' : f === 'live' ? '🔴 Live Now' : '📅 Upcoming'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredClasses}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <LiveClassCard
              item={item}
              onPress={() => navigation.navigate('LiveClass', { liveClassId: item._id })}
            />
          </View>
        )}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Icon name="video-off-outline" size={60} color={COLORS.textLight} />
            <Text style={styles.emptyText}>No live classes</Text>
            <Text style={styles.emptySubtext}>Check back later for upcoming classes</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: COLORS.white,
    elevation: 2,
  },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  liveDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.live },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary },
  liveCountBadge: { backgroundColor: COLORS.live, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  liveCountText: { color: COLORS.white, fontSize: 13, fontWeight: 'bold' },
  filterRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterTabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterText: { fontSize: 13, color: COLORS.textSecondary },
  filterTextActive: { color: COLORS.white, fontWeight: '600' },
  list: { padding: 16 },
  cardWrapper: { marginBottom: 16 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: COLORS.textSecondary, marginTop: 16 },
  emptySubtext: { fontSize: 14, color: COLORS.textLight, marginTop: 4 },
});

export default LiveScreen;
