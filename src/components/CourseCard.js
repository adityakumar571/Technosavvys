import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import FastImage from '@d11/react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../constants/colors';

const CourseCard = ({ course, onPress, horizontal = false }) => {
  const price = course.discountPrice || course.price;
  const hasDiscount = course.price > 0 && course.discountPrice < course.price;

  if (horizontal) {
    return (
      <TouchableOpacity onPress={onPress} style={styles.horizontalCard}>
        <FastImage
          source={{ uri: course.thumbnail || 'https://via.placeholder.com/120x80' }}
          style={styles.horizontalThumbnail}
          resizeMode={FastImage.resizeMode.cover}
        />
        <View style={styles.horizontalInfo}>
          <Text style={styles.category}>{course.category}</Text>
          <Text style={styles.title} numberOfLines={2}>{course.title}</Text>
          <Text style={styles.instructor}>{course.instructor?.name}</Text>
          <View style={styles.priceRow}>
            {course.isFree ? (
              <Text style={styles.freeText}>FREE</Text>
            ) : (
              <>
                <Text style={styles.price}>₹{price}</Text>
                {hasDiscount && <Text style={styles.originalPrice}>₹{course.price}</Text>}
              </>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <FastImage
        source={{ uri: course.thumbnail || 'https://via.placeholder.com/400x200' }}
        style={styles.thumbnail}
        resizeMode={FastImage.resizeMode.cover}
      />
      {course.isFree && (
        <View style={styles.freeBadge}>
          <Text style={styles.freeBadgeText}>FREE</Text>
        </View>
      )}
      <View style={styles.cardBody}>
        <View style={styles.categoryRow}>
          <Text style={styles.category}>{course.category}</Text>
          <Text style={styles.language}>{course.language}</Text>
        </View>
        <Text style={styles.title} numberOfLines={2}>{course.title}</Text>
        <Text style={styles.instructor}>by {course.instructor?.name}</Text>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Icon name="video" size={14} color={COLORS.textSecondary} />
            <Text style={styles.statText}>{course.totalVideos} videos</Text>
          </View>
          <View style={styles.stat}>
            <Icon name="account-group" size={14} color={COLORS.textSecondary} />
            <Text style={styles.statText}>{course.enrolledStudents} students</Text>
          </View>
          {course.rating > 0 && (
            <View style={styles.stat}>
              <Icon name="star" size={14} color={COLORS.accent} />
              <Text style={styles.statText}>{course.rating.toFixed(1)}</Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          {course.isFree ? (
            <Text style={styles.freeText}>FREE</Text>
          ) : (
            <View style={styles.priceRow}>
              <Text style={styles.price}>₹{price}</Text>
              {hasDiscount && (
                <>
                  <Text style={styles.originalPrice}>₹{course.price}</Text>
                  <Text style={styles.discountBadge}>
                    {Math.round(((course.price - price) / course.price) * 100)}% OFF
                  </Text>
                </>
              )}
            </View>
          )}
          <View style={styles.enrollBtn}>
            <Text style={styles.enrollBtnText}>View Course</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  thumbnail: { width: '100%', height: 160 },
  freeBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: COLORS.success,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  freeBadgeText: { color: COLORS.white, fontSize: 12, fontWeight: 'bold' },
  cardBody: { padding: 14 },
  categoryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  category: { fontSize: 12, color: COLORS.primary, fontWeight: '600', backgroundColor: COLORS.primaryLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  language: { fontSize: 12, color: COLORS.textSecondary },
  title: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 4, lineHeight: 22 },
  instructor: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 10 },
  statsRow: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: 12, color: COLORS.textSecondary },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  price: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
  originalPrice: { fontSize: 14, color: COLORS.textLight, textDecorationLine: 'line-through' },
  discountBadge: { fontSize: 12, color: COLORS.success, fontWeight: 'bold' },
  freeText: { fontSize: 18, fontWeight: 'bold', color: COLORS.success },
  enrollBtn: { backgroundColor: COLORS.primaryLight, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  enrollBtnText: { color: COLORS.primary, fontSize: 13, fontWeight: '600' },

  // Horizontal
  horizontalCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginRight: 12,
    width: 280,
    elevation: 2,
    overflow: 'hidden',
  },
  horizontalThumbnail: { width: 100, height: 90 },
  horizontalInfo: { flex: 1, padding: 10 },
});

export default CourseCard;
