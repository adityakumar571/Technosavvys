import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  FlatList, RefreshControl, StatusBar, TextInput,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FastImage from '@d11/react-native-fast-image';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourses } from '../../store/slices/courseSlice';
import { fetchLiveClasses } from '../../store/slices/liveSlice';
import { fetchNotifications } from '../../store/slices/notificationSlice';
import { COLORS, GRADIENTS } from '../../constants/colors';
import { CATEGORIES } from '../../constants';
import CourseCard from '../../components/CourseCard';
import LiveClassCard from '../../components/LiveClassCard';
import CategoryChip from '../../components/CategoryChip';
import moment from 'moment';

const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { list: courses, isLoading } = useSelector((state) => state.courses);
  const { classes: liveClasses } = useSelector((state) => state.live);
  const { unreadCount } = useSelector((state) => state.notifications);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      dispatch(fetchCourses({ limit: 6 })),
      dispatch(fetchLiveClasses()),
      dispatch(fetchNotifications()),
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filteredCourses = selectedCategory
    ? courses.filter((c) => c.category === selectedCategory)
    : courses;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <LinearGradient colors={GRADIENTS.primary} style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>{greeting()}, 👋</Text>
              <Text style={styles.userName}>{user?.name || 'Student'}</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={() => navigation.navigate('Search')}
                style={styles.headerBtn}
              >
                <Icon name="magnify" size={24} color={COLORS.white} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('Notifications')}
                style={styles.headerBtn}
              >
                <Icon name="bell-outline" size={24} color={COLORS.white} />
                {unreadCount > 0 && (
                  <View style={styles.notifBadge}>
                    <Text style={styles.notifBadgeText}>{unreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Bar */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Search')}
            style={styles.searchBar}
          >
            <Icon name="magnify" size={20} color={COLORS.textSecondary} />
            <Text style={styles.searchPlaceholder}>Search courses, batches...</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Stats Banner */}
        <View style={styles.statsBanner}>
          {[
            { label: 'Courses', value: user?.enrolledCourses?.length || 0, icon: 'book-open' },
            { label: 'Streak', value: `${user?.streak || 0}🔥`, icon: 'fire' },
            { label: 'Points', value: user?.points || 0, icon: 'star' },
          ].map((stat, i) => (
            <View key={i} style={styles.statItem}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Live Classes */}
        {liveClasses.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
                <Text style={styles.sectionTitle}>Live Now</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('Live')}>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={liveClasses.slice(0, 5)}
              renderItem={({ item }) => (
                <LiveClassCard
                  item={item}
                  onPress={() => navigation.navigate('LiveClass', { liveClassId: item._id })}
                />
              )}
              keyExtractor={(item) => item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </View>
        )}

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <FlatList
            data={[{ id: null, label: 'All', icon: '🌟' }, ...CATEGORIES]}
            renderItem={({ item }) => (
              <CategoryChip
                item={item}
                isSelected={selectedCategory === item.id}
                onPress={() => setSelectedCategory(item.id)}
              />
            )}
            keyExtractor={(item) => String(item.id)}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>

        {/* Courses */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Courses</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Courses')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {isLoading ? (
            <Text style={styles.loadingText}>Loading...</Text>
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

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  greeting: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  userName: { fontSize: 20, fontWeight: 'bold', color: COLORS.white },
  headerActions: { flexDirection: 'row', gap: 8 },
  headerBtn: { padding: 8, position: 'relative' },
  notifBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.error,
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifBadgeText: { color: COLORS.white, fontSize: 9, fontWeight: 'bold' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  searchPlaceholder: { color: COLORS.textSecondary, fontSize: 14 },
  statsBanner: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: -1,
    borderRadius: 16,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    justifyContent: 'space-around',
  },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary },
  statLabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  section: { paddingHorizontal: 16, marginTop: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary },
  seeAll: { color: COLORS.primary, fontSize: 14, fontWeight: '500' },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  liveDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.live },
  horizontalList: { paddingRight: 16 },
  loadingText: { color: COLORS.textSecondary, textAlign: 'center', padding: 20 },
});

export default HomeScreen;
