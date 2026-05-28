import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourses } from '../../store/slices/courseSlice';
import { fetchCategories } from '../../store/slices/categorySlice';
import { COLORS } from '../../constants/colors';
import CourseCard from '../../components/CourseCard';
import { CourseCardSkeleton, CategorySkeleton } from '../../components/Skeleton';

const F = { urbanist: 'Urbanist-Medium' };

const CoursesScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { list: courses, isLoading, total } = useSelector((s) => s.courses);
  const { list: categories, isLoading: catsLoading } = useSelector((s) => s.categories);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const load = useCallback((pg = 1, cat = selectedCategory) => {
    dispatch(fetchCourses({ category: cat || undefined, limit: 10, page: pg }));
  }, [dispatch, selectedCategory]);

  useEffect(() => {
    dispatch(fetchCategories());
    load(1);
  }, []);

  useEffect(() => {
    setPage(1);
    load(1, selectedCategory);
  }, [selectedCategory]);

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await dispatch(fetchCourses({ category: selectedCategory || undefined, limit: 10, page: 1 }));
    setRefreshing(false);
  };

  const loadMore = async () => {
    if (loadingMore || courses.length >= total) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    await dispatch(fetchCourses({ category: selectedCategory || undefined, limit: 10, page: nextPage }));
    setLoadingMore(false);
  };

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <View style={s.header}>
        <Text style={s.headerTitle}>All Courses</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Search')}>
          <Icon name="magnify" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={isLoading && page === 1 ? [] : courses}
        renderItem={({ item }) => (
          <CourseCard
            course={item}
            onPress={() => navigation.navigate('CourseDetail', { courseId: item._id })}
          />
        )}
        keyExtractor={(item) => item._id}
        contentContainerStyle={s.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={
          <View>
            {/* Category Filter */}
            <View style={s.catWrap}>
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
            {/* Count */}
            <Text style={s.countText}>{total || 0} courses found</Text>
            {/* Skeleton */}
            {isLoading && page === 1 && [1, 2, 3].map((i) => <CourseCardSkeleton key={i} />)}
          </View>
        }
        ListFooterComponent={loadingMore ? <CourseCardSkeleton /> : null}
        ListEmptyComponent={
          !isLoading ? (
            <View style={s.empty}>
              <Icon name="book-open-outline" size={56} color={COLORS.textLight} />
              <Text style={s.emptyTitle}>No courses found</Text>
              <Text style={s.emptySub}>Try a different category</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 52, paddingBottom: 14, backgroundColor: COLORS.white, elevation: 2 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, fontFamily: F.urbanist },
  catWrap: { paddingHorizontal: 16, paddingVertical: 12 },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.white, borderWidth: 1.5, borderColor: COLORS.border, marginRight: 8 },
  catIcon: { fontSize: 15 },
  catLabel: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500', fontFamily: F.urbanist },
  countText: { fontSize: 13, color: COLORS.textSecondary, paddingHorizontal: 16, marginBottom: 8, fontFamily: F.urbanist },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: COLORS.textSecondary, fontFamily: F.urbanist },
  emptySub: { fontSize: 13, color: COLORS.textLight, fontFamily: F.urbanist },
});

export default CoursesScreen;
