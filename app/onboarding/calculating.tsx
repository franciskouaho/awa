
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function CalculatingScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    const timer = setTimeout(() => {
      router.push('./plan');
    }, 3000);

    return () => {
      clearTimeout(timer);
      rotateAnim.stopAnimation();
    };
  }, [router, rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].onboarding.backgroundColor }]}> 
      <View style={styles.content}>
        <View style={styles.progressContainer}>
          <Animated.View style={[styles.progressCircle, { transform: [{ rotate: spin }] }]}> 
            <View style={styles.progressArc} />
            <View style={styles.islamicContainer}>
              <FontAwesome5 name="mosque" size={48} color="#fff" />
            </View>
          </Animated.View>
        </View>
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
    overflow: 'hidden',
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
    borderLeftColor: 'transparent',
  },
  islamicContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2D5A4A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  loadingText: {
    fontSize: 18,
    color: '#718096',
    textAlign: 'center',
    fontWeight: '500',
  },
});
