import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTests } from '../../store/slices/testSlice';
import { COLORS } from '../../constants/colors';
import { TEST_TYPES } from '../../constants';
import moment from 'moment';

const TestsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { list: tests, isLoading } = useSelector((state) => state.tests);
  const [selectedType, setSelectedType] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchTests({ type: selectedType }));
  }, [selectedType]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchTests({ type: selectedType }));
    setRefreshing(false);
  };

  const renderTest = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('Test', { testId: item._id })}
      style={styles.testCard}
    >
      <View style={styles.testHeader}>
        <View style={styles.testTypeChip}>
          <Text style={styles.testTypeText}>{item.type}</Text>
        </View>
        {item.isFree && (
          <View style={styles.freeBadge}>
            <Text style={styles.freeBadgeText}>FREE</Text>
          </View>
        )}
      </View>
      <Text style={styles.testTitle}>{item.title}</Text>
      <Text style={styles.testSubject}>{item.subject}</Text>

      <View style={styles.testStats}>
        <View style={styles.testStat}>
          <Icon name="help-circle-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.testStatText}>{item.totalQuestions} Questions</Text>
        </View>
        <View style={styles.testStat}>
          <Icon name="clock-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.testStatText}>{item.duration} min</Text>
        </View>
        <View style={styles.testStat}>
          <Icon name="star-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.testStatText}>{item.totalMarks} marks</Text>
        </View>
      </View>

      <View style={styles.testFooter}>
        <Text style={styles.attemptsText}>{item.attempts} attempts</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Test', { testId: item._id })}
          style={styles.startBtn}
        >
          <Text style={styles.startBtnText}>Start Test</Text>
          <Icon name="arrow-right" size={16} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tests & Quizzes</Text>
      </View>

      <FlatList
        data={tests}
        renderItem={renderTest}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <FlatList
            data={[{ id: null, label: 'All' }, ...TEST_TYPES]}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setSelectedType(item.id)}
                style={[styles.typeChip, selectedType === item.id && styles.typeChipActive]}
              >
                <Text style={[styles.typeChipText, selectedType === item.id && styles.typeChipTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => String(item.id)}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.typeList}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Icon name="clipboard-text-outline" size={60} color={COLORS.textLight} />
            <Text style={styles.emptyText}>No tests available</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: COLORS.white,
    elevation: 2,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary },
  typeList: { paddingHorizontal: 16, paddingVertical: 12 },
  typeChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  typeChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  typeChipText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  typeChipTextActive: { color: COLORS.white, fontWeight: '600' },
  list: { padding: 16 },
  testCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  testHeader: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  testTypeChip: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  testTypeText: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
  freeBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  freeBadgeText: { fontSize: 12, color: COLORS.success, fontWeight: '600' },
  testTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 4 },
  testSubject: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 12 },
  testStats: { flexDirection: 'row', gap: 16, marginBottom: 14 },
  testStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  testStatText: { fontSize: 13, color: COLORS.textSecondary },
  testFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  attemptsText: { fontSize: 13, color: COLORS.textLight },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  startBtnText: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 16, color: COLORS.textSecondary, marginTop: 12 },
});

export default TestsScreen;
