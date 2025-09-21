import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';
import { useEffect, useRef } from 'react';
import { Alert, AppState, Linking, Platform } from 'react-native';

const HAS_REVIEWED_KEY = '@awa_has_reviewed';
const LAST_REVIEW_ATTEMPT_KEY = '@awa_last_review_attempt';
const REVIEW_TRIGGER_COUNT_KEY = '@awa_review_trigger_count';

export const useInAppReview = () => {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // L'application est revenue au premier plan
        checkIfReviewWasSubmitted();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const hasUserReviewed = async (): Promise<boolean> => {
    try {
      const hasReviewed = await AsyncStorage.getItem(HAS_REVIEWED_KEY);
      return hasReviewed === 'true';
    } catch (error) {
      console.log('Erreur lors de la vérification du statut de review:', error);
      return false;
    }
  };

  const checkIfReviewWasSubmitted = async () => {
    try {
      const lastAttempt = await AsyncStorage.getItem(LAST_REVIEW_ATTEMPT_KEY);
      if (!lastAttempt) return;

      const now = Date.now();
      const timeSinceLastAttempt = now - parseInt(lastAttempt);

      // Si l'utilisateur est revenu à l'app après avoir ouvert le store
      // et qu'il a passé plus de 30 secondes, on considère qu'il a peut-être fait une review
      if (timeSinceLastAttempt > 30000) {
        await markReviewAsDone();
        await AsyncStorage.removeItem(LAST_REVIEW_ATTEMPT_KEY);
        console.log('Review considérée comme effectuée après retour du store');
      }
    } catch (error) {
      console.log('Erreur lors de la vérification de la review:', error);
    }
  };

  const incrementTriggerCount = async (): Promise<number> => {
    try {
      const currentCount = await AsyncStorage.getItem(REVIEW_TRIGGER_COUNT_KEY);
      const count = currentCount ? parseInt(currentCount) + 1 : 1;
      await AsyncStorage.setItem(REVIEW_TRIGGER_COUNT_KEY, count.toString());
      return count;
    } catch (error) {
      console.log("Erreur lors de l'incrémentation du compteur:", error);
      return 0;
    }
  };

  const shouldRequestReview = async (triggerCount: number): Promise<boolean> => {
    try {
      // Ne pas demander si l'utilisateur a déjà review
      const hasReviewed = await hasUserReviewed();
      if (hasReviewed) return false;

      // Demander la review après le 1er scroll, puis tous les 10 scrolls
      if (triggerCount === 1 || (triggerCount > 1 && triggerCount % 10 === 0)) {
        return true;
      }

      return false;
    } catch (error) {
      console.log('Erreur lors de la vérification des conditions de review:', error);
      return false;
    }
  };

  const requestReview = async () => {
    try {
      const hasReviewed = await hasUserReviewed();
      if (hasReviewed) {
        console.log('Review déjà effectuée, pas de nouvelle demande');
        return;
      }

      const isAvailable = await StoreReview.isAvailableAsync();
      if (isAvailable) {
        console.log('Demande de review in-app');
        await StoreReview.requestReview();
        // On ne marque pas comme fait ici car on ne sait pas si l'utilisateur a vraiment reviewé
      } else {
        console.log('Review in-app non disponible, ouverture du store');
        await openStoreReview();
      }
    } catch (error) {
      console.log('Erreur lors de la demande de review:', error);
    }
  };

  const openStoreReview = async () => {
    try {
      const hasReviewed = await hasUserReviewed();
      if (hasReviewed) {
        console.log("Review déjà effectuée, pas d'ouverture du store");
        return;
      }

      // On enregistre le moment où l'utilisateur ouvre le store
      await AsyncStorage.setItem(LAST_REVIEW_ATTEMPT_KEY, Date.now().toString());

      if (Platform.OS === 'ios') {
        // ID de l'app Awa sur l'App Store
        const itunesItemId = '6751673445';
        const url = `https://apps.apple.com/app/apple-store/id${itunesItemId}?action=write-review`;
        console.log('Ouverture App Store pour review');
        await Linking.openURL(url);
      } else if (Platform.OS === 'android') {
        // Package name de l'app Awa
        const androidPackageName = 'com.emplica.awa';
        const url = `https://play.google.com/store/apps/details?id=${androidPackageName}&showAllReviews=true`;
        console.log('Ouverture Google Play pour review');
        await Linking.openURL(url);
      }
    } catch (error) {
      console.log("Erreur lors de l'ouverture du store:", error);
    }
  };

  const markReviewAsDone = async () => {
    try {
      await AsyncStorage.setItem(HAS_REVIEWED_KEY, 'true');
      console.log('Review marquée comme effectuée');
    } catch (error) {
      console.log('Erreur lors du marquage de la review:', error);
    }
  };

  const triggerReviewAfterScroll = async () => {
    try {
      // Incrémenter le compteur de déclencheurs
      const triggerCount = await incrementTriggerCount();

      // Vérifier si on doit demander une review
      const shouldRequest = await shouldRequestReview(triggerCount);

      if (shouldRequest) {
        console.log(`Demande de review après ${triggerCount} scroll(s)`);

        // Afficher une alerte avant de demander la review
        Alert.alert(
          'Aimez-vous Awa ?',
          'Si cette app vous aide dans votre spiritualité, pourriez-vous prendre un moment pour la noter ?',
          [
            {
              text: 'Plus tard',
              style: 'cancel',
            },
            {
              text: "Noter l'app",
              onPress: () => {
                // Petite temporisation pour que l'animation se termine
                setTimeout(() => {
                  requestReview();
                }, 500);
              },
            },
          ]
        );
      }
    } catch (error) {
      console.log('Erreur lors du déclenchement de review:', error);
    }
  };

  const resetReviewData = async () => {
    try {
      await AsyncStorage.multiRemove([
        HAS_REVIEWED_KEY,
        LAST_REVIEW_ATTEMPT_KEY,
        REVIEW_TRIGGER_COUNT_KEY,
      ]);
      console.log('Données de review réinitialisées');
    } catch (error) {
      console.log('Erreur lors de la réinitialisation des données de review:', error);
    }
  };

  return {
    requestReview,
    openStoreReview,
    hasUserReviewed,
    markReviewAsDone,
    triggerReviewAfterScroll,
    resetReviewData,
  };
};
