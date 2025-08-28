import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function IntroScreen() {
  const colorScheme = useColorScheme();
  const [showContent, setShowContent] = useState(false);
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);
  const slideAnim = new Animated.Value(50);

  useEffect(() => {
    // Splash animation sequence
    const splashDuration = 2000;

    // Initial app title animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Show main content after splash
    setTimeout(() => {
      setShowContent(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }, splashDuration);
  }, []);

  const handleContinue = () => {
    router.push('/onboarding/email');
  };

  const handleDevBypass = async () => {
    await AsyncStorage.setItem('devBypass', 'true');
    router.replace('/(tabs)/prayers');
  };

  return (
    <View
      style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}
    >
      <SafeAreaView style={styles.safeArea}>
        {!showContent ? (
          // Splash Screen
          <View style={styles.splashContainer}>
            <Animated.View
              style={[
                styles.splashContent,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              <View
                style={[
                  styles.logoContainer,
                  { backgroundColor: Colors[colorScheme ?? 'light'].primary },
                ]}
              >
                <Text
                  style={[styles.logoText, { color: Colors[colorScheme ?? 'light'].textOnPrimary }]}
                >
                  AWA
                </Text>
              </View>
              <Text
                style={[
                  styles.splashSubtitle,
                  { color: Colors[colorScheme ?? 'light'].textSecondary },
                ]}
              >
                بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم
              </Text>
              <Text
                style={[styles.splashDescription, { color: Colors[colorScheme ?? 'light'].text }]}
              >
                Au nom d&#39;Allah, le Miséricordieux, le Très Miséricordieux
              </Text>
            </Animated.View>
          </View>
        ) : (
          // Main Content
          <Animated.View
            style={[
              styles.content,
              {
                transform: [{ translateY: slideAnim }],
                opacity: fadeAnim,
              },
            ]}
          >
            <View style={styles.header}>
              <Text
                style={[
                  styles.appTitle,
                  {
                    color: Colors[colorScheme ?? 'light'].primary,
                  },
                ]}
              >
                AWA
              </Text>
              <Text
                style={[
                  styles.subtitle,
                  {
                    color: Colors[colorScheme ?? 'light'].textSecondary,
                  },
                ]}
              >
                Prières pour les Défunts
              </Text>
            </View>

            <View style={styles.centerContent}>
              <Text
                style={[
                  styles.welcomeText,
                  {
                    color: Colors[colorScheme ?? 'light'].text,
                  },
                ]}
              >
                Bienvenue dans votre application de prières
              </Text>

              <Text
                style={[
                  styles.descriptionText,
                  {
                    color: Colors[colorScheme ?? 'light'].textSecondary,
                  },
                ]}
              >
                AWA vous accompagne dans vos moments de recueillement et de prière pour vos proches
                défunts. Découvrez des prières authentiques, des invocations du Coran et des dhikr
                pour honorer la mémoire de ceux qui nous ont quittés.
              </Text>

              <View style={styles.featuresContainer}>
                <View style={styles.featureItem}>
                  <Text style={styles.featureEmoji}>🤲</Text>
                  <Text
                    style={[styles.featureText, { color: Colors[colorScheme ?? 'light'].text }]}
                  >
                    Prières authentiques pour les défunts
                  </Text>
                </View>

                <View style={styles.featureItem}>
                  <Text style={styles.featureEmoji}>📿</Text>
                  <Text
                    style={[styles.featureText, { color: Colors[colorScheme ?? 'light'].text }]}
                  >
                    Dhikr et invocations personnalisées
                  </Text>
                </View>

                <View style={styles.featureItem}>
                  <Text style={styles.featureEmoji}>💚</Text>
                  <Text
                    style={[styles.featureText, { color: Colors[colorScheme ?? 'light'].text }]}
                  >
                    Interface apaisante et spirituelle
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.continueButton,
                { backgroundColor: Colors[colorScheme ?? 'light'].primary },
              ]}
              onPress={handleContinue}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.continueButtonText,
                  {
                    color: Colors[colorScheme ?? 'light'].textOnPrimary,
                  },
                ]}
              >
                Commencer
              </Text>
            </TouchableOpacity>

            {/* Bouton de bypass pour le développement */}
            <TouchableOpacity
              style={[styles.devButton]}
              onPress={handleDevBypass}
              activeOpacity={0.7}
            >
              <Text style={styles.devButtonText}>
                🔧 Bypass Dev → Prayers
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  splashContent: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  splashSubtitle: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '600',
    lineHeight: 36,
  },
  splashDescription: {
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  centerContent: {
    alignItems: 'center',
    marginBottom: 80,
  },
  welcomeText: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '400',
  },
  descriptionText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  featuresContainer: {
    width: '100%',
    marginTop: 16,
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    lineHeight: 24,
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 80,
  },
  appTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '400',
  },
  continueButton: {
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  devButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  devButtonText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
});
