import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBatchById, fetchBatchContent } from '../../store/slices/batchSlice';
import { COLORS } from '../../constants/colors';

const TABS = ['Videos', 'Live', 'Notes', 'Tests', 'Doubts'];

const BatchDetailScreen = ({ navigation, route }) => {
  const { batchId } = route.params;
  const dispatch = useDispatch();
  const { selectedBatch: batch, batchContent } = useSelector((state) => state.batches);
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('Videos');

  useEffect(() => {
    dispatch(fetchBatchById(batchId));
    dispatch(fetchBatchContent(batchId));
  }, [batchId]);

  const isEnrolled = user?.enrolledBatches?.some((b) => b._id === batchId || b === batchId);

  const renderContent = () => {
    if (!batchContent) return <Text style={styles.loadingText}>Loading...</Text>;
    switch (activeTab) {
      case 'Videos':
        return batchContent.videos?.map((v) => (
          <TouchableOpacity key={v._id} onPress={() => navigation.navigate('VideoPlayer', { videoId: v._id, videoUrl: v.videoUrl, title: v.title })} style={styles.contentItem}>
            <Icon name="play-circle" size={24} color={COLORS.primary} />
            <View style={styles.contentInfo}>
              <Text style={styles.contentTitle}>{v.title}</Text>
              <Text style={styles.contentMeta}>{v.subject} • {Math.floor(v.duration / 60)} min</Text>
            </View>
          </TouchableOpacity>
        ));
      case 'Notes':
        return batchContent.notes?.map((n) => (
          <TouchableOpacity key={n._id} onPress={() => navigation.navigate('NoteViewer', { noteId: n._id })} style={styles.contentItem}>
            <Icon name="file-pdf-box" size={24} color={COLORS.error} />
            <View style={styles.contentInfo}>
              <Text style={styles.contentTitle}>{n.title}</Text>
              <Text style={styles.contentMeta}>{n.subject} • {n.downloads} downloads</Text>
            </View>
          </TouchableOpacity>
        ));
      case 'Tests':
        return batchContent.tests?.map((t) => (
          <TouchableOpacity key={t._id} onPress={() => navigation.navigate('Test', { testId: t._id })} style={styles.contentItem}>
            <Icon name="clipboard-text" size={24} color={COLORS.warning} />
            <View style={styles.contentInfo}>
              <Text style={styles.contentTitle}>{t.title}</Text>
              <Text style={styles.contentMeta}>{t.totalQuestions} questions • {t.duration} min</Text>
            </View>
          </TouchableOpacity>
        ));
      case 'Doubts':
        return (
          <TouchableOpacity onPress={() => navigation.navigate('Doubts', { batchId })} style={styles.doubtBtn}>
            <Icon name="chat-question" size={24} color={COLORS.primary} />
            <Text style={styles.doubtBtnText}>View & Ask Doubts</Text>
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{batch?.name || 'Batch'}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.content}>
        {!isEnrolled ? (
          <View style={styles.lockedContainer}>
            <Icon name="lock" size={60} color={COLORS.textLight} />
            <Text style={styles.lockedText}>Enroll to access content</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Payment', { batch })}
              style={styles.enrollBtn}
            >
              <Text style={styles.enrollBtnText}>Enroll Now - ₹{batch?.discountPrice || batch?.price || 0}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          renderContent()
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
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: COLORS.white,
    elevation: 2,
  },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary, textAlign: 'center', marginHorizontal: 12 },
  tabsContainer: { backgroundColor: COLORS.white, paddingHorizontal: 16, paddingVertical: 8 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, marginRight: 8, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border },
  tabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tabText: { fontSize: 14, color: COLORS.textSecondary },
  tabTextActive: { color: COLORS.white, fontWeight: '600' },
  content: { flex: 1, padding: 16 },
  contentItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 12, padding: 14, marginBottom: 10, gap: 12, elevation: 1 },
  contentInfo: { flex: 1 },
  contentTitle: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  contentMeta: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  loadingText: { textAlign: 'center', color: COLORS.textSecondary, padding: 20 },
  lockedContainer: { alignItems: 'center', paddingTop: 60 },
  lockedText: { fontSize: 16, color: COLORS.textSecondary, marginTop: 16, marginBottom: 20 },
  enrollBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12 },
  enrollBtnText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  doubtBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 12, padding: 16, gap: 12, elevation: 1 },
  doubtBtnText: { fontSize: 16, color: COLORS.primary, fontWeight: '600' },
});

export default BatchDetailScreen;
