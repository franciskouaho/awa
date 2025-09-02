import { useAuthNavigation } from '@/hooks/useAuthNavigation';
import {
  requestNotificationPermissions,
  scheduleReminderNotification,
} from '@/utils/notifications';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';

export default function IndexScreen() {
  const previousStreakRef = useRef<number | null>(null);
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
    <View style={styles.container}>
      <Animated.View style={{ alignItems: 'center', opacity: fadeAnim }}>
        <Image source={require('../assets/images/logo_rmbg.png')} style={styles.icon} />
        <Text style={styles.appName}>AWA</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E2D28',
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
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'System',
    letterSpacing: 2,
  },
});
