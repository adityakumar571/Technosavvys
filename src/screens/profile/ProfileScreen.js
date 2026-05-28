import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Alert, RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FastImage from '@d11/react-native-fast-image';
import { useDispatch, useSelector } from 'react-redux';
import { logout, fetchMe } from '../../store/slices/authSlice';
import { COLORS, GRADIENTS } from '../../constants/colors';
import { RANK_LEVELS } from '../../constants';
import { ProfileHeaderSkeleton } from '../../components/Skeleton';
import Skeleton from '../../components/Skeleton';

const F = { urbanist: 'Urbanist-Medium' };

const getRank = (points) => {
  return [...RANK_LEVELS].reverse().find((r) => points >= r.minPoints) || RANK_LEVELS[0];
};

const ProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((s) => s.auth);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() => { dispatch(fetchMe()); }, [dispatch]);
  useEffect(() => { load(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchMe());
    setRefreshing(false);
  };

  const rank = getRank(user?.points || 0);

  const menuItems = [
    { icon: 'book-open', label: 'My Courses', screen: 'Courses', color: COLORS.primary },
    { icon: 'history', label: 'Watch History', screen: 'WatchHistory', color: COLORS.info },
    { icon: 'bookmark', label: 'Bookmarks', screen: 'Bookmarks', color: COLORS.warning },
    { icon: 'clipboard-text', label: 'My Tests', screen: 'TestsMain', color: COLORS.success },
    { icon: 'credit-card', label: 'Payment History', screen: 'PaymentHistory', color: COLORS.secondary },
    { icon: 'chat-question', label: 'My Doubts', screen: 'Doubts', color: '#9C27B0' },
    { icon: 'cog', label: 'Settings', screen: 'Settings', color: COLORS.textSecondary },
  ];

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => dispatch(logout()) },
    ]);
  };

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.white} />}
      >
        {/* ── Header ── */}
        <LinearGradient colors={GRADIENTS.primary} style={s.header}>
          <View style={s.headerTop}>
            <Text style={s.headerTitle}>Profile</Text>
            <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
              <Icon name="pencil" size={22} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          {isLoading && !user ? (
            <ProfileHeaderSkeleton />
          ) : (
            <View style={s.profileInfo}>
              <View style={s.avatarWrap}>
                <FastImage
                  source={{ uri: user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=6C63FF&color=fff&size=80` }}
                  style={s.avatar}
                />
                <View style={[s.rankDot, { backgroundColor: rank.color }]} />
              </View>
              <Text style={s.userName}>{user?.name || '—'}</Text>
              <Text style={s.userEmail}>{user?.email || '—'}</Text>
              <View style={[s.rankChip, { borderColor: rank.color + '60' }]}>
                <Text style={[s.rankText, { color: rank.color }]}>{rank.name}</Text>
              </View>
            </View>
          )}

          {/* Stats */}
          <View style={s.statsRow}>
            {isLoading && !user ? (
              [1, 2, 3, 4].map((i) => (
                <View key={i} style={s.statItem}>
                  <Skeleton width={36} height={20} borderRadius={4} />
                  <Skeleton width={44} height={11} borderRadius={3} style={{ marginTop: 4 }} />
                </View>
              ))
            ) : (
              [
                { label: 'Courses', value: user?.enrolledCourses?.length ?? 0 },
                { label: 'Points', value: user?.points ?? 0 },
                { label: 'Streak', value: `${user?.streak ?? 0}🔥` },
                { label: 'Tests', value: user?.testAttempts?.length ?? 0 },
              ].map((stat, i) => (
                <View key={i} style={s.statItem}>
                  <Text style={s.statValue}>{stat.value}</Text>
                  <Text style={s.statLabel}>{stat.label}</Text>
                </View>
              ))
            )}
          </View>
        </LinearGradient>

        {/* ── Premium Banner ── */}
        {!user?.isPremium && (
          <TouchableOpacity style={s.premiumWrap} activeOpacity={0.9}>
            <LinearGradient colors={['#FFD93D', '#FF6B6B']} style={s.premiumGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Icon name="crown" size={22} color={COLORS.white} />
              <View style={{ flex: 1 }}>
                <Text style={s.premiumTitle}>Go Premium</Text>
                <Text style={s.premiumSub}>Unlock all courses & features</Text>
              </View>
              <Icon name="chevron-right" size={22} color={COLORS.white} />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* ── Menu ── */}
        <View style={s.menuCard}>
          {menuItems.map((item, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => navigation.navigate(item.screen)}
              style={[s.menuItem, i < menuItems.length - 1 && s.menuBorder]}
            >
              <View style={[s.menuIcon, { backgroundColor: item.color + '18' }]}>
                <Icon name={item.icon} size={20} color={item.color} />
              </View>
              <Text style={s.menuLabel}>{item.label}</Text>
              <Icon name="chevron-right" size={18} color={COLORS.textLight} />
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Logout ── */}
        <TouchableOpacity onPress={handleLogout} style={s.logoutBtn}>
          <Icon name="logout" size={20} color={COLORS.error} />
          <Text style={s.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={s.version}>Technosavvys v2.0.0</Text>
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 52, paddingBottom: 24, paddingHorizontal: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.white, fontFamily: F.urbanist },
  profileInfo: { alignItems: 'center', marginBottom: 20 },
  avatarWrap: { position: 'relative', marginBottom: 12 },
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)' },
  rankDot: { position: 'absolute', bottom: 2, right: 2, width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: COLORS.white },
  userName: { fontSize: 20, fontWeight: '700', color: COLORS.white, fontFamily: F.urbanist, marginBottom: 4 },
  userEmail: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontFamily: F.urbanist, marginBottom: 10 },
  rankChip: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 16, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  rankText: { fontSize: 13, fontWeight: '700', fontFamily: F.urbanist },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16, padding: 16 },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '700', color: COLORS.white, fontFamily: F.urbanist },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2, fontFamily: F.urbanist },
  premiumWrap: { margin: 16, borderRadius: 16, overflow: 'hidden' },
  premiumGrad: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  premiumTitle: { fontSize: 15, fontWeight: '700', color: COLORS.white, fontFamily: F.urbanist },
  premiumSub: { fontSize: 12, color: 'rgba(255,255,255,0.85)', fontFamily: F.urbanist },
  menuCard: { backgroundColor: COLORS.white, marginHorizontal: 16, borderRadius: 16, elevation: 2, marginBottom: 16 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  menuBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  menuIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  menuLabel: { flex: 1, fontSize: 15, color: COLORS.textPrimary, fontWeight: '500', fontFamily: F.urbanist },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.white, marginHorizontal: 16, borderRadius: 16, padding: 16, gap: 10, elevation: 2, marginBottom: 12 },
  logoutText: { fontSize: 15, color: COLORS.error, fontWeight: '600', fontFamily: F.urbanist },
  version: { textAlign: 'center', color: COLORS.textLight, fontSize: 12, fontFamily: F.urbanist },
});

export default ProfileScreen;
