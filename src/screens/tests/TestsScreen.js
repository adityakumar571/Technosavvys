import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTests } from '../../store/slices/testSlice';
import { COLORS } from '../../constants/colors';
import { TestCardSkeleton } from '../../components/Skeleton';

const F = { urbanist: 'Urbanist-Medium' };

const TYPE_FILTERS = [
  { id: null, label: 'All' },
  { id: 'practice', label: 'Practice' },
  { id: 'mock', label: 'Mock Test' },
  { id: 'sectional', label: 'Sectional' },
  { id: 'previous-year', label: 'Prev Year' },
  { id: 'live', label: 'Live Test' },
];

const TYPE_COLORS = {
  practice: '#6C63FF',
  mock: '#FF6B6B',
  sectional: '#4CAF50',
  'previous-year': '#FF9800',
  live: '#F44336',
};

const TestsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { list: tests, isLoading } = useSelector((s) => s.tests);
  const [selectedType, setSelectedType] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() => {
    dispatch(fetchTests(selectedType ? { type: selectedType } : {}));
  }, [dispatch, selectedType]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchTests(selectedType ? { type: selectedType } : {}));
    setRefreshing(false);
  };

  const renderTest = ({ item }) => {
    const typeColor = TYPE_COLORS[item.type] || COLORS.primary;
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('Test', { testId: item._id })}
        style={s.card}
        activeOpacity={0.85}
      >
        <View style={s.cardTop}>
          <View style={[s.typeChip, { backgroundColor: typeColor + '18' }]}>
            <Text style={[s.typeText, { color: typeColor }]}>{item.type?.replace('-', ' ')}</Text>
          </View>
          {item.isFree && (
            <View style={s.freeBadge}>
              <Text style={s.freeText}>FREE</Text>
            </View>
          )}
        </View>

        <Text style={s.title} numberOfLines={2}>{item.title}</Text>
        {item.subject ? <Text style={s.subject}>{item.subject}</Text> : null}

        <View style={s.statsRow}>
          <View style={s.stat}>
            <Icon name="help-circle-outline" size={15} color={COLORS.textSecondary} />
            <Text style={s.statText}>{item.totalQuestions} Qs</Text>
          </View>
          <View style={s.stat}>
            <Icon name="clock-outline" size={15} color={COLORS.textSecondary} />
            <Text style={s.statText}>{item.duration} min</Text>
          </View>
          <View style={s.stat}>
            <Icon name="star-outline" size={15} color={COLORS.textSecondary} />
            <Text style={s.statText}>{item.totalMarks} marks</Text>
          </View>
        </View>

        <View style={s.footer}>
          <Text style={s.attempts}>{item.attempts || 0} attempts</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Test', { testId: item._id })}
            style={[s.startBtn, { backgroundColor: typeColor }]}
          >
            <Text style={s.startBtnText}>Start</Text>
            <Icon name="arrow-right" size={15} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <View style={s.header}>
        <Text style={s.headerTitle}>Tests & Quizzes</Text>
      </View>

      {/* Type Filter */}
      <View style={s.filterWrap}>
        <FlatList
          data={TYPE_FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10 }}
          renderItem={({ item }) => {
            const active = selectedType === item.id;
            const color = item.id ? TYPE_COLORS[item.id] : COLORS.primary;
            return (
              <TouchableOpacity
                onPress={() => setSelectedType(item.id)}
                style={[s.filter, active && { backgroundColor: color, borderColor: color }]}
              >
                <Text style={[s.filterText, active && { color: COLORS.white }]}>{item.label}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <FlatList
        data={isLoading ? [] : tests}
        renderItem={renderTest}
        keyExtractor={(item) => item._id}
        contentContainerStyle={s.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        ListHeaderComponent={isLoading ? (
          <View>{[1, 2, 3, 4].map((i) => <TestCardSkeleton key={i} />)}</View>
        ) : null}
        ListEmptyComponent={
          !isLoading ? (
            <View style={s.empty}>
              <Icon name="clipboard-text-outline" size={56} color={COLORS.textLight} />
              <Text style={s.emptyTitle}>No tests available</Text>
              <Text style={s.emptySub}>Check back later for new tests</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: 20, paddingTop: 52, paddingBottom: 12, backgroundColor: COLORS.white, elevation: 2 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, fontFamily: F.urbanist },
  filterWrap: { backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  filter: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: COLORS.background, marginRight: 8, borderWidth: 1.5, borderColor: COLORS.border },
  filterText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500', fontFamily: F.urbanist },
  list: { padding: 16 },
  card: { backgroundColor: COLORS.white, borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
  cardTop: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  typeChip: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  typeText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize', fontFamily: F.urbanist },
  freeBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  freeText: { fontSize: 12, color: COLORS.success, fontWeight: '600', fontFamily: F.urbanist },
  title: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4, fontFamily: F.urbanist },
  subject: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 10, fontFamily: F.urbanist },
  statsRow: { flexDirection: 'row', gap: 16, marginBottom: 14 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: 12, color: COLORS.textSecondary, fontFamily: F.urbanist },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  attempts: { fontSize: 12, color: COLORS.textLight, fontFamily: F.urbanist },
  startBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, gap: 4 },
  startBtnText: { color: COLORS.white, fontSize: 13, fontWeight: '600', fontFamily: F.urbanist },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: COLORS.textSecondary, fontFamily: F.urbanist },
  emptySub: { fontSize: 13, color: COLORS.textLight, fontFamily: F.urbanist },
});

export default TestsScreen;
