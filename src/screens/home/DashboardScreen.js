import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FastImage from '@d11/react-native-fast-image';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import { COLORS, GRADIENTS } from '../../constants/colors';
import Skeleton from '../../components/Skeleton';

const F = { urbanist: 'Urbanist-Medium' };

const DashboardScreen = ({ navigation }) => {
  const { user } = useSelector((s) => s.auth);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const res = await api.get('/dashboard/student');
      setData(res.data.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const stats = data?.stats;
  const upcomingClasses = data?.upcomingLiveClasses || [];
  const recentTests = data?.recentTests || [];

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <LinearGradient colors={GRADIENTS.primary} style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Icon name="arrow-left" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>My Dashboard</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView
        style={s.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {error ? (
          <View style={s.errorBox}>
            <Icon name="alert-circle-outline" size={20} color={COLORS.error} />
            <Text style={s.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* ── Stats Grid ── */}
        <View style={s.statsGrid}>
          {loading ? (
            [1, 2, 3, 4].map((i) => (
              <View key={i} style={s.statCard}>
                <Skeleton width={32} height={32} borderRadius={16} />
                <Skeleton width={50} height={24} borderRadius={6} style={{ marginTop: 8 }} />
                <Skeleton width={80} height={12} borderRadius={4} style={{ marginTop: 6 }} />
              </View>
            ))
          ) : (
            [
              { label: 'Enrolled Courses', value: stats?.enrolledCourses ?? 0, icon: 'book-open', color: COLORS.primary },
              { label: 'Videos Completed', value: stats?.videosCompleted ?? 0, icon: 'play-circle', color: COLORS.success },
              { label: 'Tests Attempted', value: stats?.testsAttempted ?? 0, icon: 'clipboard-text', color: COLORS.warning },
              { label: 'Total Points', value: stats?.totalPoints ?? 0, icon: 'star', color: '#F59E0B' },
            ].map((stat, i) => (
              <View key={i} style={s.statCard}>
                <View style={[s.statIcon, { backgroundColor: stat.color + '18' }]}>
                  <Icon name={stat.icon} size={22} color={stat.color} />
                </View>
                <Text style={[s.statValue, { color: stat.color }]}>{stat.value}</Text>
                <Text style={s.statLabel}>{stat.label}</Text>
              </View>
            ))
          )}
        </View>

        {/* ── Streak Card ── */}
        {loading ? (
          <View style={s.streakCard}>
            <Skeleton width={56} height={56} borderRadius={28} />
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Skeleton width={120} height={20} borderRadius={6} />
              <Skeleton width={160} height={14} borderRadius={4} style={{ marginTop: 6 }} />
            </View>
          </View>
        ) : (
          <View style={s.streakCard}>
            <Text style={s.streakEmoji}>🔥</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.streakValue}>{stats?.streak ?? 0} Day Streak</Text>
              <Text style={s.streakSub}>Keep learning every day!</Text>
            </View>
            <View style={s.streakBadge}>
              <Text style={s.streakBadgeText}>Active</Text>
            </View>
          </View>
        )}

        {/* ── Upcoming Live Classes ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Upcoming Live Classes</Text>
          {loading ? (
            [1, 2].map((i) => (
              <View key={i} style={s.liveItem}>
                <Skeleton width={48} height={48} borderRadius={12} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Skeleton width="70%" height={14} />
                  <Skeleton width="50%" height={12} style={{ marginTop: 6 }} />
                </View>
              </View>
            ))
          ) : upcomingClasses.length === 0 ? (
            <View style={s.emptySmall}>
              <Icon name="video-off-outline" size={32} color={COLORS.textLight} />
              <Text style={s.emptySmallText}>No upcoming classes</Text>
            </View>
          ) : (
            upcomingClasses.map((cls) => (
              <TouchableOpacity
                key={cls._id}
                style={s.liveItem}
                onPress={() => navigation.navigate('LiveClass', { liveClassId: cls._id })}
              >
                <View style={s.liveIconBox}>
                  <Icon name="video-wireless" size={22} color={COLORS.live} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.liveTitle} numberOfLines={1}>{cls.title}</Text>
                  <Text style={s.liveMeta}>
                    {cls.instructor?.name} · {cls.subject || 'General'}
                  </Text>
                  <Text style={s.liveTime}>
                    {new Date(cls.scheduledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </Text>
                </View>
                <View style={[s.statusChip, cls.status === 'live' && s.statusLive]}>
                  <Text style={[s.statusText, cls.status === 'live' && { color: COLORS.white }]}>
                    {cls.status === 'live' ? '🔴 Live' : 'Upcoming'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* ── Recent Tests ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Recent Test Attempts</Text>
          {loading ? (
            [1, 2].map((i) => (
              <View key={i} style={s.testItem}>
                <Skeleton width={48} height={48} borderRadius={12} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Skeleton width="65%" height={14} />
                  <Skeleton width="40%" height={12} style={{ marginTop: 6 }} />
                </View>
                <Skeleton width={50} height={28} borderRadius={8} />
              </View>
            ))
          ) : recentTests.length === 0 ? (
            <View style={s.emptySmall}>
              <Icon name="clipboard-text-outline" size={32} color={COLORS.textLight} />
              <Text style={s.emptySmallText}>No tests attempted yet</Text>
            </View>
          ) : (
            recentTests.map((attempt) => (
              <View key={attempt._id} style={s.testItem}>
                <View style={s.testIconBox}>
                  <Icon name="clipboard-check" size={22} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.testTitle} numberOfLines={1}>{attempt.test?.title || 'Test'}</Text>
                  <Text style={s.testMeta}>{attempt.correct ?? 0} correct · {attempt.timeTaken ?? 0}s</Text>
                </View>
                <View style={[s.scoreBadge, { backgroundColor: attempt.percentage >= 60 ? COLORS.success + '20' : COLORS.error + '20' }]}>
                  <Text style={[s.scoreText, { color: attempt.percentage >= 60 ? COLORS.success : COLORS.error }]}>
                    {Math.round(attempt.percentage ?? 0)}%
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingBottom: 20, paddingHorizontal: 16 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.white, fontFamily: F.urbanist },
  content: { flex: 1 },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FEF2F2', margin: 16, borderRadius: 12, padding: 12 },
  errorText: { color: COLORS.error, fontSize: 13, fontFamily: F.urbanist, flex: 1 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, padding: 16 },
  statCard: { flex: 1, minWidth: '45%', backgroundColor: COLORS.white, borderRadius: 16, padding: 16, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
  statIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  statValue: { fontSize: 24, fontWeight: '700', fontFamily: F.urbanist },
  statLabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4, textAlign: 'center', fontFamily: F.urbanist },

  streakCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, marginHorizontal: 16, borderRadius: 16, padding: 18, elevation: 2, gap: 12 },
  streakEmoji: { fontSize: 44 },
  streakValue: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, fontFamily: F.urbanist },
  streakSub: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2, fontFamily: F.urbanist },
  streakBadge: { backgroundColor: COLORS.success + '20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  streakBadgeText: { color: COLORS.success, fontSize: 12, fontWeight: '600', fontFamily: F.urbanist },

  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12, fontFamily: F.urbanist },

  liveItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 14, padding: 14, marginBottom: 10, elevation: 1, gap: 4 },
  liveIconBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: COLORS.live + '15', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  liveTitle: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, fontFamily: F.urbanist },
  liveMeta: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2, fontFamily: F.urbanist },
  liveTime: { fontSize: 11, color: COLORS.primary, marginTop: 2, fontFamily: F.urbanist },
  statusChip: { backgroundColor: COLORS.primaryLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusLive: { backgroundColor: COLORS.live },
  statusText: { fontSize: 11, color: COLORS.primary, fontWeight: '600', fontFamily: F.urbanist },

  testItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 14, padding: 14, marginBottom: 10, elevation: 1 },
  testIconBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  testTitle: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, fontFamily: F.urbanist },
  testMeta: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2, fontFamily: F.urbanist },
  scoreBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  scoreText: { fontSize: 13, fontWeight: '700', fontFamily: F.urbanist },

  emptySmall: { alignItems: 'center', paddingVertical: 20, gap: 8 },
  emptySmallText: { fontSize: 13, color: COLORS.textSecondary, fontFamily: F.urbanist },
});

export default DashboardScreen;
