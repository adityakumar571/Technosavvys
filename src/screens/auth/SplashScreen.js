import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, GRADIENTS } from '../../constants/colors';

const SplashScreen = ({ navigation }) => {
  const scaleAnim = new Animated.Value(0);
  const opacityAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient colors={GRADIENTS.primary} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <Animated.View style={[styles.logoContainer, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>TS</Text>
        </View>
        <Text style={styles.appName}>Technosavvys</Text>
        <Text style={styles.tagline}>Learn • Grow • Succeed</Text>
      </Animated.View>
      <Text style={styles.version}>v1.0.0</Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logoContainer: { alignItems: 'center' },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  logoText: { fontSize: 36, fontWeight: 'bold', color: COLORS.white },
  appName: { fontSize: 28, fontWeight: 'bold', color: COLORS.white, marginBottom: 8 },
  tagline: { fontSize: 16, color: 'rgba(255,255,255,0.8)' },
  version: { position: 'absolute', bottom: 30, color: 'rgba(255,255,255,0.6)', fontSize: 12 },
});

export default SplashScreen;
