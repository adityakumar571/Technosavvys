import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FastImage from '@d11/react-native-fast-image';
import moment from 'moment';
import api from '../../services/api';
import { COLORS } from '../../constants/colors';
import { useSelector } from 'react-redux';

const DoubtDetailScreen = ({ navigation, route }) => {
  const { doubtId } = route.params;
  const { user } = useSelector((state) => state.auth);
  const [doubt, setDoubt] = useState(null);
  const [reply, setReply] = useState('');

  useEffect(() => {
    api.get(`/doubts/${doubtId}`).then((res) => setDoubt(res.data.data.doubt)).catch(console.error);
  }, []);

  const handleReply = async () => {
    if (!reply.trim()) return;
    try {
      const res = await api.post(`/doubts/${doubtId}/reply`, { message: reply });
      setDoubt(res.data.data.doubt);
      setReply('');
    } catch (e) {}
  };

  if (!doubt) return <View style={styles.loading}><Text>Loading...</Text></View>;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Doubt</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.doubtCard}>
          <View style={styles.studentRow}>
            <FastImage source={{ uri: doubt.student?.avatar || 'https://via.placeholder.com/36' }} style={styles.avatar} />
            <View>
              <Text style={styles.studentName}>{doubt.student?.name}</Text>
              <Text style={styles.time}>{moment(doubt.createdAt).fromNow()}</Text>
            </View>
          </View>
          <Text style={styles.doubtTitle}>{doubt.title}</Text>
          <Text style={styles.doubtDesc}>{doubt.description}</Text>
        </View>

        <Text style={styles.repliesTitle}>{doubt.replies?.length || 0} Replies</Text>
        {doubt.replies?.map((r, i) => (
          <View key={i} style={[styles.replyCard, r.isInstructor && styles.instructorReply]}>
            <View style={styles.studentRow}>
              <FastImage source={{ uri: r.user?.avatar || 'https://via.placeholder.com/30' }} style={styles.replyAvatar} />
              <View>
                <Text style={styles.replyName}>{r.user?.name} {r.isInstructor && '👨‍🏫'}</Text>
                <Text style={styles.time}>{moment(r.createdAt).fromNow()}</Text>
              </View>
            </View>
            <Text style={styles.replyText}>{r.message}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.replyInput}>
        <TextInput
          style={styles.input}
          placeholder="Write a reply..."
          placeholderTextColor={COLORS.textLight}
          value={reply}
          onChangeText={setReply}
          multiline
        />
        <TouchableOpacity onPress={handleReply} style={styles.sendBtn}>
          <Icon name="send" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 12, backgroundColor: COLORS.white, elevation: 2 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary },
  content: { flex: 1, padding: 16 },
  doubtCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 16, marginBottom: 16, elevation: 2 },
  studentRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  studentName: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  time: { fontSize: 12, color: COLORS.textSecondary },
  doubtTitle: { fontSize: 17, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 8 },
  doubtDesc: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },
  repliesTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 12 },
  replyCard: { backgroundColor: COLORS.white, borderRadius: 12, padding: 14, marginBottom: 10, elevation: 1 },
  instructorReply: { borderLeftWidth: 3, borderLeftColor: COLORS.primary },
  replyAvatar: { width: 30, height: 30, borderRadius: 15 },
  replyName: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
  replyText: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20, marginTop: 6 },
  replyInput: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border, gap: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, fontSize: 14, color: COLORS.textPrimary, maxHeight: 100 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
});

export default DoubtDetailScreen;
