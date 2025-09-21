import { useDeviceType } from '@/hooks/useDeviceType';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AffirmationScreen() {
  const [selectedAffirmation, setSelectedAffirmation] = useState<string>('');
  const router = useRouter();
  const { isIPad } = useDeviceType();

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

    await Haptics.selectionAsync();

    try {
      // Sauvegarder l'affirmation
      await AsyncStorage.setItem('userAffirmation', selectedAffirmation);

      // Aller à l'écran nom
      router.push('/onboarding/name');
    } catch (error: any) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder votre choix. Veuillez réessayer.');
    }
  };

  return (
    <LinearGradient
      colors={['#2D5A4A', '#4A7C69', '#6BAF8A']}
      style={[styles.container, isIPad && styles.containerIPad]}
    >
      <SafeAreaView style={styles.safeArea}>
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
                    selectedAffirmation === affirmation.id && styles.selectedOption,
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedAffirmation(affirmation.id);
                  }}
                >
                  <LinearGradient
                    colors={[affirmation.color, `${affirmation.color}CC`]}
                    style={styles.optionGradient}
                  >
                    <Text style={[styles.optionText, isIPad && styles.optionTextIPad]}>
                      {affirmation.text}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>

            {/* Continue Button */}
            <TouchableOpacity
              style={[
                styles.button,
                isIPad && styles.buttonIPad,
                selectedAffirmation ? styles.buttonActive : styles.buttonInactive,
              ]}
              disabled={!selectedAffirmation}
              onPress={handleContinue}
            >
              <View
                style={[
                  styles.glassBackground,
                  !selectedAffirmation && styles.glassBackgroundDisabled,
                ]}
              >
                <View style={styles.glassInner}>
                  <View style={styles.glassHighlight} />
                  <Text
                    style={[
                      styles.buttonText,
                      isIPad && styles.buttonTextIPad,
                      selectedAffirmation ? styles.buttonTextActive : styles.buttonTextInactive,
                    ]}
                  >
                    Continuer
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
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
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 28,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  optionGradient: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassBackground: {
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: 'rgba(255, 255, 255, 0.5)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  glassBackgroundDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  glassInner: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    position: 'relative',
  },
  glassHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  optionsContainer: {
    width: '100%',
    marginBottom: 60,
  },
  optionButton: {
    width: '100%',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  selectedOption: {
    shadowColor: '#FFFFFF',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
  optionText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  button: {
    width: '100%',
    marginTop: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonActive: {
    // Gradient handled by LinearGradient
  },
  buttonInactive: {
    // Gradient handled by LinearGradient
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextActive: {
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  buttonTextInactive: {
    color: 'rgba(255, 255, 255, 0.5)',
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
