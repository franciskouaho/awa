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

export default function TimeScreen() {
  const [selectedTime, setSelectedTime] = useState<string>('');
  const router = useRouter();
  const colorScheme = useColorScheme();

  const timeOptions = [
    {
      id: 'chill',
      title: 'Rapide (1 minute)',
      emoji: '⏰',
      duration: 1,
    },
    {
      id: 'normal',
      title: 'Modéré (3 minutes)',
      emoji: '�',
      duration: 3,
    },
    {
      id: 'wow',
      title: 'Approfondi (5+ minutes)',
      emoji: '🕕',
      duration: 5,
    }
  ];

  const handleContinue = async () => {
    if (selectedTime) {
      try {
        await AsyncStorage.setItem('userTimePreference', selectedTime);
        router.push('./notification');
      } catch (error) {
        console.error('Error saving time preference:', error);
      }
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].onboarding.backgroundColor }]}>
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title}>
          Combien de temps souhaitez-vous consacrer quotidiennement aux prières ?
        </Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Vous pouvez modifier cela à tout moment dans les paramètres
        </Text>

        {/* Time Options */}
        <View style={styles.optionsContainer}>
          {timeOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionButton,
                selectedTime === option.id && styles.selectedOption
              ]}
              onPress={() => setSelectedTime(option.id)}
            >
              <View style={styles.optionContent}>
                <Text style={styles.optionEmoji}>{option.emoji}</Text>
                <Text style={styles.optionText}>{option.title}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[
            styles.button,
            selectedTime ? styles.buttonActive : styles.buttonInactive
          ]}
          disabled={!selectedTime}
          onPress={handleContinue}
        >
          <Text style={[
            styles.buttonText,
            selectedTime ? styles.buttonTextActive : styles.buttonTextInactive
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
    marginBottom: 12,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    marginBottom: 50,
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
    marginBottom: 80,
  },
  optionButton: {
    width: '100%',
    height: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    marginBottom: 12,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedOption: {
    borderWidth: 3,
    borderColor: '#4299E1',
    backgroundColor: '#EBF8FF',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  optionEmoji: {
    fontSize: 24,
    marginRight: 16,
  },
  optionText: {
    fontSize: 18,
    color: '#2D3748',
    fontWeight: '600',
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
