import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, FlatList, RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FastImage from '@d11/react-native-fast-image';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBatchById, fetchBatchContent } from '../../store/slices/batchSlice';
import { COLORS, GRADIENTS } from '../../constants/colors';
import Skeleton from '../../components/Skeleton';
import api from '../../services/api';

const F = { urbanist: 'Urbanist-Medium' };
const TABS = ['Videos', 'Live', 'Notes', 'Tests', 'Doubts'];

const BatchDetailScreen = ({ navigation, route }) => {
  const { batchId } = route.params;
  const dispatch = useDispatch();
  const { selectedBatch: batch, batchContent, isLoading } = useSelector((s) => s.batches);
  const { user } = useSelector((s) => s.auth);
  const [activeTab, setActiveTab] = useState('Videos');
  const [refreshing, setRefreshing] = useState(false);
  const [freeVideos, setFreeVideos] = useState([]);

  const isEnrolled = user?.enrolledBatches?.some(
    (b) => (b._id || b) === batchId || String(b._id || b) === String(batchId)
  );

  const load = useCallback(async () => {
    dispatch(fetchBatchById(batchId));
    // Always load batch content — backend will handle auth
    // Also load free videos for non-enrolled users
    dispatch(fetchBatchContent(batchId));
    try {
      const res = await api.get('/videos/free', { params: { batchId } });
      setFreeVideos(res.data.data.videos || []);
    } catch (_) {}
  }, [batchId, dispatch]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const renderVideoItem = (v, locked = false) => (
    <TouchableOpacity
      key={v._id}
      onPress={() => {
        if (locked) {
          navigation.navigate('Payment', { batch });
        } else {
          navigation.navigate('VideoPlayer', { videoId: v._id, videoUrl: v.videoUrl, title: v.title });
        }
      }}
      style={s.contentItem}
      activeOpacity={0.8}
    >
      <View style={[s.videoThumb, { backgroundColor: COLORS.primaryLight }]}>
        {v.thumbnail ? (
          <FastImage source={{ uri: v.thumbnail }} style={s.videoThumbImg} resizeMode="cover" />
        ) : (
          <Icon name={locked ? 'lock' : 'play-circle'} size={24} color={locked ? COLORS.textLight : COLORS.primary} />
        )}
        {locked && <View style={s.lockOverlay}><Icon name="lock" size={16} color={COLORS.white} /></View>}
      </View>
      <View style={s.contentInfo}>
        <Text style={s.contentTitle} numberOfLines={2}>{v.title}</Text>
        <Text style={s.contentMeta}>
          {v.subject ? `${v.subject} · ` : ''}
          {v.duration ? `${Math.floor(v.duration / 60)}m` : ''}
          {v.isFree ? ' · Free' : ''}
        </Text>
      </View>
      {locked ? (
        <Icon name="lock-outline" size={18} color={COLORS.textLight} />
      ) : (
        <Icon name="play-circle-outline" size={22} color={COLORS.primary} />
      )}
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (!isEnrolled) {
      // Show free videos + locked preview
      return (
        <View>
          {freeVideos.length > 0 && (
            <View style={s.freeSection}>
              <View style={s.freeSectionHeader}>
                <Icon name="play-circle" size={18} color={COLORS.success} />
                <Text style={s.freeSectionTitle}>Free Preview Videos</Text>
              </View>
              {freeVideos.map((v) => renderVideoItem(v, false))}
            </View>
          )}
          <View style={s.lockedBox}>
            <Icon name="lock" size={48} color={COLORS.textLight} />
            <Text style={s.lockedTitle}>Enroll to Access All Content</Text>
            <Text style={s.lockedSub}>Get access to all videos, notes, tests & live classes</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Payment', { batch })}
              style={s.enrollBtn}
              activeOpacity={0.85}
            >
              <LinearGradient colors={GRADIENTS.primary} style={s.enrollBtnGrad}>
                <Icon name="lock-open" size={18} color={COLORS.white} />
                <Text style={s.enrollBtnText}>
                  {batch?.isFree || batch?.price === 0
                    ? 'Enroll Free'
                    : `Enroll Now · ₹${batch?.discountPrice || batch?.price || 0}`}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // Enrolled — show skeleton while loading
    if (!batchContent) {
      return (
        <View>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={[s.contentItem, { marginBottom: 10 }]}>
              <Skeleton width={56} height={56} borderRadius={10} />
              <View style={{ flex: 1, marginLeft: 12, gap: 6 }}>
                <Skeleton width="70%" height={14} />
                <Skeleton width="40%" height={12} />
              </View>
            </View>
          ))}
        </View>
      );
    }

    switch (activeTab) {
      case 'Videos':
        return batchContent.videos?.length === 0 ? (
          <View style={s.empty}><Icon name="video-off-outline" size={40} color={COLORS.textLight} /><Text style={s.emptyText}>No videos yet</Text></View>
        ) : (
          batchContent.videos?.map((v) => renderVideoItem(v, false))
        );

      case 'Live':
        return batchContent.liveClasses?.length === 0 ? (
          <View style={s.empty}><Icon name="video-wireless-outline" size={40} color={COLORS.textLight} /><Text style={s.emptyText}>No live classes</Text></View>
        ) : (
          batchContent.liveClasses?.map((cls) => (
            <TouchableOpacity
              key={cls._id}
              onPress={() => navigation.navigate('LiveClass', { liveClassId: cls._id })}
              style={s.contentItem}
            >
              <View style={[s.videoThumb, { backgroundColor: COLORS.live + '15' }]}>
                <Icon name="video-wireless" size={24} color={COLORS.live} />
              </View>
              <View style={s.contentInfo}>
                <Text style={s.contentTitle} numberOfLines={1}>{cls.title}</Text>
                <Text style={s.contentMeta}>
                  {new Date(cls.scheduledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </Text>
              </View>
              <View style={[s.statusChip, cls.status === 'live' && s.statusLive]}>
                <Text style={[s.statusText, cls.status === 'live' && { color: COLORS.white }]}>
                  {cls.status === 'live' ? '🔴 Live' : cls.status}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        );

      case 'Notes':
        return batchContent.notes?.length === 0 ? (
          <View style={s.empty}><Icon name="file-outline" size={40} color={COLORS.textLight} /><Text style={s.emptyText}>No notes yet</Text></View>
        ) : (
          batchContent.notes?.map((n) => (
            <TouchableOpacity
              key={n._id}
              onPress={() => navigation.navigate('NoteViewer', { noteId: n._id, fileUrl: n.fileUrl, title: n.title })}
              style={s.contentItem}
            >
              <View style={[s.videoThumb, { backgroundColor: '#FFF3E0' }]}>
                <Icon name="file-pdf-box" size={24} color="#FF5722" />
              </View>
              <View style={s.contentInfo}>
                <Text style={s.contentTitle} numberOfLines={1}>{n.title}</Text>
                <Text style={s.contentMeta}>{n.subject || ''} · {n.downloads || 0} downloads</Text>
              </View>
              <Icon name="download-outline" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          ))
        );

      case 'Tests':
        return batchContent.tests?.length === 0 ? (
          <View style={s.empty}><Icon name="clipboard-text-outline" size={40} color={COLORS.textLight} /><Text style={s.emptyText}>No tests yet</Text></View>
        ) : (
          batchContent.tests?.map((t) => (
            <TouchableOpacity
              key={t._id}
              onPress={() => navigation.navigate('Test', { testId: t._id })}
              style={s.contentItem}
            >
              <View style={[s.videoThumb, { backgroundColor: COLORS.warning + '15' }]}>
                <Icon name="clipboard-text" size={24} color={COLORS.warning} />
              </View>
              <View style={s.contentInfo}>
                <Text style={s.contentTitle} numberOfLines={1}>{t.title}</Text>
                <Text style={s.contentMeta}>{t.totalQuestions} questions · {t.duration} min</Text>
              </View>
              <Icon name="arrow-right" size={18} color={COLORS.textLight} />
            </TouchableOpacity>
          ))
        );

      case 'Doubts':
        return (
          <TouchableOpacity
            onPress={() => navigation.navigate('Doubts', { batchId })}
            style={s.doubtBtn}
          >
            <Icon name="chat-question" size={28} color={COLORS.primary} />
            <View style={{ flex: 1 }}>
              <Text style={s.doubtBtnTitle}>View & Ask Doubts</Text>
              <Text style={s.doubtBtnSub}>Get answers from instructors</Text>
            </View>
            <Icon name="arrow-right" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        );

      default:
        return null;
    }
  };

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Icon name="arrow-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>{batch?.name || 'Batch'}</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Batch Info Banner */}
      {batch && (
        <View style={s.infoBanner}>
          <View style={s.infoLeft}>
            <Text style={s.infoCategory}>{batch.category || 'General'}</Text>
            <Text style={s.infoLang}>{batch.language || 'Hindi'}</Text>
          </View>
          <View style={s.infoRight}>
            {isEnrolled ? (
              <View style={s.enrolledBadge}>
                <Icon name="check-circle" size={14} color={COLORS.success} />
                <Text style={s.enrolledText}>Enrolled</Text>
              </View>
            ) : (
              <Text style={s.priceText}>
                {batch.isFree || batch.price === 0 ? 'Free' : `₹${batch.discountPrice || batch.price}`}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Tabs — only show when enrolled */}
      {isEnrolled && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={s.tabsRow}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
        >
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[s.tab, activeTab === tab && s.tabActive]}
            >
              <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <ScrollView
        style={s.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        <View style={{ padding: 16 }}>
          {renderContent()}
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 52, paddingBottom: 14, backgroundColor: COLORS.white, elevation: 2 },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'center', marginHorizontal: 8, fontFamily: F.urbanist },

  infoBanner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.white, paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  infoLeft: { flexDirection: 'row', gap: 8 },
  infoCategory: { fontSize: 12, color: COLORS.primary, fontWeight: '600', backgroundColor: COLORS.primaryLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, fontFamily: F.urbanist },
  infoLang: { fontSize: 12, color: COLORS.textSecondary, fontFamily: F.urbanist },
  infoRight: {},
  enrolledBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.success + '15', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  enrolledText: { fontSize: 12, color: COLORS.success, fontWeight: '600', fontFamily: F.urbanist },
  priceText: { fontSize: 16, fontWeight: '700', color: COLORS.primary, fontFamily: F.urbanist },

  tabsRow: { backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tab: { paddingHorizontal: 16, paddingVertical: 8, marginRight: 6, borderRadius: 20, borderWidth: 1.5, borderColor: COLORS.border },
  tabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tabText: { fontSize: 13, color: COLORS.textSecondary, fontFamily: F.urbanist },
  tabTextActive: { color: COLORS.white, fontWeight: '600', fontFamily: F.urbanist },

  content: { flex: 1 },

  contentItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 14, padding: 12, marginBottom: 10, elevation: 1, gap: 12 },
  videoThumb: { width: 56, height: 56, borderRadius: 10, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', flexShrink: 0 },
  videoThumbImg: { width: 56, height: 56 },
  lockOverlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  contentInfo: { flex: 1 },
  contentTitle: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, fontFamily: F.urbanist },
  contentMeta: { fontSize: 12, color: COLORS.textSecondary, marginTop: 3, fontFamily: F.urbanist },

  statusChip: { backgroundColor: COLORS.primaryLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusLive: { backgroundColor: COLORS.live },
  statusText: { fontSize: 11, color: COLORS.primary, fontWeight: '600', fontFamily: F.urbanist },

  freeSection: { marginBottom: 16 },
  freeSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  freeSectionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.success, fontFamily: F.urbanist },

  lockedBox: { alignItems: 'center', paddingVertical: 32, gap: 10 },
  lockedTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textPrimary, fontFamily: F.urbanist },
  lockedSub: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', fontFamily: F.urbanist, paddingHorizontal: 20 },
  enrollBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 8, width: '100%' },
  enrollBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8 },
  enrollBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700', fontFamily: F.urbanist },

  doubtBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 14, padding: 16, gap: 14, elevation: 1 },
  doubtBtnTitle: { fontSize: 15, fontWeight: '600', color: COLORS.primary, fontFamily: F.urbanist },
  doubtBtnSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2, fontFamily: F.urbanist },

  empty: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  emptyText: { fontSize: 14, color: COLORS.textSecondary, fontFamily: F.urbanist },
});

export default BatchDetailScreen;
