import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FastImage from '@d11/react-native-fast-image';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { COLORS, GRADIENTS } from '../../constants/colors';
import { RANK_LEVELS } from '../../constants';

const ProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const getRank = (points) => {
    const rank = [...RANK_LEVELS].reverse().find((r) => points >= r.minPoints);
    return rank || RANK_LEVELS[0];
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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <LinearGradient colors={GRADIENTS.primary} style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Profile</Text>
            <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
              <Icon name="pencil" size={22} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              <FastImage
                source={{ uri: user?.avatar || 'https://via.placeholder.com/80' }}
                style={styles.avatar}
              />
              <View style={[styles.rankBadge, { backgroundColor: rank.color }]}>
                <Text style={styles.rankBadgeText}>⭐</Text>
              </View>
            </View>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <View style={styles.rankChip}>
              <Text style={[styles.rankText, { color: rank.color }]}>{rank.name}</Text>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            {[
              { label: 'Courses', value: user?.enrolledCourses?.length || 0 },
              { label: 'Points', value: user?.points || 0 },
              { label: 'Streak', value: `${user?.streak || 0}🔥` },
              { label: 'Tests', value: user?.testAttempts?.length || 0 },
            ].map((stat, i) => (
              <View key={i} style={styles.statItem}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Premium Banner */}
        {!user?.isPremium && (
          <TouchableOpacity style={styles.premiumBanner}>
            <LinearGradient colors={['#FFD93D', '#FF6B6B']} style={styles.premiumGradient}>
              <Icon name="crown" size={24} color={COLORS.white} />
              <View style={styles.premiumText}>
                <Text style={styles.premiumTitle}>Go Premium</Text>
                <Text style={styles.premiumSubtitle}>Unlock all courses & features</Text>
              </View>
              <Icon name="chevron-right" size={24} color={COLORS.white} />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Menu */}
        <View style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => navigation.navigate(item.screen)}
              style={[styles.menuItem, index < menuItems.length - 1 && styles.menuItemBorder]}
            >
              <View style={[styles.menuIcon, { backgroundColor: item.color + '20' }]}>
                <Icon name={item.icon} size={20} color={item.color} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Icon name="chevron-right" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Icon name="logout" size={20} color={COLORS.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Technosavvys v1.0.0</Text>
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 50, paddingBottom: 24, paddingHorizontal: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.white },
  profileInfo: { alignItems: 'center', marginBottom: 20 },
  avatarContainer: { position: 'relative', marginBottom: 12 },
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)' },
  rankBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  rankBadgeText: { fontSize: 12 },
  userName: { fontSize: 20, fontWeight: 'bold', color: COLORS.white, marginBottom: 4 },
  userEmail: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 8 },
  rankChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 20,
  },
  rankText: { fontSize: 13, fontWeight: 'bold', color: COLORS.white },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16, padding: 16 },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: 'bold', color: COLORS.white },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  premiumBanner: { margin: 16, borderRadius: 16, overflow: 'hidden' },
  premiumGradient: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  premiumText: { flex: 1 },
  premiumTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.white },
  premiumSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.85)' },
  menuCard: { backgroundColor: COLORS.white, marginHorizontal: 16, borderRadius: 16, elevation: 2, marginBottom: 16 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  menuIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  menuLabel: { flex: 1, fontSize: 15, color: COLORS.textPrimary, fontWeight: '500' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    gap: 10,
    elevation: 2,
    marginBottom: 12,
  },
  logoutText: { fontSize: 16, color: COLORS.error, fontWeight: '600' },
  version: { textAlign: 'center', color: COLORS.textLight, fontSize: 12 },
});

export default ProfileScreen;
