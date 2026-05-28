import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';

const Skeleton = ({ width, height, borderRadius = 8, style }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      style={[
        { width, height, borderRadius, backgroundColor: '#E5E7EB', opacity },
        style,
      ]}
    />
  );
};

// ─── Preset Skeletons ─────────────────────────────────────────────────────────

export const CourseCardSkeleton = () => (
  <View style={sk.card}>
    <Skeleton width="100%" height={160} borderRadius={0} />
    <View style={sk.cardBody}>
      <Skeleton width={80} height={20} borderRadius={10} />
      <Skeleton width="90%" height={18} style={{ marginTop: 8 }} />
      <Skeleton width="60%" height={14} style={{ marginTop: 6 }} />
      <View style={sk.row}>
        <Skeleton width={60} height={14} />
        <Skeleton width={60} height={14} />
      </View>
      <View style={sk.rowBetween}>
        <Skeleton width={70} height={22} />
        <Skeleton width={90} height={32} borderRadius={16} />
      </View>
    </View>
  </View>
);

export const BannerSkeleton = () => (
  <Skeleton width="100%" height={160} borderRadius={16} style={{ marginHorizontal: 0 }} />
);

export const CategorySkeleton = () => (
  <View style={sk.row}>
    {[1, 2, 3, 4].map((i) => (
      <Skeleton key={i} width={80} height={36} borderRadius={20} style={{ marginRight: 8 }} />
    ))}
  </View>
);

export const LiveCardSkeleton = () => (
  <View style={sk.liveCard}>
    <Skeleton width={200} height={110} borderRadius={12} />
    <View style={{ padding: 10 }}>
      <Skeleton width={160} height={14} />
      <Skeleton width={100} height={12} style={{ marginTop: 6 }} />
      <Skeleton width={60} height={20} borderRadius={10} style={{ marginTop: 8 }} />
    </View>
  </View>
);

export const StatSkeleton = () => (
  <View style={sk.statRow}>
    {[1, 2, 3].map((i) => (
      <View key={i} style={sk.statItem}>
        <Skeleton width={40} height={24} borderRadius={6} />
        <Skeleton width={50} height={12} borderRadius={4} style={{ marginTop: 4 }} />
      </View>
    ))}
  </View>
);

export const TestCardSkeleton = () => (
  <View style={sk.card}>
    <View style={sk.cardBody}>
      <Skeleton width={80} height={20} borderRadius={10} />
      <Skeleton width="85%" height={18} style={{ marginTop: 8 }} />
      <Skeleton width="50%" height={14} style={{ marginTop: 6 }} />
      <View style={sk.row}>
        <Skeleton width={80} height={14} />
        <Skeleton width={60} height={14} />
        <Skeleton width={70} height={14} />
      </View>
    </View>
  </View>
);

export const ProfileHeaderSkeleton = () => (
  <View style={{ alignItems: 'center', paddingVertical: 24 }}>
    <Skeleton width={80} height={80} borderRadius={40} />
    <Skeleton width={140} height={20} borderRadius={6} style={{ marginTop: 12 }} />
    <Skeleton width={180} height={14} borderRadius={4} style={{ marginTop: 6 }} />
    <Skeleton width={80} height={26} borderRadius={13} style={{ marginTop: 10 }} />
  </View>
);

export const NotifSkeleton = () => (
  <View style={sk.notifItem}>
    <Skeleton width={44} height={44} borderRadius={22} />
    <View style={{ flex: 1, marginLeft: 12 }}>
      <Skeleton width="70%" height={14} />
      <Skeleton width="90%" height={12} style={{ marginTop: 6 }} />
    </View>
  </View>
);

const sk = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
  },
  cardBody: { padding: 14, gap: 6 },
  row: { flexDirection: 'row', gap: 12, marginTop: 8 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  liveCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 12,
    width: 200,
    overflow: 'hidden',
    elevation: 2,
  },
  statRow: { flexDirection: 'row', justifyContent: 'space-around', padding: 16 },
  statItem: { alignItems: 'center' },
  notifItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
});

export default Skeleton;
