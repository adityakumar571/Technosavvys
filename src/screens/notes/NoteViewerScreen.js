import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
  ActivityIndicator, Linking, Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../constants/colors';
import api from '../../services/api';

const F = { urbanist: 'Urbanist-Medium' };

// Convert PDF URL to Google Docs viewer URL for WebView
const getPdfViewerUrl = (url) => {
  if (!url) return null;
  // Cloudinary raw PDF — use Google Docs viewer
  if (url.includes('cloudinary.com') || url.endsWith('.pdf')) {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
  }
  // Google Drive
  if (url.includes('drive.google.com/file/d/')) {
    const match = url.match(/\/d\/([^/]+)/);
    if (match) return `https://drive.google.com/file/d/${match[1]}/preview`;
  }
  // Already a viewer URL
  return url;
};

const NoteViewerScreen = ({ navigation, route }) => {
  const { noteId, fileUrl, title } = route.params;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const viewerUrl = getPdfViewerUrl(fileUrl);

  const handleDownload = async () => {
    try {
      await api.get(`/notes/${noteId}/download`);
      // Open in browser for download
      if (fileUrl) {
        const supported = await Linking.canOpenURL(fileUrl);
        if (supported) {
          await Linking.openURL(fileUrl);
        } else {
          Alert.alert('Error', 'Cannot open this file');
        }
      }
    } catch (_) {
      // Still try to open
      if (fileUrl) Linking.openURL(fileUrl).catch(() => {});
    }
  };

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Icon name="arrow-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>{title || 'Note'}</Text>
        <TouchableOpacity onPress={handleDownload} style={s.downloadBtn}>
          <Icon name="download" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {!viewerUrl ? (
        <View style={s.errorBox}>
          <Icon name="file-alert-outline" size={56} color={COLORS.textLight} />
          <Text style={s.errorTitle}>File not available</Text>
          <Text style={s.errorSub}>The file URL is missing or invalid</Text>
        </View>
      ) : (
        <View style={s.webviewContainer}>
          {loading && (
            <View style={s.loadingOverlay}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={s.loadingText}>Loading PDF...</Text>
            </View>
          )}
          {error ? (
            <View style={s.errorBox}>
              <Icon name="file-pdf-box" size={56} color={COLORS.error} />
              <Text style={s.errorTitle}>Could not load PDF</Text>
              <Text style={s.errorSub}>Tap below to open in browser</Text>
              <TouchableOpacity onPress={handleDownload} style={s.openBtn}>
                <Icon name="open-in-new" size={18} color={COLORS.white} />
                <Text style={s.openBtnText}>Open in Browser</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <WebView
              source={{ uri: viewerUrl }}
              style={s.webview}
              onLoadStart={() => setLoading(true)}
              onLoadEnd={() => setLoading(false)}
              onError={() => { setLoading(false); setError(true); }}
              javaScriptEnabled
              domStorageEnabled
              startInLoadingState={false}
            />
          )}
        </View>
      )}
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 52, paddingBottom: 14, backgroundColor: COLORS.white, elevation: 2 },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'center', marginHorizontal: 8, fontFamily: F.urbanist },
  downloadBtn: { padding: 4 },
  webviewContainer: { flex: 1, position: 'relative' },
  webview: { flex: 1 },
  loadingOverlay: { position: 'absolute', inset: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background, zIndex: 10, gap: 12 },
  loadingText: { fontSize: 14, color: COLORS.textSecondary, fontFamily: F.urbanist },
  errorBox: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10, padding: 32 },
  errorTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textPrimary, fontFamily: F.urbanist },
  errorSub: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', fontFamily: F.urbanist },
  openBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, marginTop: 8 },
  openBtnText: { color: COLORS.white, fontSize: 14, fontWeight: '600', fontFamily: F.urbanist },
});

export default NoteViewerScreen;
