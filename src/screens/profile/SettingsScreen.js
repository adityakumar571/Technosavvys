import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, StatusBar, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { COLORS } from '../../constants/colors';

const SettingsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const settings = [
    { icon: 'bell-outline', label: 'Push Notifications', type: 'switch', value: notifications, onChange: setNotifications },
    { icon: 'moon-waning-crescent', label: 'Dark Mode', type: 'switch', value: darkMode, onChange: setDarkMode },
    { icon: 'lock-outline', label: 'Change Password', type: 'nav', onPress: () => navigation.navigate('ForgotPassword') },
    { icon: 'help-circle-outline', label: 'Help & Support', type: 'nav', onPress: () => {} },
    { icon: 'information-outline', label: 'About App', type: 'nav', onPress: () => Alert.alert('Technosavvys', 'Version 1.0.0\nBuilt with ❤️') },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>
      <View style={styles.settingsCard}>
        {settings.map((setting, i) => (
          <TouchableOpacity
            key={i}
            onPress={setting.onPress}
            style={[styles.settingItem, i < settings.length - 1 && styles.settingBorder]}
          >
            <View style={styles.settingLeft}>
              <Icon name={setting.icon} size={22} color={COLORS.primary} />
              <Text style={styles.settingLabel}>{setting.label}</Text>
            </View>
            {setting.type === 'switch' ? (
              <Switch value={setting.value} onValueChange={setting.onChange} trackColor={{ true: COLORS.primary }} />
            ) : (
              <Icon name="chevron-right" size={20} color={COLORS.textLight} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 12, backgroundColor: COLORS.white, elevation: 2 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary },
  settingsCard: { backgroundColor: COLORS.white, margin: 16, borderRadius: 16, elevation: 2 },
  settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  settingBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  settingLabel: { fontSize: 15, color: COLORS.textPrimary, fontWeight: '500' },
});

export default SettingsScreen;
