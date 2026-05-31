import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FastImage from '@d11/react-native-fast-image';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourseById } from '../../store/slices/courseSlice';
import { COLORS, GRADIENTS } from '../../constants/colors';
import Skeleton from '../../components/Skeleton';

const F = { urbanist: 'Urbanist-Medium' };

const CourseDetailScreen = ({ navigation, route }) => {
  const { courseId } = route.params;
  const dispatch = useDispatch();
  const { selectedCourse: course, isLoading } = useSelector((s) => s.courses);
  const { user } = useSelector((s) => s.auth);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { dispatch(fetchCourseById(courseId)); }, [courseId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchCourseById(courseId));
    setRefreshing(false);
  };

  const isEnrolled = user?.enrolledCourses?.some(
    (c) => String(c._id || c) === String(courseId)
  );

  const price = course?.discountPrice > 0 ? course.discountPrice : (course?.price || 0);
  const isFree = course?.isFree || price === 0;

  if (!course && !isLoading) {
    return (
      <View style={s.errorBox}>
        <Icon name="alert-circle-outline" size={48} color={COLORS.textLight} />
        <Text style={s.errorText}>Course not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.retryBtn}>
          <Text style={s.retryText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {/* Thumbnail */}
        <View style={s.thumbWrap}>
          {isLoading || !course ? (
            <Skeleton width="100%" height={220} borderRadius={0} />
          ) : (
            <FastImage
              source={{ uri: course.thumbnail || `https://ui-avatars.com/api/?name=${encodeURIComponent(course.title)}&size=400&background=6C63FF&color=fff` }}
              style={s.thumbnail}
              resizeMode={FastImage.resizeMode.cover}
            />
          )}
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Icon name="arrow-left" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <View style={s.content}>
          {isLoading || !course ? (
            // Skeleton
            <View style={{ gap: 10 }}>
              <Skeleton width={80} height={20} borderRadius={10} />
              <Skeleton width="90%" height={22} />
              <Skeleton width="60%" height={16} />
              <View style={{ flexDirection: 'row', gap: 16, marginTop: 4 }}>
                <Skeleton width={80} height={14} />
                <Skeleton width={80} height={14} />
                <Skeleton width={80} height={14} />
              </View>
              <Skeleton width="100%" height={60} style={{ marginTop: 8 }} />
            </View>
          ) : (
            <>
              {/* Category & Language */}
              <View style={s.tagRow}>
                <View style={s.catChip}>
                  <Text style={s.catText}>{course.category}</Text>
                </View>
                <Text style={s.langText}>{course.language}</Text>
                <Text style={s.levelText}>{course.level}</Text>
              </View>

              <Text style={s.title}>{course.title}</Text>
              <Text style={s.instructor}>by {course.instructor?.name || 'Instructor'}</Text>

              {/* Stats */}
              <View style={s.statsRow}>
                {[
                  { icon: 'video', value: `${course.totalVideos || 0} Videos` },
                  { icon: 'account-group', value: `${course.enrolledStudents || 0} Students` },
                  { icon: 'star', value: `${course.rating?.toFixed(1) || '0'} ★` },
                  { icon: 'clock-outline', value: `${course.validityDays || 365} days` },
                ].map((stat, i) => (
                  <View key={i} style={s.stat}>
                    <Icon name={stat.icon} size={14} color={COLORS.primary} />
                    <Text style={s.statText}>{stat.value}</Text>
                  </View>
                ))}
              </View>

              {/* Features */}
              <View style={s.featuresRow}>
                {[
                  { icon: 'video', label: 'Videos', active: course.hasRecordedVideos },
                  { icon: 'video-wireless', label: 'Live', active: course.hasLiveClasses },
                  { icon: 'file-pdf-box', label: 'Notes', active: course.hasNotes },
                  { icon: 'clipboard-text', label: 'Tests', active: course.hasTests },
                  { icon: 'chat-question', label: 'Doubts', active: course.hasDoubtSupport },
                ].filter(f => f.active).map((f, i) => (
                  <View key={i} style={s.featureChip}>
                    <Icon name={f.icon} size={14} color={COLORS.primary} />
                    <Text style={s.featureLabel}>{f.label}</Text>
                  </View>
                ))}
              </View>

              <Text style={s.description}>{course.description}</Text>

              {/* Highlights */}
              {course.highlights?.length > 0 && (
                <View style={s.section}>
                  <Text style={s.sectionTitle}>What you'll learn</Text>
                  {course.highlights.map((h, i) => (
                    <View key={i} style={s.highlightItem}>
                      <Icon name="check-circle" size={16} color={COLORS.success} />
                      <Text style={s.highlightText}>{h}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Syllabus */}
              {course.syllabus?.length > 0 && (
                <View style={s.section}>
                  <Text style={s.sectionTitle}>Syllabus</Text>
                  {course.syllabus.map((sec, i) => (
                    <View key={i} style={s.syllabusItem}>
                      <Text style={s.syllabusTitle}>{sec.title}</Text>
                      {sec.topics?.map((t, j) => (
                        <Text key={j} style={s.syllabusTopicText}>• {t}</Text>
                      ))}
                    </View>
                  ))}
                </View>
              )}

              {/* Batches */}
              {course.batches?.length > 0 && (
                <View style={s.section}>
                  <Text style={s.sectionTitle}>Available Batches</Text>
                  {course.batches.map((batch, i) => (
                    <TouchableOpacity
                      key={batch._id || i}
                      onPress={() => navigation.navigate('BatchDetail', { batchId: batch._id || batch })}
                      style={s.batchItem}
                    >
                      <Icon name="school" size={20} color={COLORS.primary} />
                      <Text style={s.batchName}>{batch.name || 'Batch'}</Text>
                      <Icon name="arrow-right" size={16} color={COLORS.textLight} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Footer */}
      {course && (
        <View style={s.footer}>
          <View style={s.footerLeft}>
            {isFree ? (
              <Text style={s.freeText}>FREE</Text>
            ) : (
              <>
                <Text style={s.price}>₹{price}</Text>
                {course.price > price && (
                  <Text style={s.originalPrice}>₹{course.price}</Text>
                )}
              </>
            )}
          </View>

          {isEnrolled ? (
            <TouchableOpacity
              onPress={() => {
                if (course.batches?.length > 0) {
                  const firstBatch = course.batches[0];
                  navigation.navigate('BatchDetail', { batchId: firstBatch._id || firstBatch });
                }
              }}
              style={s.enrolledBtn}
            >
              <Icon name="play-circle" size={18} color={COLORS.white} />
              <Text style={s.enrolledBtnText}>Continue Learning</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => navigation.navigate('Payment', { course })}
              style={s.enrollBtn}
              activeOpacity={0.85}
            >
              <LinearGradient colors={isFree ? [COLORS.success, '#2E7D32'] : GRADIENTS.primary} style={s.enrollBtnGrad}>
                <Icon name={isFree ? 'check-circle' : 'lock-open'} size={18} color={COLORS.white} />
                <Text style={s.enrollBtnText}>{isFree ? 'Enroll Free' : 'Buy Now'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  errorBox: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 32 },
  errorText: { fontSize: 16, color: COLORS.textSecondary, fontFamily: F.urbanist },
  retryBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  retryText: { color: COLORS.white, fontFamily: F.urbanist },

  thumbWrap: { position: 'relative' },
  thumbnail: { width: '100%', height: 220 },
  backBtn: { position: 'absolute', top: 52, left: 16, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 20, padding: 8 },

  content: { padding: 16 },
  tagRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' },
  catChip: { backgroundColor: COLORS.primaryLight, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  catText: { fontSize: 12, color: COLORS.primary, fontWeight: '600', fontFamily: F.urbanist },
  langText: { fontSize: 12, color: COLORS.textSecondary, fontFamily: F.urbanist },
  levelText: { fontSize: 12, color: COLORS.textSecondary, fontFamily: F.urbanist },

  title: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 6, fontFamily: F.urbanist },
  instructor: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 14, fontFamily: F.urbanist },

  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 14 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statText: { fontSize: 12, color: COLORS.textSecondary, fontFamily: F.urbanist },

  featuresRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  featureChip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: COLORS.primaryLight, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  featureLabel: { fontSize: 12, color: COLORS.primary, fontFamily: F.urbanist },

  description: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22, marginBottom: 16, fontFamily: F.urbanist },

  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12, fontFamily: F.urbanist },
  highlightItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  highlightText: { flex: 1, fontSize: 14, color: COLORS.textPrimary, lineHeight: 20, fontFamily: F.urbanist },

  syllabusItem: { backgroundColor: COLORS.white, borderRadius: 12, padding: 14, marginBottom: 8, elevation: 1 },
  syllabusTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 6, fontFamily: F.urbanist },
  syllabusTopicText: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 3, fontFamily: F.urbanist },

  batchItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 12, padding: 14, marginBottom: 8, gap: 12, elevation: 1 },
  batchName: { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, fontFamily: F.urbanist },

  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border },
  footerLeft: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  price: { fontSize: 22, fontWeight: '700', color: COLORS.primary, fontFamily: F.urbanist },
  originalPrice: { fontSize: 14, color: COLORS.textLight, textDecorationLine: 'line-through', fontFamily: F.urbanist },
  freeText: { fontSize: 22, fontWeight: '700', color: COLORS.success, fontFamily: F.urbanist },
  enrollBtn: { borderRadius: 14, overflow: 'hidden' },
  enrollBtnGrad: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 14, gap: 8 },
  enrollBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '700', fontFamily: F.urbanist },
  enrolledBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.success, paddingHorizontal: 20, paddingVertical: 14, borderRadius: 14, gap: 8 },
  enrolledBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '700', fontFamily: F.urbanist },
});

export default CourseDetailScreen;
