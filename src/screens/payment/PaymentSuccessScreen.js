import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, GRADIENTS } from '../../constants/colors';

const PaymentSuccessScreen = ({ navigation, route }) => {
  const { item } = route.params || {};
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }).start();
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient colors={GRADIENTS.success} style={styles.gradient}>
        <Animated.View style={[styles.successCircle, { transform: [{ scale: scaleAnim }] }]}>
          <Icon name="check" size={60} color={COLORS.white} />
        </Animated.View>
        <Text style={styles.title}>Payment Successful!</Text>
        <Text style={styles.subtitle}>You are now enrolled in</Text>
        <Text style={styles.courseName}>{item?.title || item?.name}</Text>
      </LinearGradient>

      <View style={styles.content}>
        {[
          { icon: 'video', text: 'Access all video lectures' },
          { icon: 'video-wireless', text: 'Join live classes' },
          { icon: 'file-pdf-box', text: 'Download study notes' },
          { icon: 'clipboard-text', text: 'Attempt mock tests' },
        ].map((feature, i) => (
          <View key={i} style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Icon name={feature.icon} size={20} color={COLORS.success} />
            </View>
            <Text style={styles.featureText}>{feature.text}</Text>
          </View>
        ))}

        <TouchableOpacity
          onPress={() => navigation.navigate('Home')}
          style={styles.homeBtn}
        >
          <LinearGradient colors={GRADIENTS.primary} style={styles.homeBtnGradient}>
            <Text style={styles.homeBtnText}>Start Learning</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  gradient: { paddingTop: 80, paddingBottom: 40, alignItems: 'center' },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.white, marginBottom: 8 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.85)', marginBottom: 4 },
  courseName: { fontSize: 18, fontWeight: 'bold', color: COLORS.white, textAlign: 'center', paddingHorizontal: 20 },
  content: { flex: 1, padding: 24 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: { fontSize: 15, color: COLORS.textPrimary, fontWeight: '500' },
  homeBtn: { borderRadius: 12, overflow: 'hidden', marginTop: 24 },
  homeBtnGradient: { paddingVertical: 16, alignItems: 'center' },
  homeBtnText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
});

export default PaymentSuccessScreen;
