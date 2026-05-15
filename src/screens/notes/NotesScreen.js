import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import api from '../../services/api';
import { COLORS } from '../../constants/colors';

const NotesScreen = ({ navigation, route }) => {
  const { batchId, courseId } = route.params || {};
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    api.get('/notes', { params: { batchId, courseId } })
      .then((res) => setNotes(res.data.data.notes))
      .catch(console.error);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Study Notes</Text>
        <View style={{ width: 24 }} />
      </View>
      <FlatList
        data={notes}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('NoteViewer', { noteId: item._id, fileUrl: item.fileUrl, title: item.title })}
            style={styles.noteCard}
          >
            <Icon name="file-pdf-box" size={40} color={COLORS.error} />
            <View style={styles.noteInfo}>
              <Text style={styles.noteTitle}>{item.title}</Text>
              <Text style={styles.noteMeta}>{item.subject} • {item.downloads} downloads</Text>
            </View>
            <Icon name="download" size={22} color={COLORS.primary} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Icon name="file-outline" size={60} color={COLORS.textLight} />
            <Text style={styles.emptyText}>No notes available</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 12, backgroundColor: COLORS.white, elevation: 2 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary },
  list: { padding: 16 },
  noteCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 12, padding: 14, marginBottom: 10, gap: 12, elevation: 1 },
  noteInfo: { flex: 1 },
  noteTitle: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  noteMeta: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 16, color: COLORS.textSecondary, marginTop: 12 },
});

export default NotesScreen;
