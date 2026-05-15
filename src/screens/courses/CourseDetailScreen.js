import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, FlatList,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FastImage from 'react-native-fast-image';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourseById } from '../../store/slices/courseSlice';
import { COLORS, GRADIENTS } from '../../constants/colors';

const CourseDetailScreen = ({ navigation, route }) => {
  const { courseId } = route.params;
  const dispatch = useDispatch();
  const { selectedCourse: course } = useSelector((state) => state.courses);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchCourseById(courseId));
  }, [courseId]);

  if (!course) return (
    <View style={styles.loading}>
      <Text>Loading...</Text>
    </View>
  );

  const isEnrolled = user?.enrolledCourses?.some((c) => c._id === courseId || c === courseId);
  const price = course.discountPrice || course.price;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Thumbnail */}
        <View style={styles.thumbnailContainer}>
          <FastImage
            source={{ uri: course.thumbnail || 'https://via.placeholder.com/400x220' }}
            style={styles.thumbnail}
          />
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-left" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.categoryRow}>
            <Text style={styles.category}>{course.category}</Text>
            <Text style={styles.language}>{course.language}</Text>
          </View>
          <Text style={styles.title}>{course.title}</Text>
          <Text style={styles.instructor}>by {course.instructor?.name}</Text>

          {/* Stats */}
          <View style={styles.statsRow}>
            {[
              { icon: 'video', value: `${course.totalVideos} Videos` },
              { icon: 'account-group', value: `${course.enrolledStudents} Students` },
              { icon: 'star', value: `${course.rating?.toFixed(1) || '0'} Rating` },
            ].map((s, i) => (
              <View key={i} style={styles.stat}>
                <Icon name={s.icon} size={16} color={COLORS.primary} />
                <Text style={styles.statText}>{s.value}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.description}>{course.description}</Text>

          {/* Highlights */}
          {course.highlights?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What you'll learn</Text>
              {course.highlights.map((h, i) => (
                <View key={i} style={styles.highlightItem}>
                  <Icon name="check-circle" size={16} color={COLORS.success} />
                  <Text style={styles.highlightText}>{h}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View>
          {course.isFree ? (
            <Text style={styles.freeText}>FREE</Text>
          ) : (
            <>
              <Text style={styles.price}>₹{price}</Text>
              {course.price > price && (
                <Text style={styles.originalPrice}>₹{course.price}</Text>
              )}
            </>
          )}
        </View>
        {isEnrolled ? (
          <TouchableOpacity
            onPress={() => navigation.navigate('BatchDetail', { batchId: course.batches?.[0] })}
            style={styles.enrolledBtn}
          >
            <Text style={styles.enrolledBtnText}>Continue Learning</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => navigation.navigate('Payment', { course })}
            style={styles.enrollBtn}
          >
            <LinearGradient colors={GRADIENTS.primary} style={styles.enrollBtnGradient}>
              <Text style={styles.enrollBtnText}>{course.isFree ? 'Enroll Free' : 'Buy Now'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  thumbnailContainer: { position: 'relative' },
  thumbnail: { width: '100%', height: 220 },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  content: { padding: 16 },
  categoryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  category: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  language: { fontSize: 13, color: COLORS.textSecondary },
  title: { fontSize: 22, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 6 },
  instructor: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 16 },
  statsRow: { flexDirection: 'row', gap: 20, marginBottom: 16 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statText: { fontSize: 13, color: COLORS.textSecondary },
  description: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 22, marginBottom: 16 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 12 },
  highlightItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  highlightText: { flex: 1, fontSize: 14, color: COLORS.textPrimary, lineHeight: 20 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  price: { fontSize: 22, fontWeight: 'bold', color: COLORS.primary },
  originalPrice: { fontSize: 14, color: COLORS.textLight, textDecorationLine: 'line-through' },
  freeText: { fontSize: 22, fontWeight: 'bold', color: COLORS.success },
  enrollBtn: { borderRadius: 12, overflow: 'hidden' },
  enrollBtnGradient: { paddingHorizontal: 28, paddingVertical: 14 },
  enrollBtnText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  enrolledBtn: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
  },
});

export default CourseDetailScreen;
