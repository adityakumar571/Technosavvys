import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  FlatList, RefreshControl, StatusBar, Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FastImage from '@d11/react-native-fast-image';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourses } from '../../store/slices/courseSlice';
import { fetchLiveClasses } from '../../store/slices/liveSlice';
import { fetchNotifications } from '../../store/slices/notificationSlice';
import { fetchBanners } from '../../store/slices/bannerSlice';
import { fetchCategories } from '../../store/slices/categorySlice';
import { COLORS, GRADIENTS } from '../../constants/colors';
import CourseCard from '../../components/CourseCard';
import LiveClassCard from '../../components/LiveClassCard';
import {
  CourseCardSkeleton, BannerSkeleton, CategorySkeleton,
  LiveCardSkeleton, StatSkeleton,
} from '../../components/Skeleton';
import api from '../../services/api';

const { width } = Dimensions.get('window');
const F = { urbanist: 'Urbanist-Medium' };

const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { list: courses, isLoading: coursesLoading } = useSelector((s) => s.courses);
  const { classes: liveClasses, isLoading: liveLoading } = useSelector((s) => s.live);
  const { unreadCount } = useSelector((s) => s.notifications);
  const { list: banners, isLoading: bannersLoading } = useSelector((s) => s.banners);
  const { list: categories, isLoading: catsLoading } = useSelector((s) => s.categories);

  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [dashStats, setDashStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [bannerIndex, setBannerIndex] = useState(0);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const loadData = useCallback(async () => {
    setStatsLoading(true);
    await Promise.all([
      dispatch(fetchBanners()),
      dispatch(fetchCategories()),
      dispatch(fetchCourses({ limit: 8 })),
      dispatch(fetchLiveClasses()),
      dispatch(fetchNotifications()),
    ]);
    try {
      const res = await api.get('/dashboard/student');
      setDashStats(res.data.data.stats);
    } catch (_) {}
    setStatsLoading(false);
  }, [dispatch]);

  useEffect(() => { loadData(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filteredCourses = selectedCategory
    ? courses.filter((c) => c.category === selectedCategory)
    : courses;

  // Banner auto-scroll
  useEffect(() => {
    if (banners.length < 2) return;
    const t = setInterval(() => setBannerIndex((i) => (i + 1) % banners.length), 3500);
    return () => clearInterval(t);
  }, [banners.length]);

  const handleBannerPress = (banner) => {
    api.post(`/banners/${banner._id}/click`).catch(() => {});
    if (banner.linkType === 'course' && banner.linkId) {
      navigation.navigate('CourseDetail', { courseId: banner.linkId });
    } else if (banner.linkType === 'batch' && banner.linkId) {
      navigation.navigate('BatchDetail', { batchId: banner.linkId });
    }
  };

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {/* ── Header ── */}
        <LinearGradient colors={GRADIENTS.primary} style={s.header}>
          <View style={s.headerTop}>
            <View>
              <Text style={s.greeting}>{greeting()}, 👋</Text>
              <Text style={s.userName}>{user?.name || 'Student'}</Text>
            </View>
            <View style={s.headerActions}>
              <TouchableOpacity onPress={() => navigation.navigate('Search')} style={s.headerBtn}>
                <Icon name="magnify" size={24} color={COLORS.white} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={s.headerBtn}>
                <Icon name="bell-outline" size={24} color={COLORS.white} />
                {unreadCount > 0 && (
                  <View style={s.badge}><Text style={s.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text></View>
                )}
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Search')} style={s.searchBar}>
            <Icon name="magnify" size={20} color={COLORS.textSecondary} />
            <Text style={s.searchPlaceholder}>Search courses, batches...</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* ── Stats ── */}
        <View style={s.statsCard}>
          {statsLoading ? <StatSkeleton /> : (
            <>
              {[
                { label: 'Courses', value: dashStats?.enrolledCourses ?? user?.enrolledCourses?.length ?? 0, icon: 'book-open', color: COLORS.primary },
                { label: 'Streak', value: `${dashStats?.streak ?? user?.streak ?? 0}🔥`, icon: 'fire', color: COLORS.secondary },
                { label: 'Points', value: dashStats?.totalPoints ?? user?.points ?? 0, icon: 'star', color: COLORS.accent },
                { label: 'Tests', value: dashStats?.testsAttempted ?? user?.testAttempts?.length ?? 0, icon: 'clipboard-text', color: COLORS.success },
              ].map((stat, i) => (
                <View key={i} style={s.statItem}>
                  <Icon name={stat.icon} size={20} color={stat.color} />
                  <Text style={[s.statValue, { color: stat.color }]}>{stat.value}</Text>
                  <Text style={s.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </>
          )}
        </View>

        {/* ── Banners ── */}
        <View style={s.section}>
          {bannersLoading ? <BannerSkeleton /> : banners.length > 0 ? (
            <View>
              <FlatList
                data={banners}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item._id}
                onMomentumScrollEnd={(e) => {
                  const idx = Math.round(e.nativeEvent.contentOffset.x / (width - 32));
                  setBannerIndex(idx);
                }}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => handleBannerPress(item)} activeOpacity={0.9}>
                    <FastImage
                      source={{ uri: item.imageUrl }}
                      style={s.bannerImage}
                      resizeMode={FastImage.resizeMode.cover}
                    />
                    {(item.title || item.subtitle) && (
                      <View style={s.bannerOverlay}>
                        {item.title ? <Text style={s.bannerTitle}>{item.title}</Text> : null}
                        {item.subtitle ? <Text style={s.bannerSubtitle}>{item.subtitle}</Text> : null}
                      </View>
                    )}
                  </TouchableOpacity>
                )}
              />
              {banners.length > 1 && (
                <View style={s.dots}>
                  {banners.map((_, i) => (
                    <View key={i} style={[s.dot, i === bannerIndex && s.dotActive]} />
                  ))}
                </View>
              )}
            </View>
          ) : null}
        </View>

        {/* ── Categories ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Categories</Text>
          {catsLoading ? <CategorySkeleton /> : (
            <FlatList
              data={[{ _id: 'all', name: 'All', icon: '🌟' }, ...categories]}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item._id}
              contentContainerStyle={{ paddingRight: 8 }}
              renderItem={({ item }) => {
                const isAll = item._id === 'all';
                const active = isAll ? selectedCategory === null : selectedCategory === item.name;
                return (
                  <TouchableOpacity
                    onPress={() => setSelectedCategory(isAll ? null : item.name)}
                    style={[s.catChip, active && { backgroundColor: item.color || COLORS.primary, borderColor: item.color || COLORS.primary }]}
                  >
                    <Text style={s.catIcon}>{item.icon || '📚'}</Text>
                    <Text style={[s.catLabel, active && { color: COLORS.white }]}>{item.name}</Text>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>

        {/* ── Live Classes ── */}
        {(liveLoading || liveClasses.length > 0) && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <View style={s.liveRow}>
                <View style={s.liveDot} />
                <Text style={s.sectionTitle}>Live Now</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('Live')}>
                <Text style={s.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            {liveLoading ? (
              <FlatList
                data={[1, 2, 3]}
                horizontal
                keyExtractor={(i) => String(i)}
                renderItem={() => <LiveCardSkeleton />}
                showsHorizontalScrollIndicator={false}
              />
            ) : (
              <FlatList
                data={liveClasses.slice(0, 6)}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                  <LiveClassCard
                    item={item}
                    onPress={() => navigation.navigate('LiveClass', { liveClassId: item._id })}
                  />
                )}
              />
            )}
          </View>
        )}

        {/* ── Courses ── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Popular Courses</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Courses')}>
              <Text style={s.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {coursesLoading ? (
            [1, 2, 3].map((i) => <CourseCardSkeleton key={i} />)
          ) : filteredCourses.length === 0 ? (
            <View style={s.empty}>
              <Icon name="book-open-outline" size={48} color={COLORS.textLight} />
              <Text style={s.emptyText}>No courses found</Text>
            </View>
          ) : (
            filteredCourses.slice(0, 6).map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                onPress={() => navigation.navigate('CourseDetail', { courseId: course._id })}
              />
            ))
          )}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  greeting: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontFamily: F.urbanist },
  userName: { fontSize: 20, fontWeight: '600', color: COLORS.white, fontFamily: F.urbanist },
  headerActions: { flexDirection: 'row', gap: 4 },
  headerBtn: { padding: 8, position: 'relative' },
  badge: { position: 'absolute', top: 4, right: 4, backgroundColor: COLORS.error, borderRadius: 8, minWidth: 16, height: 16, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 2 },
  badgeText: { color: COLORS.white, fontSize: 9, fontWeight: '700' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, gap: 10 },
  searchPlaceholder: { color: COLORS.textSecondary, fontSize: 14, fontFamily: F.urbanist },

  statsCard: { flexDirection: 'row', backgroundColor: COLORS.white, marginHorizontal: 16, marginTop: -1, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 8, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, justifyContent: 'space-around' },
  statItem: { alignItems: 'center', gap: 4 },
  statValue: { fontSize: 18, fontWeight: '700', fontFamily: F.urbanist },
  statLabel: { fontSize: 11, color: COLORS.textSecondary, fontFamily: F.urbanist },

  section: { paddingHorizontal: 16, marginTop: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textPrimary, fontFamily: F.urbanist },
  seeAll: { color: COLORS.primary, fontSize: 13, fontWeight: '600', fontFamily: F.urbanist },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  liveDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.live },

  bannerImage: { width: width - 32, height: 160, borderRadius: 16 },
  bannerOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.45)', borderBottomLeftRadius: 16, borderBottomRightRadius: 16, padding: 12 },
  bannerTitle: { color: COLORS.white, fontSize: 15, fontWeight: '700', fontFamily: F.urbanist },
  bannerSubtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontFamily: F.urbanist, marginTop: 2 },
  dots: { flexDirection: 'row', justifyContent: 'center', marginTop: 8, gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.border },
  dotActive: { width: 18, backgroundColor: COLORS.primary },

  catChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.white, borderWidth: 1.5, borderColor: COLORS.border, marginRight: 8 },
  catIcon: { fontSize: 16 },
  catLabel: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500', fontFamily: F.urbanist },

  empty: { alignItems: 'center', paddingVertical: 32 },
  emptyText: { fontSize: 15, color: COLORS.textSecondary, marginTop: 10, fontFamily: F.urbanist },
});

export default HomeScreen;
