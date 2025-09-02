import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AffirmationScreen() {
  const [selectedAffirmation, setSelectedAffirmation] = useState<string>('');
  const router = useRouter();
  const colorScheme = useColorScheme();

  const affirmations = [
    {
      id: 'quran',
      text: "Sourate Ibrâhîm (14:41)\nرَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ\n« Seigneur ! Pardonne-moi, ainsi qu'à mes père et mère et aux croyants, le jour où aura lieu le jugement. »",
      color: '#2D5A4A', // Vert principal
    },
    {
      id: 'hadith',
      text: "إِذَا مَاتَ الإِنْسَانُ انْقَطَعَ عَنْهُ عَمَلُهُ إِلاَّ مِنْ ثَلاثٍ: صَدَقَةٍ جَارِيَةٍ، أَوْ عِلْمٍ يُنْتَفَعُ بِهِ، أَوْ وَلَدٍ صَالِحٍ يَدْعُوَ لَهُ\n(رواه مسلم)\n« Lorsque le fils d'Adam meurt, ses œuvres cessent sauf trois : une aumône continue, une science utile, ou un enfant pieux qui prie pour lui. »",
      color: '#4A7C69', // Vert secondaire
    },
  ];

  const handleContinue = async () => {
    if (selectedAffirmation) {
      try {
        await AsyncStorage.setItem('userAffirmation', selectedAffirmation);
        router.push('/onboarding/plan');
      } catch (error) {
        console.error('Error saving affirmation:', error);
      }
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme ?? 'light'].onboarding.backgroundColor },
      ]}
    >
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
          {affirmations.map(affirmation => (
            <TouchableOpacity
              key={affirmation.id}
              style={[
                styles.optionButton,
                { backgroundColor: affirmation.color },
                selectedAffirmation === affirmation.id && styles.selectedOption,
              ]}
              onPress={() => setSelectedAffirmation(affirmation.id)}
            >
              <Text style={styles.optionText}>{affirmation.text}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[styles.button, selectedAffirmation ? styles.buttonActive : styles.buttonInactive]}
          disabled={!selectedAffirmation}
          onPress={handleContinue}
        >
          <Text
            style={[
              styles.buttonText,
              selectedAffirmation ? styles.buttonTextActive : styles.buttonTextInactive,
            ]}
          >
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
    fontSize: 22,
    fontWeight: '700',
    color: '#2D3748',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 28,
  },
  iconContainer: {
    marginBottom: 24,
  },
  islamicContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
    fontSize: 40,
    color: '#FFFFFF',
  },
  optionsContainer: {
    width: '100%',
    marginBottom: 60,
  },
  optionButton: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 12,
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
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    width: '100%',
    height: 48,
    borderRadius: 12,
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
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextActive: {
    color: '#FFFFFF',
  },
  buttonTextInactive: {
    color: '#A0A0A0',
  },
});
