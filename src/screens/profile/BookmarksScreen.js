import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FastImage from '@d11/react-native-fast-image';
import api from '../../services/api';
import { COLORS } from '../../constants/colors';

const BookmarksScreen = ({ navigation }) => {
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    api.get('/users/bookmarks').then((res) => setBookmarks(res.data.data.bookmarks)).catch(console.error);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bookmarks</Text>
        <View style={{ width: 24 }} />
      </View>
      <FlatList
        data={bookmarks}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('VideoPlayer', { videoId: item._id, videoUrl: item.videoUrl, title: item.title })}
            style={styles.bookmarkCard}
          >
            <FastImage source={{ uri: item.thumbnail || 'https://via.placeholder.com/80x60' }} style={styles.thumbnail} />
            <View style={styles.info}>
              <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
              <Text style={styles.meta}>{item.subject} • {Math.floor(item.duration / 60)} min</Text>
            </View>
            <Icon name="bookmark" size={22} color={COLORS.primary} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Icon name="bookmark-outline" size={60} color={COLORS.textLight} />
            <Text style={styles.emptyText}>No bookmarks yet</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 12, backgroundColor: COLORS.white, elevation: 2 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary },
  list: { padding: 16 },
  bookmarkCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 12, marginBottom: 10, overflow: 'hidden', elevation: 1, gap: 12, padding: 4 },
  thumbnail: { width: 80, height: 60 },
  info: { flex: 1 },
  title: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  meta: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 16, color: COLORS.textSecondary, marginTop: 12 },
});

export default BookmarksScreen;
