// TODO: Implement index screen
import { useAuthNavigation } from '@/hooks/useAuthNavigation';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function IndexScreen() {
  const router = useRouter();
  const [timeoutReached, setTimeoutReached] = useState(false);
  const { shouldShowIntro, shouldShowOnboarding, shouldShowApp, navigationReady } =
    useAuthNavigation();

  useEffect(() => {
    console.log('IndexScreen mounted');
    console.log('Initial state:', {
      shouldShowIntro,
      shouldShowOnboarding,
      shouldShowApp,
      navigationReady,
    });

    // Timeout de sécurité pour éviter l'écran blanc infini
    const timeoutId = setTimeout(() => {
      console.log('Timeout reached, forcing navigation to intro');
      setTimeoutReached(true);
      router.replace('/intro');
    }, 3000); // 3 secondes max

    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!navigationReady) {
      console.log('Navigation not ready yet...');
      return;
    }

    console.log('Navigation ready! Decision:', {
      shouldShowIntro,
      shouldShowOnboarding,
      shouldShowApp,
    });

    if (shouldShowIntro) {
      console.log('Navigating to intro');
      router.replace('/intro');
    } else if (shouldShowOnboarding) {
      console.log('Navigating to onboarding');
      router.replace('/onboarding/email');
    } else if (shouldShowApp) {
      console.log('Navigating to app');
      router.replace('/(tabs)/prayers');
    } else {
      console.log('No navigation condition met, defaulting to intro');
      router.replace('/intro');
    }
  }, [navigationReady, shouldShowIntro, shouldShowOnboarding, shouldShowApp, router]);

  const forceNavigation = () => {
    console.log('Force navigation to intro');
    router.replace('/intro');
  };

  if (!navigationReady && !timeoutReached) {
    // Afficher un loader pendant la décision de navigation
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2D5A4A" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#2D5A4A" />
      <Text style={styles.loadingText}>
        {timeoutReached ? 'Navigation forcée...' : 'Chargement...'}
      </Text>
      <TouchableOpacity style={styles.forceButton} onPress={forceNavigation}>
        <Text style={styles.forceButtonText}>Forcer la navigation</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FBF9',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FBF9',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#2D5A4A',
    textAlign: 'center',
  },
  forceButton: {
    marginTop: 30,
    backgroundColor: '#2D5A4A',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  forceButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
