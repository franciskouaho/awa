import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function AffirmationScreen() {
  const [selectedAffirmation, setSelectedAffirmation] = useState<string>('');
  const router = useRouter();
  const colorScheme = useColorScheme();

  const affirmations = [
    {
      id: 'remembrance',
      text: 'Une façon de me rapprocher d\'Allah et de trouver la paix intérieure.',
      color: '#2D5A4A', // Vert principal
    },
    {
      id: 'spiritual',
      text: 'Une pratique spirituelle pour honorer et prier pour nos défunts.',
      color: '#4A7C69', // Vert secondaire
    }
  ];

  const handleContinue = async () => {
    if (selectedAffirmation) {
      try {
        await AsyncStorage.setItem('userAffirmation', selectedAffirmation);
        router.push('./time');
      } catch (error) {
        console.error('Error saving affirmation:', error);
      }
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].onboarding.backgroundColor }]}>
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title}>
          Ravi de vous rencontrer ! Pour vous, cette application représente plutôt...
        </Text>

        {/* Islamic Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.islamicContainer}>
            <Text style={styles.islamicEmoji}>🤲</Text>
          </View>
        </View>

        {/* Affirmation Options */}
        <View style={styles.optionsContainer}>
          {affirmations.map((affirmation) => (
            <TouchableOpacity
              key={affirmation.id}
              style={[
                styles.optionButton,
                { backgroundColor: affirmation.color },
                selectedAffirmation === affirmation.id && styles.selectedOption
              ]}
              onPress={() => setSelectedAffirmation(affirmation.id)}
            >
              <Text style={styles.optionText}>{affirmation.text}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[
            styles.button,
            selectedAffirmation ? styles.buttonActive : styles.buttonInactive
          ]}
          disabled={!selectedAffirmation}
          onPress={handleContinue}
        >
          <Text style={[
            styles.buttonText,
            selectedAffirmation ? styles.buttonTextActive : styles.buttonTextInactive
          ]}>
            Continuer
          </Text>
        </TouchableOpacity>
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D3748',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 36,
  },
  iconContainer: {
    marginBottom: 40,
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
  optionsContainer: {
    width: '100%',
    marginBottom: 100,
  },
  optionButton: {
    width: '100%',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedOption: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  optionText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 30,
  },
  buttonActive: {
    backgroundColor: '#4299E1',
  },
  buttonInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '600',
  },
  buttonTextActive: {
    color: '#FFFFFF',
  },
  buttonTextInactive: {
    color: '#A0A0A0',
  },
});
