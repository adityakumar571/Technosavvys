import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  TextInput, KeyboardAvoidingView, Platform, StatusBar,
  Dimensions, Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import { joinLiveClass } from '../../store/slices/liveSlice';
import { addChatMessage } from '../../store/slices/liveSlice';
import { connectSocket, joinRoom, leaveRoom, sendChatMessage, getSocket } from '../../services/socket';
import { COLORS } from '../../constants/colors';
import api from '../../services/api';

const { width, height } = Dimensions.get('window');

const LiveClassScreen = ({ navigation, route }) => {
  const { liveClassId } = route.params;
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const { chatMessages } = useSelector((state) => state.live);

  const [liveClass, setLiveClass] = useState(null);
  const [message, setMessage] = useState('');
  const [viewerCount, setViewerCount] = useState(0);
  const [showChat, setShowChat] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    loadLiveClass();
    const socket = connectSocket(token);

    socket.on('receive_message', (msg) => {
      dispatch(addChatMessage(msg));
    });

    socket.on('user_joined', ({ userName }) => {
      setViewerCount((prev) => prev + 1);
    });

    socket.on('user_left', () => {
      setViewerCount((prev) => Math.max(0, prev - 1));
    });

    socket.on('class_ended', () => {
      Alert.alert('Class Ended', 'The live class has ended.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    });

    return () => {
      if (liveClass) leaveRoom(liveClass.roomId, user._id, user.name);
    };
  }, []);

  const loadLiveClass = async () => {
    try {
      const result = await dispatch(joinLiveClass(liveClassId));
      if (joinLiveClass.fulfilled.match(result)) {
        const cls = result.payload.liveClass;
        setLiveClass(cls);
        setViewerCount(cls.currentViewers || 0);
        joinRoom(cls.roomId, user._id, user.name);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to join live class');
    }
  };

  const handleSendMessage = () => {
    if (!message.trim() || !liveClass) return;
    sendChatMessage(liveClass.roomId, user._id, user.name, user.avatar, message.trim());
    setMessage('');
  };

  const renderMessage = ({ item }) => (
    <View style={[styles.messageItem, item.userId === user._id && styles.myMessage]}>
      <Text style={styles.messageSender}>{item.userName}</Text>
      <Text style={styles.messageText}>{item.message}</Text>
      <Text style={styles.messageTime}>
        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Video Player Area */}
      <View style={styles.videoContainer}>
        <View style={styles.videoPlaceholder}>
          <Icon name="video-wireless" size={60} color={COLORS.white} />
          <Text style={styles.videoTitle}>{liveClass?.title || 'Loading...'}</Text>
          <Text style={styles.videoSubject}>{liveClass?.subject}</Text>
        </View>

        {/* Overlay Controls */}
        <View style={styles.videoOverlay}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-left" size={24} color={COLORS.white} />
          </TouchableOpacity>

          <View style={styles.videoStats}>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
            <View style={styles.viewerBadge}>
              <Icon name="eye" size={14} color={COLORS.white} />
              <Text style={styles.viewerText}>{viewerCount}</Text>
            </View>
          </View>
        </View>

        {/* Bottom Controls */}
        <View style={styles.videoControls}>
          <TouchableOpacity
            onPress={() => setHandRaised(!handRaised)}
            style={[styles.controlBtn, handRaised && styles.controlBtnActive]}
          >
            <Icon name="hand-wave" size={20} color={handRaised ? COLORS.accent : COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowChat(!showChat)}
            style={styles.controlBtn}
          >
            <Icon name={showChat ? 'chat' : 'chat-outline'} size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat Section */}
      {showChat && (
        <KeyboardAvoidingView
          style={styles.chatContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.chatHeader}>
            <Text style={styles.chatTitle}>Live Chat</Text>
            <Text style={styles.chatCount}>{chatMessages.length} messages</Text>
          </View>

          <FlatList
            ref={flatListRef}
            data={chatMessages}
            renderItem={renderMessage}
            keyExtractor={(_, index) => String(index)}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
            contentContainerStyle={styles.chatList}
          />

          <View style={styles.chatInput}>
            <TextInput
              style={styles.chatTextInput}
              placeholder="Type a message..."
              placeholderTextColor={COLORS.textLight}
              value={message}
              onChangeText={setMessage}
              onSubmitEditing={handleSendMessage}
            />
            <TouchableOpacity onPress={handleSendMessage} style={styles.sendBtn}>
              <Icon name="send" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  videoContainer: { height: height * 0.4, backgroundColor: '#1a1a1a', position: 'relative' },
  videoPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  videoTitle: { color: COLORS.white, fontSize: 18, fontWeight: 'bold', marginTop: 12, textAlign: 'center', paddingHorizontal: 20 },
  videoSubject: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 4 },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
  },
  backBtn: { padding: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20 },
  videoStats: { flexDirection: 'row', gap: 8 },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.live,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.white },
  liveText: { color: COLORS.white, fontSize: 12, fontWeight: 'bold' },
  viewerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  viewerText: { color: COLORS.white, fontSize: 12 },
  videoControls: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    gap: 8,
  },
  controlBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlBtnActive: { backgroundColor: 'rgba(255,215,0,0.3)' },
  chatContainer: { flex: 1, backgroundColor: COLORS.white },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  chatTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary },
  chatCount: { fontSize: 12, color: COLORS.textSecondary },
  chatList: { padding: 12 },
  messageItem: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    maxWidth: '80%',
  },
  myMessage: { alignSelf: 'flex-end', backgroundColor: COLORS.primaryLight },
  messageSender: { fontSize: 12, fontWeight: 'bold', color: COLORS.primary, marginBottom: 2 },
  messageText: { fontSize: 14, color: COLORS.textPrimary },
  messageTime: { fontSize: 10, color: COLORS.textLight, marginTop: 2, alignSelf: 'flex-end' },
  chatInput: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 8,
  },
  chatTextInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.background,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LiveClassScreen;
