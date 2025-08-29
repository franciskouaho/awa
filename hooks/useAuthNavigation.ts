import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import Constants from 'expo-constants';

export function useAuthNavigation() {
  const { user, isLoading, isOnboardingCompleted } = useAuth();
  const [shouldShowIntro, setShouldShowIntro] = useState(true);
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

      // Vérifier si l'intro a déjà été vue
      const introSeen = await AsyncStorage.getItem('introSeen');
      console.log('useAuthNavigation: introSeen =', introSeen);
      
      if (!user) {
        console.log('useAuthNavigation: No user, checking onboarding data');
        // Pas d'utilisateur connecté
        // Vérifier si on a des données d'onboarding en cours
        const userEmail = await AsyncStorage.getItem('userEmail');
        const userName = await AsyncStorage.getItem('userName');
        
        if (userEmail && userName) {
          // L'utilisateur a commencé l'onboarding mais n'a pas créé de compte
          console.log('useAuthNavigation: Onboarding in progress');
          setShouldShowIntro(false);
          setShouldShowOnboarding(true);
          setShouldShowApp(false);
        } else if (introSeen === 'true') {
          // Intro déjà vue, mais pas d'utilisateur -> retourner à l'intro
          console.log('useAuthNavigation: Intro seen, returning to intro');
          setShouldShowIntro(true);
          setShouldShowOnboarding(false);
          setShouldShowApp(false);
        } else {
          // Première visite
          console.log('useAuthNavigation: First visit, showing intro');
          setShouldShowIntro(true);
          setShouldShowOnboarding(false);
          setShouldShowApp(false);
        }
      } else {
        console.log('useAuthNavigation: User connected, onboarding completed:', isOnboardingCompleted);
        // Utilisateur connecté
        await AsyncStorage.setItem('introSeen', 'true');
        
        if (!isOnboardingCompleted) {
          // Onboarding pas terminé (ne devrait pas arriver avec le nouveau flux)
          console.log('useAuthNavigation: Onboarding not completed');
          setShouldShowIntro(false);
          setShouldShowOnboarding(true);
          setShouldShowApp(false);
        } else {
          // Tout est terminé
          console.log('useAuthNavigation: Everything completed, showing app');
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
