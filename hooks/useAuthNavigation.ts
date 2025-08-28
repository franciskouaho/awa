import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export function useAuthNavigation() {
  const { user, isLoading, isOnboardingCompleted } = useAuth();
  const [shouldShowIntro, setShouldShowIntro] = useState(true);
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false);
  const [shouldShowApp, setShouldShowApp] = useState(false);
  const [navigationReady, setNavigationReady] = useState(false);

  useEffect(() => {
    determineNavigationState();
  }, [user, isLoading, isOnboardingCompleted]);

  const determineNavigationState = async () => {
    if (isLoading) {
      setNavigationReady(false);
      return;
    }

    try {
      // 🚀 BYPASS TEMPORAIRE POUR LE DÉVELOPPEMENT
      // Vérifie s'il faut bypass l'intro pour les tests
      const devBypass = await AsyncStorage.getItem('devBypass');
      if (devBypass === 'true') {
        console.log('🔧 Dev bypass activé - accès direct à l\'app');
        setShouldShowIntro(false);
        setShouldShowOnboarding(false);
        setShouldShowApp(true);
        setNavigationReady(true);
        return;
      }

      // Vérifier si l'intro a déjà été vue
      const introSeen = await AsyncStorage.getItem('introSeen');
      
      if (!user) {
        // Pas d'utilisateur connecté
        // Vérifier si on a des données d'onboarding en cours
        const userEmail = await AsyncStorage.getItem('userEmail');
        const userName = await AsyncStorage.getItem('userName');
        
        if (userEmail && userName) {
          // L'utilisateur a commencé l'onboarding mais n'a pas créé de compte
          setShouldShowIntro(false);
          setShouldShowOnboarding(true);
          setShouldShowApp(false);
        } else if (introSeen === 'true') {
          // Intro déjà vue, mais pas d'utilisateur -> retourner à l'intro
          setShouldShowIntro(true);
          setShouldShowOnboarding(false);
          setShouldShowApp(false);
        } else {
          // Première visite
          setShouldShowIntro(true);
          setShouldShowOnboarding(false);
          setShouldShowApp(false);
        }
      } else {
        // Utilisateur connecté
        await AsyncStorage.setItem('introSeen', 'true');
        
        if (!isOnboardingCompleted) {
          // Onboarding pas terminé (ne devrait pas arriver avec le nouveau flux)
          setShouldShowIntro(false);
          setShouldShowOnboarding(true);
          setShouldShowApp(false);
        } else {
          // Tout est terminé
          setShouldShowIntro(false);
          setShouldShowOnboarding(false);
          setShouldShowApp(true);
        }
      }
    } catch (error) {
      console.error('Error determining navigation state:', error);
      // En cas d'erreur, revenir à l'intro
      setShouldShowIntro(true);
      setShouldShowOnboarding(false);
      setShouldShowApp(false);
    } finally {
      setNavigationReady(true);
    }
  };

  return {
    shouldShowIntro,
    shouldShowOnboarding,
    shouldShowApp,
    navigationReady,
    isLoading,
    user,
    isOnboardingCompleted,
  };
}
