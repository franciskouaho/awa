import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useEffect, useState } from 'react';

export function useAuthNavigation() {
  const { user, isLoading, isOnboardingCompleted } = useAuth();
  const [shouldShowIntro, setShouldShowIntro] = useState(false);
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false);
  const [shouldShowApp, setShouldShowApp] = useState(false);
  const [navigationReady, setNavigationReady] = useState(false);

  // Timeout plus long pour les devices physiques
  const isPhysicalDevice = Constants.isDevice;
  const timeoutDuration = isPhysicalDevice ? 10000 : 5000; // 10s pour device physique

  useEffect(() => {
    console.log('useAuthNavigation: Auth state changed', {
      user: !!user,
      isLoading,
      isOnboardingCompleted,
      isPhysicalDevice,
    });
    
    determineNavigationState();

    // Timeout de sécurité pour éviter les blocages
    const timeoutId = setTimeout(() => {
      if (!navigationReady) {
        console.warn('useAuthNavigation: Timeout reached after', timeoutDuration + 'ms, forcing navigation ready');
        setShouldShowIntro(true);
        setShouldShowOnboarding(false);
        setShouldShowApp(false);
        setNavigationReady(true);
      }
    }, timeoutDuration);

    return () => clearTimeout(timeoutId);
  }, [user, isLoading, isOnboardingCompleted]);

  const determineNavigationState = async () => {
    console.log('useAuthNavigation: Determining state, isLoading:', isLoading);
    
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

      if (!user) {
        console.log('useAuthNavigation: No user, checking onboarding data');
        // Pas d'utilisateur connecté
        // Vérifier si on a des données d'onboarding en cours
        const userEmail = await AsyncStorage.getItem('userEmail');
        const userName = await AsyncStorage.getItem('userName');

        if (!userEmail || !userName) {
          // Première visite, afficher intro comme première étape de l'onboarding
          console.log('useAuthNavigation: First visit, showing intro (onboarding step 1)');
          setShouldShowIntro(true);
          setShouldShowOnboarding(false);
          setShouldShowApp(false);
        } else {
          // Onboarding en cours (après intro)
          console.log('useAuthNavigation: Onboarding in progress');
          setShouldShowIntro(false);
          setShouldShowOnboarding(true);
          setShouldShowApp(false);
        }
      } else {
        console.log('useAuthNavigation: User connected, onboarding completed:', isOnboardingCompleted);
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
      // En cas d'erreur, revenir à l'intro pour éviter l'écran blanc
      setShouldShowIntro(true);
      setShouldShowOnboarding(false);
      setShouldShowApp(false);
    } finally {
      // Toujours définir navigationReady à true pour éviter les blocages
      console.log('useAuthNavigation: Setting navigation ready to true');
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
