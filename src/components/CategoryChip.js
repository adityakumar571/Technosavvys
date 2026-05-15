import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

const CategoryChip = ({ item, isSelected, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.chip, isSelected && styles.chipSelected]}
  >
    <Text style={styles.emoji}>{item.icon}</Text>
    <Text style={[styles.label, isSelected && styles.labelSelected]}>{item.label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: 6,
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  emoji: { fontSize: 16 },
  label: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  labelSelected: { color: COLORS.white, fontWeight: '600' },
});

export default CategoryChip;
