import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FastImage from 'react-native-fast-image';
import moment from 'moment';
import api from '../../services/api';
import { COLORS } from '../../constants/colors';

const WatchHistoryScreen = ({ navigation }) => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    api.get('/users/watch-history').then((res) => setHistory(res.data.data.watchHistory)).catch(console.error);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Watch History</Text>
        <View style={{ width: 24 }} />
      </View>
      <FlatList
        data={history}
        keyExtractor={(item, i) => String(i)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('VideoPlayer', { videoId: item.video?._id, videoUrl: item.video?.videoUrl, title: item.video?.title })}
            style={styles.historyCard}
          >
            <FastImage source={{ uri: item.video?.thumbnail || 'https://via.placeholder.com/80x60' }} style={styles.thumbnail} />
            <View style={styles.info}>
              <Text style={styles.title} numberOfLines={2}>{item.video?.title}</Text>
              <Text style={styles.meta}>{item.video?.subject}</Text>
              <View style={styles.progressRow}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
                </View>
                <Text style={styles.progressText}>{item.progress}%</Text>
              </View>
              <Text style={styles.time}>{moment(item.watchedAt).fromNow()}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Icon name="history" size={60} color={COLORS.textLight} />
            <Text style={styles.emptyText}>No watch history</Text>
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
  historyCard: { flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: 12, marginBottom: 10, overflow: 'hidden', elevation: 1 },
  thumbnail: { width: 100, height: 80 },
  info: { flex: 1, padding: 10 },
  title: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 2 },
  meta: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 6 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  progressBar: { flex: 1, height: 4, backgroundColor: COLORS.border, borderRadius: 2 },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 2 },
  progressText: { fontSize: 11, color: COLORS.primary, fontWeight: '600' },
  time: { fontSize: 11, color: COLORS.textLight },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 16, color: COLORS.textSecondary, marginTop: 12 },
});

export default WatchHistoryScreen;
