import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourses } from '../../store/slices/courseSlice';
import { COLORS } from '../../constants/colors';
import { CATEGORIES } from '../../constants';
import CourseCard from '../../components/CourseCard';
import CategoryChip from '../../components/CategoryChip';

const CoursesScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { list: courses, isLoading } = useSelector((state) => state.courses);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchCourses({ category: selectedCategory, limit: 20 }));
  }, [selectedCategory]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchCourses({ category: selectedCategory, limit: 20 }));
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Courses</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Search')}>
          <Icon name="magnify" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={courses}
        renderItem={({ item }) => (
          <CourseCard
            course={item}
            onPress={() => navigation.navigate('CourseDetail', { courseId: item._id })}
          />
        )}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
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
            style={styles.categories}
          />
        }
        ListEmptyComponent={
          !isLoading && (
            <View style={styles.empty}>
              <Icon name="book-open-outline" size={60} color={COLORS.textLight} />
              <Text style={styles.emptyText}>No courses found</Text>
            </View>
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: COLORS.white,
    elevation: 2,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary },
  categories: { paddingHorizontal: 16, paddingVertical: 12 },
  list: { padding: 16 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 16, color: COLORS.textSecondary, marginTop: 12 },
});

export default CoursesScreen;
