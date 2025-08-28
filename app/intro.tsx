import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { getRandomVerse } from '@/data/verses';

export default function IntroScreen() {
  const colorScheme = useColorScheme();
  const verse = getRandomVerse();

  const handleContinue = () => {
    router.replace('/(tabs)/prayers');
  };

  return (
    <View
      style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
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
              Application de Prières pour les Défunts
            </Text>
          </View>

          <View
            style={[
              styles.verseContainer,
              {
                backgroundColor: Colors[colorScheme ?? 'light'].surface,
                shadowColor: Colors[colorScheme ?? 'light'].shadow,
              },
            ]}
          >
            <Text
              style={[
                styles.arabicText,
                {
                  color: Colors[colorScheme ?? 'light'].textArabic,
                },
              ]}
            >
              {verse.arabic}
            </Text>

            <Text
              style={[
                styles.transliterationText,
                {
                  color: Colors[colorScheme ?? 'light'].textSecondary,
                },
              ]}
            >
              {verse.transliteration}
            </Text>

            <Text
              style={[
                styles.translationText,
                {
                  color: Colors[colorScheme ?? 'light'].text,
                },
              ]}
            >
              {verse.translation}
            </Text>

            <Text
              style={[
                styles.referenceText,
                {
                  color: Colors[colorScheme ?? 'light'].primary,
                },
              ]}
            >
              {verse.reference}
            </Text>
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
              Continuer
            </Text>
          </TouchableOpacity>
        </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
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
  verseContainer: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 48,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  arabicText: {
    fontSize: 20,
    lineHeight: 32,
    textAlign: 'right',
    marginBottom: 16,
    fontWeight: '600',
  },
  transliterationText: {
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 16,
  },
  translationText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'left',
    marginBottom: 16,
  },
  referenceText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'right',
  },
  continueButton: {
    borderRadius: 12,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonTouchable: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});
