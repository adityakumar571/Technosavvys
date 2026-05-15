import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Dimensions } from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Orientation from 'react-native-orientation-locker';
import { useDispatch, useSelector } from 'react-redux';
import api from '../../services/api';
import { COLORS } from '../../constants/colors';

const { width } = Dimensions.get('window');

const VideoPlayerScreen = ({ navigation, route }) => {
  const { videoId, videoUrl, title } = route.params;
  const { user } = useSelector((state) => state.auth);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef(null);

  const handleProgress = async (data) => {
    const pct = (data.currentTime / data.seekableDuration) * 100;
    setProgress(pct);
    if (pct % 10 < 1) { // Update every ~10%
      try {
        await api.post(`/videos/${videoId}/progress`, { progress: Math.floor(pct) });
      } catch (e) {}
    }
  };

  const toggleFullscreen = () => {
    if (isFullscreen) {
      Orientation.lockToPortrait();
    } else {
      Orientation.lockToLandscape();
    }
    setIsFullscreen(!isFullscreen);
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Video */}
      <View style={[styles.videoContainer, isFullscreen && styles.fullscreen]}>
        <Video
          ref={videoRef}
          source={{ uri: videoUrl }}
          style={styles.video}
          paused={paused}
          onProgress={handleProgress}
          onLoad={(data) => setDuration(data.duration)}
          resizeMode="contain"
          controls={false}
        />

        {/* Controls Overlay */}
        <View style={styles.overlay}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-left" size={24} color={COLORS.white} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setPaused(!paused)} style={styles.playBtn}>
            <Icon name={paused ? 'play' : 'pause'} size={40} color={COLORS.white} />
          </TouchableOpacity>

          <View style={styles.bottomControls}>
            <Text style={styles.timeText}>{formatTime((progress / 100) * duration)} / {formatTime(duration)}</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <TouchableOpacity onPress={toggleFullscreen}>
              <Icon name={isFullscreen ? 'fullscreen-exit' : 'fullscreen'} size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Info */}
      {!isFullscreen && (
        <View style={styles.info}>
          <Text style={styles.videoTitle}>{title}</Text>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => api.post(`/videos/${videoId}/like`)}>
              <Icon name="thumb-up-outline" size={22} color={COLORS.textSecondary} />
              <Text style={styles.actionText}>Like</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => api.post(`/users/bookmarks/${videoId}`)}>
              <Icon name="bookmark-outline" size={22} color={COLORS.textSecondary} />
              <Text style={styles.actionText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  videoContainer: { width: '100%', height: width * 9 / 16, backgroundColor: '#000', position: 'relative' },
  fullscreen: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999, height: '100%' },
  video: { width: '100%', height: '100%' },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'space-between', padding: 16 },
  backBtn: { alignSelf: 'flex-start', padding: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, marginTop: 30 },
  playBtn: { alignSelf: 'center', padding: 12, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 40 },
  bottomControls: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  timeText: { color: COLORS.white, fontSize: 12 },
  progressBar: { flex: 1, height: 4, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2 },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 2 },
  info: { backgroundColor: COLORS.white, flex: 1, padding: 16 },
  videoTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 16 },
  actions: { flexDirection: 'row', gap: 24 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionText: { fontSize: 14, color: COLORS.textSecondary },
});

export default VideoPlayerScreen;
