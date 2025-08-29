import { useAuthNavigation } from '@/hooks/useAuthNavigation';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export default function IndexScreen() {
  const router = useRouter();
  const { shouldShowIntro, shouldShowOnboarding, shouldShowApp, navigationReady } =
    useAuthNavigation();

  useEffect(() => {
    if (!navigationReady) return;

    console.log('Index navigation decision:', {
      shouldShowIntro,
      shouldShowOnboarding,
      shouldShowApp,
    });

    if (shouldShowIntro) {
      router.replace('/intro');
    } else if (shouldShowOnboarding) {
      router.replace('/onboarding/email');
    } else if (shouldShowApp) {
      router.replace('/(tabs)/prayers');
    }
  }, [navigationReady, shouldShowIntro, shouldShowOnboarding, shouldShowApp, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#2D5A4A" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FBF9',
  },
});
