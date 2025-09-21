import { useAuthNavigation } from '@/hooks/useAuthNavigation';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Image, StatusBar, StyleSheet, Text } from 'react-native';
import appConfig from '../app.json';

export default function IndexScreen() {
  const router = useRouter();
  const { shouldShowIntro, shouldShowOnboarding, shouldShowApp, navigationReady } =
    useAuthNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 900,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    if (!navigationReady) return;
    const timeout = setTimeout(() => {
      if (shouldShowIntro) {
        router.replace('/onboarding/intro');
      } else {
        router.replace('/(tabs)/prayers');
      }
    }, 2200);
    return () => clearTimeout(timeout);
  }, [navigationReady, shouldShowIntro, shouldShowOnboarding, shouldShowApp, router]);

  return (
    <LinearGradient colors={['#2D5A4A', '#4A7C69', '#6BAF8A']} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2D5A4A" />
      <Animated.View style={{ alignItems: 'center', opacity: fadeAnim }}>
        <Image source={require('../assets/images/logo_rmbg.png')} style={styles.icon} />
        <Text style={styles.appName}>AWA</Text>
      </Animated.View>
      <Animated.View style={{ position: 'absolute', bottom: 50, opacity: fadeAnim }}>
        <Text style={styles.version}>v{appConfig.expo.version}</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 16,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'System',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  version: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    fontFamily: 'System',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
