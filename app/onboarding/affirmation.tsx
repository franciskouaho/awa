import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useDeviceType } from '@/hooks/useDeviceType';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AffirmationScreen() {
  const [selectedAffirmation, setSelectedAffirmation] = useState<string>('');
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { isIPad } = useDeviceType();
  const { signUp, completeOnboarding } = useAuth();

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
    if (!selectedAffirmation) {
      Alert.alert('Sélection requise', 'Veuillez choisir une affirmation avant de continuer.');
      return;
    }

    setIsCreatingAccount(true);
    try {
      // Sauvegarder l'affirmation
      await AsyncStorage.setItem('userAffirmation', selectedAffirmation);

      // Récupérer les données d'onboarding
      const userEmail = await AsyncStorage.getItem('userEmail');
      const userName = await AsyncStorage.getItem('userName');

      if (!userEmail || !userName) {
        Alert.alert('Erreur', "Informations manquantes. Veuillez recommencer l'onboarding.");
        router.push('/onboarding/email');
        return;
      }

      console.log('🚀 Création du compte Firebase...', { userEmail, userName });

      // Créer le compte Firebase
      await signUp(userEmail, userName);

      console.log("✅ Compte créé, finalisation de l'onboarding...");

      // Marquer l'onboarding comme terminé
      await completeOnboarding({
        affirmation: selectedAffirmation,
      });

      console.log("🎉 Onboarding terminé ! Redirection vers l'app...");

      // Rediriger vers l'app
      router.replace('/(tabs)/prayers');
    } catch (error: any) {
      console.error('❌ Erreur lors de la création du compte:', error);
      Alert.alert(
        'Erreur',
        error.message || 'Impossible de créer votre compte. Veuillez réessayer.'
      );
    } finally {
      setIsCreatingAccount(false);
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        isIPad && styles.containerIPad,
        { backgroundColor: Colors[colorScheme ?? 'light'].onboarding.backgroundColor },
      ]}
    >
      <View style={[styles.content, isIPad && styles.contentIPad]}>
        <View style={[styles.contentWrapper, isIPad && styles.contentWrapperIPad]}>
          {/* Title */}
          <Text style={[styles.title, isIPad && styles.titleIPad]}>
            Ravi de vous rencontrer ! Pour vous, cette application représente plutôt...
          </Text>

          {/* Affirmation Options */}
          <View style={[styles.optionsContainer, isIPad && styles.optionsContainerIPad]}>
            {affirmations.map(affirmation => (
              <TouchableOpacity
                key={affirmation.id}
                style={[
                  styles.optionButton,
                  isIPad && styles.optionButtonIPad,
                  { backgroundColor: affirmation.color },
                  selectedAffirmation === affirmation.id && styles.selectedOption,
                ]}
                onPress={() => setSelectedAffirmation(affirmation.id)}
              >
                <Text style={[styles.optionText, isIPad && styles.optionTextIPad]}>{affirmation.text}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={[
              styles.button,
              isIPad && styles.buttonIPad,
              selectedAffirmation && !isCreatingAccount ? styles.buttonActive : styles.buttonInactive
            ]}
            disabled={!selectedAffirmation || isCreatingAccount}
            onPress={handleContinue}
          >
            {isCreatingAccount ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="white" size="small" />
                <Text style={[styles.buttonTextActive, isIPad && styles.buttonTextActiveIPad]}>Création du compte...</Text>
              </View>
            ) : (
              <Text
                style={[
                  styles.buttonText,
                  isIPad && styles.buttonTextIPad,
                  selectedAffirmation ? styles.buttonTextActive : styles.buttonTextInactive,
                ]}
              >
                Continuer
              </Text>
            )}
          </TouchableOpacity>
        </View>
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
  contentWrapper: {
    width: '100%',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2D3748',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 28,
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
    marginTop: 20,
    marginBottom: 30,
  },
  buttonActive: {
    backgroundColor: '#2D5A4A',
  },
  buttonInactive: {
    backgroundColor: 'rgba(45, 90, 74, 0.3)',
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
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  // Styles iPad
  containerIPad: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentIPad: {
    width: '100%',
    alignItems: 'center',
  },
  contentWrapperIPad: {
    width: 600,
    maxWidth: '90%',
  },
  titleIPad: {
    fontSize: 28,
    marginBottom: 32,
  },
  optionsContainerIPad: {
    marginBottom: 80,
  },
  optionButtonIPad: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  optionTextIPad: {
    fontSize: 17,
    lineHeight: 24,
  },
  buttonIPad: {
    height: 56,
    position: 'relative',
    bottom: 0,
  },
  buttonTextIPad: {
    fontSize: 18,
  },
  buttonTextActiveIPad: {
    fontSize: 18,
  },
});
