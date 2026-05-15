import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import { COLORS, GRADIENTS } from '../../constants/colors';

const DashboardScreen = ({ navigation }) => {
  const { user } = useSelector((state) => state.auth);
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    api.get('/dashboard/student').then((res) => setDashboard(res.data.data)).catch(console.error);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <LinearGradient colors={GRADIENTS.primary} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Dashboard</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      <ScrollView style={styles.content}>
        {dashboard && (
          <>
            <View style={styles.statsGrid}>
              {[
                { label: 'Enrolled Courses', value: dashboard.stats.enrolledCourses, icon: 'book-open', color: COLORS.primary },
                { label: 'Videos Completed', value: dashboard.stats.videosCompleted, icon: 'play-circle', color: COLORS.success },
                { label: 'Tests Attempted', value: dashboard.stats.testsAttempted, icon: 'clipboard-text', color: COLORS.warning },
                { label: 'Total Points', value: dashboard.stats.totalPoints, icon: 'star', color: COLORS.accent },
              ].map((stat, i) => (
                <View key={i} style={styles.statCard}>
                  <Icon name={stat.icon} size={28} color={stat.color} />
                  <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>

            {/* Streak */}
            <View style={styles.streakCard}>
              <Text style={styles.streakEmoji}>🔥</Text>
              <View>
                <Text style={styles.streakValue}>{dashboard.stats.streak} Day Streak</Text>
                <Text style={styles.streakSubtext}>Keep learning every day!</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.white },
  content: { flex: 1, padding: 16 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
  },
  statValue: { fontSize: 24, fontWeight: 'bold', marginTop: 8 },
  statLabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4, textAlign: 'center' },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    gap: 16,
    elevation: 2,
  },
  streakEmoji: { fontSize: 40 },
  streakValue: { fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary },
  streakSubtext: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
});

export default DashboardScreen;
