import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    View
} from 'react-native';

export default function CalculatingScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Simulate calculation time
    const timer = setTimeout(() => {
      router.push('./plan');
    }, 3000); // 3 seconds

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].onboarding.backgroundColor }]}>
      <View style={styles.content}>
        {/* Progress Circle with Islamic Icon */}
        <View style={styles.progressContainer}>
          <View style={styles.progressCircle}>
            {/* Progress arc */}
            <View style={styles.progressArc} />
            
            {/* Islamic icon in the center */}
            <View style={styles.islamicContainer}>
              <Text style={styles.islamicEmoji}>�</Text>
            </View>
          </View>
        </View>

        {/* Loading Text */}
        <Text style={styles.loadingText}>
          Configuration de votre expérience spirituelle...
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  progressContainer: {
    marginBottom: 80,
  },
  progressCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 8,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  progressArc: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 8,
    borderColor: 'transparent',
    borderTopColor: '#22C55E',
    borderRightColor: '#22C55E',
    borderBottomColor: '#2D5A4A',
    transform: [{ rotate: '0deg' }],
  },
  islamicContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2D5A4A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  islamicEmoji: {
    fontSize: 50,
    color: '#FFFFFF',
  },
  loadingText: {
    fontSize: 18,
    color: '#718096',
    textAlign: 'center',
    fontWeight: '500',
  },
});
