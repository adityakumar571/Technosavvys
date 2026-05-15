import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import api from '../../services/api';
import { COLORS, GRADIENTS } from '../../constants/colors';

const ForgotPasswordScreen = ({ navigation }) => {
  const [step, setStep] = useState(1); // 1: email, 2: otp+new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    if (!email) return Alert.alert('Error', 'Enter your email');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setStep(2);
      Alert.alert('OTP Sent', 'Check your email for the OTP');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!otp || !newPassword) return Alert.alert('Error', 'Fill all fields');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword });
      Alert.alert('Success', 'Password reset successfully!', [
        { text: 'Login', onPress: () => navigation.replace('Login') },
      ]);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={GRADIENTS.primary} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Forgot Password</Text>
        <Text style={styles.headerSubtitle}>
          {step === 1 ? 'Enter your email to receive OTP' : 'Enter OTP and new password'}
        </Text>
      </LinearGradient>

      <View style={styles.form}>
        {step === 1 ? (
          <>
            <View style={styles.inputContainer}>
              <Icon name="email-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor={COLORS.textLight}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <TouchableOpacity onPress={sendOtp} disabled={loading} style={styles.btn}>
              <LinearGradient colors={GRADIENTS.primary} style={styles.btnGradient}>
                {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.btnText}>Send OTP</Text>}
              </LinearGradient>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.inputContainer}>
              <Icon name="numeric" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter OTP"
                placeholderTextColor={COLORS.textLight}
                value={otp}
                onChangeText={setOtp}
                keyboardType="numeric"
                maxLength={6}
              />
            </View>
            <View style={styles.inputContainer}>
              <Icon name="lock-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="New Password"
                placeholderTextColor={COLORS.textLight}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
            </View>
            <TouchableOpacity onPress={resetPassword} disabled={loading} style={styles.btn}>
              <LinearGradient colors={GRADIENTS.primary} style={styles.btnGradient}>
                {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.btnText}>Reset Password</Text>}
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backBtn: { marginBottom: 16 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.white, marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  form: { backgroundColor: COLORS.white, margin: 20, borderRadius: 20, padding: 24, elevation: 4 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
    backgroundColor: COLORS.background,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: COLORS.textPrimary, paddingVertical: 12 },
  btn: { borderRadius: 12, overflow: 'hidden' },
  btnGradient: { paddingVertical: 16, alignItems: 'center' },
  btnText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
});

export default ForgotPasswordScreen;
