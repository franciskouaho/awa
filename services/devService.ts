import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Alert } from 'react-native';

export class DevService {
  /**
   * Reset l'onboarding pour le développement
   * Supprime toutes les données d'onboarding et redirige vers l'intro
   */
  static async resetOnboarding() {
    try {
      // Supprimer toutes les données d'onboarding
      await AsyncStorage.multiRemove([
        'userName',
        'userEmail', 
        'userAffirmation',
        'onboardingCompleted',
        'userPreferences',
        'userSettings'
      ]);

      console.log('🧹 Onboarding reset - Données supprimées');
      
      // Rediriger vers l'écran d'intro
      router.replace('/onboarding/intro');
      
      Alert.alert(
        'Onboarding Reset',
        'L\'onboarding a été réinitialisé. Vous pouvez maintenant recommencer le processus.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('❌ Erreur lors du reset de l\'onboarding:', error);
      Alert.alert(
        'Erreur',
        'Impossible de réinitialiser l\'onboarding. Veuillez réessayer.'
      );
    }
  }

  /**
   * Vérifie si on est en mode développement
   */
  static isDevMode(): boolean {
    return __DEV__;
  }

  /**
   * Affiche les informations de debug
   */
  static async getDebugInfo() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const onboardingKeys = keys.filter(key => 
        key.includes('user') || 
        key.includes('onboarding') || 
        key.includes('preferences')
      );
      
      const data = await AsyncStorage.multiGet(onboardingKeys);
      
      console.log('🔍 Debug Info - Clés d\'onboarding:', onboardingKeys);
      console.log('🔍 Debug Info - Données:', data);
      
      return {
        keys: onboardingKeys,
        data: data
      };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des infos de debug:', error);
      return null;
    }
  }
}
