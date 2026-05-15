import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch } from 'react-redux';
import { resetTest } from '../../store/slices/testSlice';
import { COLORS, GRADIENTS } from '../../constants/colors';

const TestResultScreen = ({ navigation, route }) => {
  const { result, testId } = route.params;
  const dispatch = useDispatch();

  const { score, totalMarks, percentage, correct, incorrect, skipped, timeTaken, attemptId } = result;

  const getGrade = () => {
    if (percentage >= 90) return { grade: 'A+', color: COLORS.success, message: 'Outstanding! 🏆' };
    if (percentage >= 75) return { grade: 'A', color: COLORS.success, message: 'Excellent! 🎉' };
    if (percentage >= 60) return { grade: 'B', color: COLORS.info, message: 'Good Job! 👍' };
    if (percentage >= 45) return { grade: 'C', color: COLORS.warning, message: 'Keep Practicing! 💪' };
    return { grade: 'D', color: COLORS.error, message: 'Need More Practice! 📚' };
  };

  const { grade, color, message } = getGrade();
  const formatTime = (s) => `${Math.floor(s / 60)}m ${s % 60}s`;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Result Header */}
        <LinearGradient colors={GRADIENTS.primary} style={styles.header}>
          <Text style={styles.headerTitle}>Test Completed!</Text>
          <Text style={styles.headerMessage}>{message}</Text>

          {/* Score Circle */}
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreGrade}>{grade}</Text>
            <Text style={styles.scorePercent}>{percentage.toFixed(1)}%</Text>
            <Text style={styles.scoreMarks}>{score}/{totalMarks}</Text>
          </View>
        </LinearGradient>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {[
            { label: 'Correct', value: correct, icon: 'check-circle', color: COLORS.success },
            { label: 'Incorrect', value: incorrect, icon: 'close-circle', color: COLORS.error },
            { label: 'Skipped', value: skipped, icon: 'minus-circle', color: COLORS.warning },
            { label: 'Time Taken', value: formatTime(timeTaken), icon: 'clock', color: COLORS.info },
          ].map((stat, i) => (
            <View key={i} style={styles.statCard}>
              <Icon name={stat.icon} size={28} color={stat.color} />
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Performance Bar */}
        <View style={styles.performanceCard}>
          <Text style={styles.performanceTitle}>Performance Analysis</Text>
          <View style={styles.performanceBar}>
            <View style={[styles.performanceFill, { width: `${(correct / (correct + incorrect + skipped)) * 100}%`, backgroundColor: COLORS.success }]} />
            <View style={[styles.performanceFill, { width: `${(incorrect / (correct + incorrect + skipped)) * 100}%`, backgroundColor: COLORS.error }]} />
            <View style={[styles.performanceFill, { width: `${(skipped / (correct + incorrect + skipped)) * 100}%`, backgroundColor: COLORS.warning }]} />
          </View>
          <View style={styles.performanceLegend}>
            {[
              { label: 'Correct', color: COLORS.success },
              { label: 'Incorrect', color: COLORS.error },
              { label: 'Skipped', color: COLORS.warning },
            ].map((item, i) => (
              <View key={i} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                <Text style={styles.legendText}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Leaderboard', { testId })}
            style={styles.leaderboardBtn}
          >
            <Icon name="trophy" size={20} color={COLORS.primary} />
            <Text style={styles.leaderboardBtnText}>View Leaderboard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              dispatch(resetTest());
              navigation.navigate('TestsMain');
            }}
            style={styles.homeBtn}
          >
            <LinearGradient colors={GRADIENTS.primary} style={styles.homeBtnGradient}>
              <Text style={styles.homeBtnText}>Back to Tests</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              dispatch(resetTest());
              navigation.replace('Test', { testId });
            }}
            style={styles.retryBtn}
          >
            <Text style={styles.retryBtnText}>Retry Test</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 60, paddingBottom: 40, alignItems: 'center', paddingHorizontal: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.white, marginBottom: 4 },
  headerMessage: { fontSize: 16, color: 'rgba(255,255,255,0.85)', marginBottom: 24 },
  scoreCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  scoreGrade: { fontSize: 32, fontWeight: 'bold', color: COLORS.white },
  scorePercent: { fontSize: 18, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },
  scoreMarks: { fontSize: 14, color: 'rgba(255,255,255,0.7)' },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
  },
  statValue: { fontSize: 22, fontWeight: 'bold', marginTop: 8 },
  statLabel: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  performanceCard: {
    backgroundColor: COLORS.white,
    margin: 16,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
  },
  performanceTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 16 },
  performanceBar: { flexDirection: 'row', height: 12, borderRadius: 6, overflow: 'hidden', backgroundColor: COLORS.border },
  performanceFill: { height: '100%' },
  performanceLegend: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 13, color: COLORS.textSecondary },
  actions: { padding: 16, gap: 12 },
  leaderboardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  leaderboardBtnText: { color: COLORS.primary, fontSize: 16, fontWeight: 'bold' },
  homeBtn: { borderRadius: 12, overflow: 'hidden' },
  homeBtnGradient: { paddingVertical: 16, alignItems: 'center' },
  homeBtnText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  retryBtn: { alignItems: 'center', paddingVertical: 12 },
  retryBtnText: { color: COLORS.textSecondary, fontSize: 15 },
});

export default TestResultScreen;
