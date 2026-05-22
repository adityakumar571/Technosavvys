import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
// import Pdf from 'react-native-pdf'; // TODO: re-enable after New Architecture fix
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../constants/colors';
import api from '../../services/api';

const NoteViewerScreen = ({ navigation, route }) => {
  const { noteId, fileUrl, title } = route.params;

  const handleDownload = async () => {
    try {
      await api.get(`/notes/${noteId}/download`);
    } catch (e) {}
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
        <TouchableOpacity onPress={handleDownload}>
          <Icon name="download" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* PDF Viewer — react-native-pdf disabled temporarily */}
      {/* <Pdf
        source={{ uri: fileUrl, cache: true }}
        style={styles.pdf}
        onError={(err) => console.log(err)}
      /> */}
      <View style={styles.pdfPlaceholder}>
        <Icon name="file-pdf-box" size={64} color={COLORS.primary} />
        <Text style={styles.placeholderTitle}>PDF Viewer</Text>
        <Text style={styles.placeholderText}>PDF viewer coming soon</Text>
        <TouchableOpacity style={styles.downloadBtn} onPress={handleDownload}>
          <Icon name="download" size={20} color={COLORS.white} />
          <Text style={styles.downloadBtnText}>Download PDF</Text>
        </TouchableOpacity>
      </View>
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
  headerTitle: { flex: 1, fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary, textAlign: 'center', marginHorizontal: 12 },
  pdf: { flex: 1, width: '100%' },
  pdfPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  placeholderTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary },
  placeholderText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center' },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  downloadBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '600' },
});

export default NoteViewerScreen;
