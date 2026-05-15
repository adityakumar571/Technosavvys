import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markAllRead } from '../../store/slices/notificationSlice';
import { COLORS } from '../../constants/colors';
import api from '../../services/api';

const NOTIF_ICONS = {
  live_class: { icon: 'video', color: COLORS.live },
  new_video: { icon: 'play-circle', color: COLORS.primary },
  new_note: { icon: 'file-pdf-box', color: COLORS.warning },
  test: { icon: 'clipboard-text', color: COLORS.success },
  doubt_reply: { icon: 'chat', color: '#9C27B0' },
  payment: { icon: 'credit-card', color: COLORS.info },
  announcement: { icon: 'bullhorn', color: COLORS.secondary },
  general: { icon: 'bell', color: COLORS.textSecondary },
};

const NotificationsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { list: notifications, unreadCount } = useSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, []);

  const handleMarkRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    dispatch(fetchNotifications());
  };

  const renderNotification = ({ item }) => {
    const { icon, color } = NOTIF_ICONS[item.type] || NOTIF_ICONS.general;
    return (
      <TouchableOpacity
        onPress={() => !item.isRead && handleMarkRead(item._id)}
        style={[styles.notifCard, !item.isRead && styles.unreadCard]}
      >
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <Icon name={icon} size={22} color={color} />
        </View>
        <View style={styles.notifContent}>
          <Text style={styles.notifTitle}>{item.title}</Text>
          <Text style={styles.notifMessage} numberOfLines={2}>{item.message}</Text>
          <Text style={styles.notifTime}>{moment(item.createdAt).fromNow()}</Text>
        </View>
        {!item.isRead && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={() => dispatch(markAllRead())}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Icon name="bell-off-outline" size={60} color={COLORS.textLight} />
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: COLORS.white,
    elevation: 2,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary },
  markAllText: { color: COLORS.primary, fontSize: 14, fontWeight: '500' },
  list: { padding: 16 },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    elevation: 1,
    gap: 12,
  },
  unreadCard: { backgroundColor: COLORS.primaryLight },
  iconContainer: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 14, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 3 },
  notifMessage: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18, marginBottom: 4 },
  notifTime: { fontSize: 11, color: COLORS.textLight },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary, marginTop: 4 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: 16, color: COLORS.textSecondary, marginTop: 16 },
});

export default NotificationsScreen;
