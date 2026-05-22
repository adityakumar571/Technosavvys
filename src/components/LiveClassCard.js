import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import FastImage from '@d11/react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';
import { COLORS } from '../constants/colors';

const LiveClassCard = ({ item, onPress }) => {
  const isLive = item.status === 'live';
  const isScheduled = item.status === 'scheduled';

  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <View style={styles.thumbnailContainer}>
        <FastImage
          source={{ uri: item.thumbnail || 'https://via.placeholder.com/200x120' }}
          style={styles.thumbnail}
          resizeMode={FastImage.resizeMode.cover}
        />
        <View style={[styles.statusBadge, isLive ? styles.liveBadge : styles.scheduledBadge]}>
          {isLive && <View style={styles.liveDot} />}
          <Text style={styles.statusText}>{isLive ? 'LIVE' : 'UPCOMING'}</Text>
        </View>
        {isLive && (
          <View style={styles.viewerCount}>
            <Icon name="eye" size={12} color={COLORS.white} />
            <Text style={styles.viewerText}>{item.currentViewers || 0}</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.subject}>{item.subject}</Text>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <View style={styles.instructorRow}>
          <FastImage
            source={{ uri: item.instructor?.avatar || 'https://via.placeholder.com/30' }}
            style={styles.instructorAvatar}
          />
          <Text style={styles.instructorName}>{item.instructor?.name}</Text>
        </View>
        <View style={styles.timeRow}>
          <Icon name="clock-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.timeText}>
            {isLive ? 'Started ' : ''}{moment(item.scheduledAt).fromNow()}
          </Text>
          <Text style={styles.duration}>• {item.duration} min</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 220,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginRight: 12,
    elevation: 3,
    overflow: 'hidden',
  },
  thumbnailContainer: { position: 'relative' },
  thumbnail: { width: '100%', height: 120 },
  statusBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  liveBadge: { backgroundColor: COLORS.live },
  scheduledBadge: { backgroundColor: 'rgba(0,0,0,0.6)' },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.white },
  statusText: { color: COLORS.white, fontSize: 11, fontWeight: 'bold' },
  viewerCount: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 3,
  },
  viewerText: { color: COLORS.white, fontSize: 11 },
  info: { padding: 12 },
  subject: { fontSize: 11, color: COLORS.primary, fontWeight: '600', marginBottom: 4 },
  title: { fontSize: 14, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 8, lineHeight: 20 },
  instructorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  instructorAvatar: { width: 20, height: 20, borderRadius: 10 },
  instructorName: { fontSize: 12, color: COLORS.textSecondary },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timeText: { fontSize: 12, color: COLORS.textSecondary },
  duration: { fontSize: 12, color: COLORS.textSecondary },
});

export default LiveClassCard;
