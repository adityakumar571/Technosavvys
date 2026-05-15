import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, RefreshControl, TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FastImage from 'react-native-fast-image';
import moment from 'moment';
import api from '../../services/api';
import { COLORS } from '../../constants/colors';

const DoubtsScreen = ({ navigation, route }) => {
  const { batchId, courseId } = route.params || {};
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, open, answered

  useEffect(() => {
    loadDoubts();
  }, [filter]);

  const loadDoubts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (batchId) params.batchId = batchId;
      if (courseId) params.courseId = courseId;
      if (filter !== 'all') params.status = filter;

      const res = await api.get('/doubts', { params });
      setDoubts(res.data.data.doubts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDoubts();
    setRefreshing(false);
  };

  const renderDoubt = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('DoubtDetail', { doubtId: item._id })}
      style={styles.doubtCard}
    >
      <View style={styles.doubtHeader}>
        <FastImage
          source={{ uri: item.student?.avatar || 'https://via.placeholder.com/36' }}
          style={styles.avatar}
        />
        <View style={styles.doubtMeta}>
          <Text style={styles.studentName}>{item.student?.name}</Text>
          <Text style={styles.timeText}>{moment(item.createdAt).fromNow()}</Text>
        </View>
        <View style={[styles.statusBadge, item.status === 'answered' ? styles.answeredBadge : styles.openBadge]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <Text style={styles.doubtTitle} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.doubtDesc} numberOfLines={2}>{item.description}</Text>

      {item.subject && (
        <View style={styles.subjectChip}>
          <Text style={styles.subjectText}>{item.subject}</Text>
        </View>
      )}

      <View style={styles.doubtFooter}>
        <View style={styles.footerStat}>
          <Icon name="arrow-up-bold" size={14} color={COLORS.textSecondary} />
          <Text style={styles.footerStatText}>{item.upvotes?.length || 0}</Text>
        </View>
        <View style={styles.footerStat}>
          <Icon name="comment-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.footerStatText}>{item.replies?.length || 0} replies</Text>
        </View>
        {item.isResolved && (
          <View style={styles.resolvedBadge}>
            <Icon name="check-circle" size={14} color={COLORS.success} />
            <Text style={styles.resolvedText}>Resolved</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Doubts</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('CreateDoubt', { batchId, courseId })}
          style={styles.addBtn}
        >
          <Icon name="plus" size={22} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {['all', 'open', 'answered', 'closed'].map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={doubts}
        renderItem={renderDoubt}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Icon name="chat-question-outline" size={60} color={COLORS.textLight} />
            <Text style={styles.emptyText}>No doubts yet</Text>
            <Text style={styles.emptySubtext}>Be the first to ask a doubt!</Text>
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
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary },
  addBtn: {
    backgroundColor: COLORS.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterTabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterText: { fontSize: 13, color: COLORS.textSecondary },
  filterTextActive: { color: COLORS.white, fontWeight: '600' },
  list: { padding: 16 },
  doubtCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  doubtHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  doubtMeta: { flex: 1 },
  studentName: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  timeText: { fontSize: 12, color: COLORS.textSecondary },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  openBadge: { backgroundColor: '#FFF3E0' },
  answeredBadge: { backgroundColor: '#E8F5E9' },
  statusText: { fontSize: 11, fontWeight: '600', color: COLORS.textSecondary },
  doubtTitle: { fontSize: 15, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 4 },
  doubtDesc: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18, marginBottom: 8 },
  subjectChip: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    marginBottom: 10,
  },
  subjectText: { fontSize: 12, color: COLORS.primary, fontWeight: '500' },
  doubtFooter: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  footerStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerStatText: { fontSize: 13, color: COLORS.textSecondary },
  resolvedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 'auto' },
  resolvedText: { fontSize: 12, color: COLORS.success, fontWeight: '500' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: COLORS.textSecondary, marginTop: 16 },
  emptySubtext: { fontSize: 14, color: COLORS.textLight, marginTop: 4 },
});

export default DoubtsScreen;
