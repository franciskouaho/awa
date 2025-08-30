import { useAuthNavigation } from '@/hooks/useAuthNavigation';
import { useStreak } from '@/hooks/useStreak';
import { requestNotificationPermissions, scheduleReminderNotification } from '@/utils/notifications';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';

export default function IndexScreen() {
  const { streakData, refreshStreak } = useStreak();
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

    // Mettre à jour le streak et notifier si un nouveau jour est rempli
    useEffect(() => {
      async function updateStreakAndNotify() {
        await refreshStreak();
        if (streakData && streakData.streakHistory && streakData.streakHistory.length > 0) {
          const lastEntry = streakData.streakHistory[streakData.streakHistory.length - 1];
          if (lastEntry) {
            const lastDate = new Date(lastEntry.date);
            const today = new Date();
            // On compare uniquement l'année, le mois et le jour
            const isToday = lastDate.getFullYear() === today.getFullYear() &&
                           lastDate.getMonth() === today.getMonth() &&
                           lastDate.getDate() === today.getDate();
            if (!isToday && lastEntry.completed) {
              // L'utilisateur n'a pas encore validé aujourd'hui
              await requestNotificationPermissions();
              await scheduleReminderNotification({
                title: 'Bravo !',
                body: `Tu as accompli ta prière aujourd'hui et ta série de jours continue !`,
                seconds: 2,
              });
            }
          }
        }
      }
      updateStreakAndNotify();
    }, [refreshStreak, streakData]);

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
