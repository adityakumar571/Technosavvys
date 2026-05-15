import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, StatusBar, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import api from '../../services/api';
import { COLORS, GRADIENTS } from '../../constants/colors';

const CreateDoubtScreen = ({ navigation, route }) => {
  const { batchId, courseId } = route.params || {};
  const [form, setForm] = useState({ title: '', description: '', subject: '', topic: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.title || !form.description) return Alert.alert('Error', 'Title and description are required');
    setLoading(true);
    try {
      await api.post('/doubts', { ...form, batchId, courseId });
      Alert.alert('Success', 'Doubt posted!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to post doubt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ask a Doubt</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        {[
          { key: 'title', label: 'Title *', placeholder: 'What is your doubt about?', multiline: false },
          { key: 'subject', label: 'Subject', placeholder: 'e.g. Mathematics, English', multiline: false },
          { key: 'topic', label: 'Topic', placeholder: 'e.g. Algebra, Grammar', multiline: false },
          { key: 'description', label: 'Description *', placeholder: 'Describe your doubt in detail...', multiline: true },
        ].map((field) => (
          <View key={field.key} style={styles.fieldContainer}>
            <Text style={styles.label}>{field.label}</Text>
            <TextInput
              style={[styles.input, field.multiline && styles.multilineInput]}
              placeholder={field.placeholder}
              placeholderTextColor={COLORS.textLight}
              value={form[field.key]}
              onChangeText={(val) => setForm((prev) => ({ ...prev, [field.key]: val }))}
              multiline={field.multiline}
              numberOfLines={field.multiline ? 5 : 1}
            />
          </View>
        ))}

        <TouchableOpacity onPress={handleSubmit} disabled={loading} style={styles.submitBtn}>
          <LinearGradient colors={GRADIENTS.primary} style={styles.submitBtnGradient}>
            {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.submitBtnText}>Post Doubt</Text>}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 12, backgroundColor: COLORS.white, elevation: 2 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary },
  content: { flex: 1, padding: 16 },
  fieldContainer: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: COLORS.textPrimary, backgroundColor: COLORS.white },
  multilineInput: { height: 120, textAlignVertical: 'top' },
  submitBtn: { borderRadius: 12, overflow: 'hidden', marginTop: 8, marginBottom: 30 },
  submitBtnGradient: { paddingVertical: 16, alignItems: 'center' },
  submitBtnText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
});

export default CreateDoubtScreen;
