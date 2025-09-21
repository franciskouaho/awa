import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

const TUTORIAL_KEY = 'prayer_tutorial_shown';

export function usePrayerTutorial() {
  const [showTutorial, setShowTutorial] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkTutorialStatus();
  }, []);

  const checkTutorialStatus = async () => {
    try {
      const tutorialShown = await AsyncStorage.getItem(TUTORIAL_KEY);
      if (tutorialShown === null) {
        // Premier lancement, montrer le tutorial
        setShowTutorial(true);
      } else {
        setShowTutorial(false);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du statut du tutorial:', error);
      // En cas d'erreur, ne pas montrer le tutorial
      setShowTutorial(false);
    } finally {
      setIsLoading(false);
    }
  };

  const markTutorialAsShown = async () => {
    try {
      await AsyncStorage.setItem(TUTORIAL_KEY, 'true');
      setShowTutorial(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du statut du tutorial:', error);
    }
  };

  const resetTutorial = async () => {
    try {
      await AsyncStorage.removeItem(TUTORIAL_KEY);
      setShowTutorial(true);
    } catch (error) {
      console.error('Erreur lors de la réinitialisation du tutorial:', error);
    }
  };

  return {
    showTutorial,
    isLoading,
    markTutorialAsShown,
    resetTutorial,
  };
}
