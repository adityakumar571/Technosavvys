import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
  Dimensions, ActivityIndicator, Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import { COLORS } from '../../constants/colors';

const { width } = Dimensions.get('window');
const F = { urbanist: 'Urbanist-Medium' };

// Detect video type and return embeddable URL
const getEmbedUrl = (url) => {
  if (!url) return null;

  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`;

  // YouTube embed already
  if (url.includes('youtube.com/embed')) return url;

  // Cloudinary video
  if (url.includes('cloudinary.com') && (url.includes('.mp4') || url.includes('/video/'))) {
    return url; // direct mp4
  }

  // Google Drive
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (driveMatch) return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;

  // Direct mp4 / any other URL — wrap in HTML5 player
  return url;
};

const isDirectVideo = (url) => {
  if (!url) return false;
  return url.match(/\.(mp4|webm|ogg|m3u8)(\?|$)/i) !== null ||
    (url.includes('cloudinary.com') && url.includes('/video/'));
};

const VideoPlayerScreen = ({ navigation, route }) => {
  const { videoId, videoUrl, title } = route.params;
  const { user } = useSelector((s) => s.auth);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [videoData, setVideoData] = useState(null);
  const progressRef = useRef(0);
  const progressTimer = useRef(null);

  const embedUrl = getEmbedUrl(videoUrl);
  const isDirect = isDirectVideo(videoUrl);

  useEffect(() => {
    // Fetch full video details
    if (videoId) {
      api.get(`/videos/${videoId}`)
        .then((res) => setVideoData(res.data.data.video))
        .catch(() => {});
    }

    // Track watch progress every 30s
    progressTimer.current = setInterval(() => {
      progressRef.current = Math.min(progressRef.current + 5, 100);
      if (videoId) {
        api.post(`/videos/${videoId}/progress`, { progress: progressRef.current }).catch(() => {});
      }
    }, 30000);

    return () => {
      clearInterval(progressTimer.current);
    };
  }, [videoId]);

  const handleLike = async () => {
    try {
      await api.post(`/videos/${videoId}/like`);
      setLiked(!liked);
    } catch (_) {}
  };

  const handleBookmark = async () => {
    try {
      await api.post(`/users/bookmarks/${videoId}`);
      setBookmarked(!bookmarked);
    } catch (_) {}
  };

  // HTML5 video player for direct mp4 URLs
  const directVideoHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #000; display: flex; align-items: center; justify-content: center; height: 100vh; }
        video { width: 100%; max-height: 100vh; }
      </style>
    </head>
    <body>
      <video controls autoplay playsinline>
        <source src="${videoUrl}" type="video/mp4">
        Your browser does not support the video tag.
      </video>
    </body>
    </html>
  `;

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Video Area */}
      <View style={s.videoContainer}>
        {!embedUrl ? (
          <View style={s.errorBox}>
            <Icon name="video-off" size={48} color="rgba(255,255,255,0.4)" />
            <Text style={s.errorText}>Video URL not available</Text>
          </View>
        ) : (
          <>
            {loading && (
              <View style={s.loadingOverlay}>
                <ActivityIndicator size="large" color={COLORS.primary} />
              </View>
            )}
            <WebView
              source={isDirect ? { html: directVideoHtml } : { uri: embedUrl }}
              style={s.webview}
              allowsFullscreenVideo
              allowsInlineMediaPlayback
              mediaPlaybackRequiresUserAction={false}
              javaScriptEnabled
              domStorageEnabled
              onLoadStart={() => setLoading(true)}
              onLoadEnd={() => setLoading(false)}
              onError={() => { setLoading(false); setError(true); }}
              scrollEnabled={false}
            />
          </>
        )}

        {/* Back button overlay */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Icon name="arrow-left" size={22} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Info Panel */}
      <View style={s.infoPanel}>
        <Text style={s.videoTitle} numberOfLines={2}>{title || videoData?.title || 'Video'}</Text>

        {videoData && (
          <Text style={s.videoMeta}>
            {videoData.subject ? `${videoData.subject} · ` : ''}
            {videoData.views || 0} views
            {videoData.instructor?.name ? ` · ${videoData.instructor.name}` : ''}
          </Text>
        )}

        {/* Actions */}
        <View style={s.actions}>
          <TouchableOpacity onPress={handleLike} style={s.actionBtn}>
            <Icon name={liked ? 'thumb-up' : 'thumb-up-outline'} size={22} color={liked ? COLORS.primary : COLORS.textSecondary} />
            <Text style={[s.actionText, liked && { color: COLORS.primary }]}>Like</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleBookmark} style={s.actionBtn}>
            <Icon name={bookmarked ? 'bookmark' : 'bookmark-outline'} size={22} color={bookmarked ? COLORS.primary : COLORS.textSecondary} />
            <Text style={[s.actionText, bookmarked && { color: COLORS.primary }]}>Save</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Doubts', {})}
            style={s.actionBtn}
          >
            <Icon name="chat-question-outline" size={22} color={COLORS.textSecondary} />
            <Text style={s.actionText}>Doubt</Text>
          </TouchableOpacity>
        </View>

        {/* Description */}
        {videoData?.description ? (
          <View style={s.descBox}>
            <Text style={s.descText} numberOfLines={3}>{videoData.description}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  videoContainer: { width: '100%', height: width * 9 / 16, backgroundColor: '#000', position: 'relative' },
  webview: { flex: 1, backgroundColor: '#000' },
  loadingOverlay: { position: 'absolute', inset: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000', zIndex: 10 },
  errorBox: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  errorText: { color: 'rgba(255,255,255,0.5)', fontSize: 14, fontFamily: F.urbanist },
  backBtn: { position: 'absolute', top: 12, left: 12, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20, padding: 8, zIndex: 20 },

  infoPanel: { flex: 1, backgroundColor: COLORS.white, padding: 16 },
  videoTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textPrimary, fontFamily: F.urbanist, marginBottom: 6 },
  videoMeta: { fontSize: 13, color: COLORS.textSecondary, fontFamily: F.urbanist, marginBottom: 14 },

  actions: { flexDirection: 'row', gap: 24, paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: COLORS.border, marginBottom: 14 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionText: { fontSize: 13, color: COLORS.textSecondary, fontFamily: F.urbanist },

  descBox: { backgroundColor: COLORS.background, borderRadius: 10, padding: 12 },
  descText: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 20, fontFamily: F.urbanist },
});

export default VideoPlayerScreen;
