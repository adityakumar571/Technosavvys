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
import {
  SafeAreaView,
} from 'react-native-safe-area-context';


const { width } = Dimensions.get('window');

// Globally applying Urbanist-Medium as requested for the whole layout context
const F_FAMILY = 'Urbanist-Medium';

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
    } catch (_) { }
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

  useEffect(() => {
    if (banners.length < 2) return;
    const t = setInterval(() => setBannerIndex((i) => (i + 1) % banners.length), 3500);
    return () => clearInterval(t);
  }, [banners.length]);

  const handleBannerPress = (banner) => {
    api.post(`/banners/${banner._id}/click`).catch(() => { });
    if (banner.linkType === 'course' && banner.linkId) {
      navigation.navigate('CourseDetail', { courseId: banner.linkId });
    } else if (banner.linkType === 'batch' && banner.linkId) {
      navigation.navigate('BatchDetail', { batchId: banner.linkId });
    }
  };

  return (

    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#fff',
      }}
    >
      <View style={s.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        >

          {/* ── Brand New Modern Premium Header ── */}
          <View style={s.luxuryHeader}>
            <View style={s.headerTop}>
              <View>
                <Text style={s.greetingText}>{greeting()}, 👋</Text>
                <Text style={s.userNameText}>{user?.name || 'Creative Learner'}</Text>
              </View>
              <View style={s.actionRow}>
                <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={s.iconWrapper} activeOpacity={0.7}>
                  <Icon name="bell" size={22} color={COLORS.textPrimary || '#1E293B'} />
                  {unreadCount > 0 && (
                    <View style={s.badgeBlob}>
                      <Text style={s.badgeBlobText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Elevated Minimalist Search Bar Container */}
            <TouchableOpacity onPress={() => navigation.navigate('Search')} style={s.glassSearch} activeOpacity={0.95}>
              <Icon name="magnify" size={20} color="#64748B" />
              <Text style={s.searchFieldPlaceholder}>Search premium courses, channels...</Text>
            </TouchableOpacity>
          </View>

          {/* ── Modern High-Fidelity Floating Stats Row ── */}
          <View style={s.statsContainer}>
            {statsLoading ? <StatSkeleton /> : (
              <View style={s.statsFlexGrid}>
                {[
                  { label: 'Courses', value: dashStats?.enrolledCourses ?? user?.enrolledCourses?.length ?? 0, icon: 'book-open-blank-variant', color: '#6366F1', bg: '#EEF2FF' },
                  { label: 'Streak', value: `${dashStats?.streak ?? user?.streak ?? 0} d`, icon: 'lightning-bolt', color: '#F59E0B', bg: '#FEF3C7' },
                  { label: 'Points', value: dashStats?.totalPoints ?? user?.points ?? 0, icon: 'shield-star', color: '#10B981', bg: '#ECFDF5' },
                  { label: 'Tests', value: dashStats?.testsAttempted ?? user?.testAttempts?.length ?? 0, icon: 'file-document-edit', color: '#EF4444', bg: '#FEF2F2' },
                ].map((stat, i) => (
                  <View key={i} style={s.statPod}>
                    <View style={[s.statIconCircle, { backgroundColor: stat.bg }]}>
                      <Icon name={stat.icon} size={18} color={stat.color} />
                    </View>
                    <Text style={s.statCounter}>{stat.value}</Text>
                    <Text style={s.statSubtitle}>{stat.label}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* ── Premium Cinematic Banners ── */}
          <View style={s.carouselSection}>
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
                    <TouchableOpacity onPress={() => handleBannerPress(item)} activeOpacity={0.95} style={s.bannerTouch}>
                      <FastImage
                        source={{ uri: item.imageUrl }}
                        style={s.cinematicImage}
                        resizeMode={FastImage.resizeMode.cover}
                      />
                      <LinearGradient colors={['transparent', 'rgba(15,23,42,0.85)']} style={s.bannerScrim}>
                        {item.title ? <Text style={s.scrimTitle} numberOfLines={1}>{item.title}</Text> : null}
                        {item.subtitle ? <Text style={s.scrimSubtitle} numberOfLines={1}>{item.subtitle}</Text> : null}
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                />
                {banners.length > 1 && (
                  <View style={s.indicatorDotsRow}>
                    {banners.map((_, i) => (
                      <View key={i} style={[s.indicatorDot, i === bannerIndex && s.indicatorDotActive]} />
                    ))}
                  </View>
                )}
              </View>
            ) : null}
          </View>

          {/* ── Premium Categories Minimal Chips ── */}
          <View style={s.contentBlock}>
            <Text style={s.blockHeadingTitle}>Explore Categories</Text>
            {catsLoading ? <CategorySkeleton /> : (
              <FlatList
                data={[{ _id: 'all', name: 'All Tracks', icon: '⚡' }, ...categories]}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item._id}
                contentContainerStyle={s.categoriesScrollPadding}
                renderItem={({ item }) => {
                  const isAll = item._id === 'all';
                  const active = isAll ? selectedCategory === null : selectedCategory === item.name;
                  return (
                    <TouchableOpacity
                      onPress={() => setSelectedCategory(isAll ? null : item.name)}
                      activeOpacity={0.8}
                      style={[s.premiumChip, active && { backgroundColor: '#4F46E5', borderColor: '#4F46E5' }]}
                    >
                      <Text style={s.chipEmoji}>{item.icon || '📚'}</Text>
                      <Text style={[s.chipTextLabel, active && { color: '#FFFFFF' }]}>{item.name}</Text>
                    </TouchableOpacity>
                  );
                }}
              />
            )}
          </View>

          {/* ── Immersive Pulse Live Classes Section ── */}
          {(liveLoading || liveClasses.length > 0) && (
            <View style={s.contentBlock}>
              <View style={s.blockHeaderFlex}>
                <View style={s.liveBadgeIndicatorRow}>
                  <View style={s.livePulseRadar} />
                  <Text style={s.blockHeadingTitle}>Live Broadcasts</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('Live')} activeOpacity={0.6}>
                  <Text style={s.actionLinkText}>See Live Channels</Text>
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
                  contentContainerStyle={{ paddingRight: 16 }}
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

          {/* ── Popular Curated Courses ── */}
          <View style={s.contentBlock}>
            <View style={s.blockHeaderFlex}>
              <Text style={s.blockHeadingTitle}>Trending Programs</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Courses')} activeOpacity={0.6}>
                <Text style={s.actionLinkText}>View Catalog</Text>
              </TouchableOpacity>
            </View>
            {coursesLoading ? (
              [1, 2, 3].map((i) => <CourseCardSkeleton key={i} />)
            ) : filteredCourses.length === 0 ? (
              <View style={s.fallbackState}>
                <Icon name="cloud-search-outline" size={44} color="#94A3B8" />
                <Text style={s.fallbackStateText}>No tailored tracks available right now.</Text>
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

          <View style={{ height: 32 }} />
        </ScrollView>
      </View>
    </SafeAreaView>

  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' }, // Super clean light grey aesthetic backdrop

  // Luxury White Clean Header Configuration
  luxuryHeader: { backgroundColor: '#FFFFFF', paddingTop: 60, paddingBottom: 24, paddingHorizontal: 16, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.03, shadowRadius: 15, elevation: 3 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greetingText: { fontSize: 13, color: '#64748B', fontFamily: F_FAMILY, textTransform: 'uppercase', letterSpacing: 0.5 },
  userNameText: { fontSize: 22, color: '#0F172A', fontFamily: F_FAMILY, marginTop: 2 },
  actionRow: { flexDirection: 'row', alignItems: 'center' },
  iconWrapper: { backgroundColor: '#F1F5F9', padding: 10, borderRadius: 14, position: 'relative' },
  badgeBlob: { position: 'absolute', top: -2, right: -2, backgroundColor: '#EF4444', borderRadius: 10, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 3, borderWidth: 2, borderColor: '#FFFFFF' },
  badgeBlobText: { color: '#FFFFFF', fontSize: 9, fontFamily: F_FAMILY },
  glassSearch: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  searchFieldPlaceholder: { color: '#64748B', fontSize: 14, fontFamily: F_FAMILY },

  // Micro-Metrics Dynamic Dashboard Stats
  statsContainer: { paddingHorizontal: 16, marginTop: -15 },
  statsFlexGrid: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 20, paddingVertical: 16, paddingHorizontal: 12, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.06, shadowRadius: 20, elevation: 6, justifyContent: 'space-between' },
  statPod: { alignItems: 'center', flex: 1 },
  statIconCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  statCounter: { fontSize: 16, color: '#0F172A', fontFamily: F_FAMILY },
  statSubtitle: { fontSize: 11, color: '#94A3B8', fontFamily: F_FAMILY, marginTop: 1 },

  // Structural Modular Content Divisions 
  contentBlock: { paddingHorizontal: 16, marginTop: 28 },
  blockHeaderFlex: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  blockHeadingTitle: { fontSize: 18, color: '#0F172A', fontFamily: F_FAMILY },
  actionLinkText: { color: '#4F46E5', fontSize: 13, fontFamily: F_FAMILY },

  // Cinematic Marketing Sliders
  carouselSection: { paddingHorizontal: 16, marginTop: 24 },
  bannerTouch: { width: width - 32, height: 165, borderRadius: 20, overflow: 'hidden' },
  cinematicImage: { width: '100%', height: '100%' },
  bannerScrim: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, paddingTop: 40 },
  scrimTitle: { color: '#FFFFFF', fontSize: 16, fontFamily: F_FAMILY },
  scrimSubtitle: { color: '#E2E8F0', fontSize: 12, fontFamily: F_FAMILY, marginTop: 3 },
  indicatorDotsRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 10, gap: 6 },
  indicatorDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#CBD5E1' },
  indicatorDotActive: { width: 18, backgroundColor: '#4F46E5' },

  // Minimal Premium Segment Control Chips
  categoriesScrollPadding: { paddingRight: 4 },
  premiumChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', marginRight: 10 },
  chipEmoji: { fontSize: 15 },
  chipTextLabel: { fontSize: 13, color: '#475569', fontFamily: F_FAMILY },

  // Modern Live Broadcast Pulse Radar Setup
  liveBadgeIndicatorRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  livePulseRadar: { width: 9, height: 9, borderRadius: 4.5, backgroundColor: '#EF4444' },

  // Minimalist Graceful Fallback States
  fallbackState: { alignItems: 'center', paddingVertical: 40, backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', borderStyle: 'dashed' },
  fallbackStateText: { fontSize: 14, color: '#64748B', marginTop: 10, fontFamily: F_FAMILY },
});

export default HomeScreen;