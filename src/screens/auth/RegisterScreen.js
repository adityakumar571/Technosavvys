import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../store/slices/authSlice';
import { COLORS, GRADIENTS } from '../../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RegisterScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.auth);

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);

  const updateForm = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    if (form.password !== form.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    const result = await dispatch(registerUser({
      name: form.name,
      email: form.email,
      phone: form.phone,
      password: form.password,
    }));

    if (registerUser.fulfilled.match(result)) {
      await AsyncStorage.setItem('token', result.payload.token);
    } else {
      Alert.alert('Registration Failed', result.payload || 'Something went wrong');
    }
  };

  const fields = [
    { key: 'name', placeholder: 'Full Name', icon: 'account-outline', keyboardType: 'default' },
    { key: 'email', placeholder: 'Email Address', icon: 'email-outline', keyboardType: 'email-address' },
    { key: 'phone', placeholder: 'Phone Number (optional)', icon: 'phone-outline', keyboardType: 'phone-pad' },
  ];

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <LinearGradient colors={GRADIENTS.primary} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Account</Text>
        <Text style={styles.headerSubtitle}>Join millions of students</Text>
      </LinearGradient>

      <View style={styles.form}>
        {fields.map((field) => (
          <View key={field.key} style={styles.inputContainer}>
            <Icon name={field.icon} size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder={field.placeholder}
              placeholderTextColor={COLORS.textLight}
              value={form[field.key]}
              onChangeText={(val) => updateForm(field.key, val)}
              keyboardType={field.keyboardType}
              autoCapitalize={field.key === 'name' ? 'words' : 'none'}
            />
          </View>
        ))}

        {/* Password */}
        <View style={styles.inputContainer}>
          <Icon name="lock-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Password"
            placeholderTextColor={COLORS.textLight}
            value={form.password}
            onChangeText={(val) => updateForm('password', val)}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Icon name={showPassword ? 'eye-off' : 'eye'} size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Confirm Password */}
        <View style={styles.inputContainer}>
          <Icon name="lock-check-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor={COLORS.textLight}
            value={form.confirmPassword}
            onChangeText={(val) => updateForm('confirmPassword', val)}
            secureTextEntry={!showPassword}
          />
        </View>

        <TouchableOpacity onPress={handleRegister} disabled={isLoading} style={styles.registerBtn}>
          <LinearGradient colors={GRADIENTS.primary} style={styles.registerBtnGradient}>
            {isLoading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.registerBtnText}>Create Account</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: COLORS.white, marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  form: {
    backgroundColor: COLORS.white,
    margin: 20,
    borderRadius: 20,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginBottom: 16,
    backgroundColor: COLORS.background,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: COLORS.textPrimary, paddingVertical: 12 },
  registerBtn: { borderRadius: 12, overflow: 'hidden', marginTop: 8, marginBottom: 20 },
  registerBtnGradient: { paddingVertical: 16, alignItems: 'center' },
  registerBtnText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  loginContainer: { flexDirection: 'row', justifyContent: 'center' },
  loginText: { color: COLORS.textSecondary, fontSize: 15 },
  loginLink: { color: COLORS.primary, fontSize: 15, fontWeight: 'bold' },
});

export default RegisterScreen;
