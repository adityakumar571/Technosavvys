import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FastImage from 'react-native-fast-image';
import api from '../../services/api';
import { COLORS } from '../../constants/colors';

const LeaderboardScreen = ({ navigation, route }) => {
  const { testId } = route.params;
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    api.get(`/tests/${testId}/leaderboard`).then((res) => setLeaderboard(res.data.data.leaderboard)).catch(console.error);
  }, []);

  const getRankColor = (rank) => {
    if (rank === 1) return '#FFD700';
    if (rank === 2) return '#C0C0C0';
    if (rank === 3) return '#CD7F32';
    return COLORS.textSecondary;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <View style={{ width: 24 }} />
      </View>
      <FlatList
        data={leaderboard}
        keyExtractor={(item, i) => String(i)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.rankCard}>
            <Text style={[styles.rank, { color: getRankColor(item.rank) }]}>#{item.rank}</Text>
            <FastImage source={{ uri: item.student?.avatar || 'https://via.placeholder.com/40' }} style={styles.avatar} />
            <View style={styles.info}>
              <Text style={styles.name}>{item.student?.name}</Text>
              <Text style={styles.meta}>{item.percentage?.toFixed(1)}% • {Math.floor(item.timeTaken / 60)}m</Text>
            </View>
            <Text style={styles.score}>{item.score}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 12, backgroundColor: COLORS.white, elevation: 2 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary },
  list: { padding: 16 },
  rankCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 12, padding: 14, marginBottom: 10, gap: 12, elevation: 1 },
  rank: { fontSize: 18, fontWeight: 'bold', width: 36 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  meta: { fontSize: 12, color: COLORS.textSecondary },
  score: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
});

export default LeaderboardScreen;
