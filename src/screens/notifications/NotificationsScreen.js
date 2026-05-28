import React, { useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markAllRead } from '../../store/slices/notificationSlice';
import { COLORS } from '../../constants/colors';
import { NotifSkeleton } from '../../components/Skeleton';
import api from '../../services/api';

const F = { urbanist: 'Urbanist-Medium' };

const TYPE_ICONS = {
  live_class: { icon: 'video-wireless', color: '#F44336' },
  new_video: { icon: 'play-circle', color: '#6C63FF' },
  new_note: { icon: 'file-pdf-box', color: '#FF5722' },
  test: { icon: 'clipboard-text', color: '#FF9800' },
  doubt_reply: { icon: 'chat-question', color: '#9C27B0' },
  payment: { icon: 'credit-card', color: '#4CAF50' },
  announcement: { icon: 'bullhorn', color: '#2196F3' },
  general: { icon: 'bell', color: '#607D8B' },
};

const NotificationsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { list: notifications, isLoading, unreadCount } = useSelector((s) => s.notifications);

  const load = useCallback(() => { dispatch(fetchNotifications()); }, [dispatch]);
  useEffect(() => { load(); }, []);

  const handleMarkAllRead = () => { dispatch(markAllRead()); };

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      dispatch(fetchNotifications());
    } catch (_) {}
  };

  const renderItem = ({ item }) => {
    const meta = TYPE_ICONS[item.type] || TYPE_ICONS.general;
    return (
      <TouchableOpacity
        onPress={() => handleMarkRead(item._id)}
        style={[s.item, !item.isRead && s.itemUnread]}
        activeOpacity={0.8}
      >
        <View style={[s.iconBox, { backgroundColor: meta.color + '18' }]}>
          <Icon name={meta.icon} size={22} color={meta.color} />
        </View>
        <View style={s.itemContent}>
          <Text style={s.itemTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={s.itemMsg} numberOfLines={2}>{item.message}</Text>
          <Text style={s.itemTime}>
            {new Date(item.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
          </Text>
        </View>
        {!item.isRead && <View style={s.unreadDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Icon name="arrow-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Notifications</Text>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text style={s.markAll}>Mark all read</Text>
          </TouchableOpacity>
        ) : <View style={{ width: 80 }} />}
      </View>

      {unreadCount > 0 && (
        <View style={s.unreadBanner}>
          <Icon name="bell-badge" size={16} color={COLORS.primary} />
          <Text style={s.unreadBannerText}>{unreadCount} unread notification{unreadCount > 1 ? 's' : ''}</Text>
        </View>
      )}

      <FlatList
        data={isLoading ? [] : notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={false} onRefresh={load} tintColor={COLORS.primary} />}
        ListHeaderComponent={isLoading ? (
          <View>{[1, 2, 3, 4, 5].map((i) => <NotifSkeleton key={i} />)}</View>
        ) : null}
        ListEmptyComponent={
          !isLoading ? (
            <View style={s.empty}>
              <Icon name="bell-off-outline" size={56} color={COLORS.textLight} />
              <Text style={s.emptyTitle}>No notifications</Text>
              <Text style={s.emptySub}>You're all caught up!</Text>
            </View>
          ) : null
        }
        contentContainerStyle={notifications.length === 0 && !isLoading ? s.emptyContainer : null}
      />
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 52, paddingBottom: 14, backgroundColor: COLORS.white, elevation: 2 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, fontFamily: F.urbanist },
  markAll: { fontSize: 13, color: COLORS.primary, fontWeight: '600', fontFamily: F.urbanist },
  unreadBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.primaryLight, paddingHorizontal: 16, paddingVertical: 10 },
  unreadBannerText: { fontSize: 13, color: COLORS.primary, fontWeight: '500', fontFamily: F.urbanist },
  item: { flexDirection: 'row', alignItems: 'flex-start', padding: 16, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  itemUnread: { backgroundColor: '#F5F3FF' },
  iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12, flexShrink: 0 },
  itemContent: { flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, fontFamily: F.urbanist, marginBottom: 3 },
  itemMsg: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18, fontFamily: F.urbanist },
  itemTime: { fontSize: 11, color: COLORS.textLight, marginTop: 5, fontFamily: F.urbanist },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary, marginTop: 4, flexShrink: 0 },
  empty: { alignItems: 'center', paddingTop: 80, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: COLORS.textSecondary, fontFamily: F.urbanist },
  emptySub: { fontSize: 13, color: COLORS.textLight, fontFamily: F.urbanist },
  emptyContainer: { flex: 1 },
});

export default NotificationsScreen;
