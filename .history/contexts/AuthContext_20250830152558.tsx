import { authService, UserProfile } from '@/services/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from 'firebase/auth';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: User | null;
  isLoading: boolean;
  isOnboardingCompleted: boolean;
  signUp: (email: string, name: string) => Promise<void>;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  completeOnboarding: (preferences?: any) => Promise<void>;
  refreshUser: () => Promise<void>;
  syncFirebaseUid: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    let firebaseChecked = false;

    // Sécurité : démarrer un timeout pour éviter les blocages infinis
    timeoutId = setTimeout(() => {
      console.warn('AuthContext: Timeout reached, setting loading to false');
      setIsLoading(false);
    }, 10000); // 10 secondes maximum

    // Vérifier le cache au démarrage AVANT d'écouter Firebase
    (async () => {
      await checkCachedUser();
    })();

    // Écouter les changements d'authentification Firebase
    const unsubscribe = authService.onAuthStateChange(async firebaseUser => {
      firebaseChecked = true;
      try {
        setFirebaseUser(firebaseUser);
        if (firebaseUser) {
          // Utilisateur connecté - synchroniser l'ID Firebase
          await authService.syncFirebaseUid();

          // Récupérer le profil utilisateur
          const userProfile = await authService.getUserProfile(firebaseUser.uid);
          if (userProfile) {
            setUser(userProfile);
            setIsOnboardingCompleted(userProfile.onboardingCompleted);

            // Mettre à jour le cache local avec le profil Firebase
            await AsyncStorage.setItem('user', JSON.stringify(userProfile));
            await AsyncStorage.setItem('firebaseUid', firebaseUser.uid);
          }
        } else {
          // Utilisateur déconnecté
          // NE PAS forcer la déconnexion si le cache existe et que le timeout n'est pas atteint
          if (!user) {
            setUser(null);
            setIsOnboardingCompleted(false);
          }
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
      } finally {
        setIsLoading(false);
        clearTimeout(timeoutId);
      }
    });

    return () => {
      unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  const checkCachedUser = async () => {
    try {
      const cachedUser = await authService.getCurrentUserProfile();
      const firebaseUid = await authService.getCurrentFirebaseUid();

      // Lecture stricte de l'état onboardingCompleted depuis AsyncStorage
      const onboardingCompletedLocal = await AsyncStorage.getItem('onboardingCompleted');
      let onboardingStatus = false;
      if (onboardingCompletedLocal === 'true') {
        onboardingStatus = true;
      } else {
        // fallback sur la méthode existante (Firebase)
        onboardingStatus = await authService.isOnboardingCompleted();
      }

      if (cachedUser && firebaseUid) {
        // Vérifier que l'ID utilisateur correspond à l'ID Firebase
        if (cachedUser.uid === firebaseUid) {
          setUser(cachedUser);
          setIsOnboardingCompleted(onboardingStatus);
        } else {
          // ID incohérent - nettoyer le cache et redémarrer
          console.warn('User ID mismatch detected, clearing cache');
          await AsyncStorage.multiRemove(['user', 'firebaseUid', 'userEmail']);
          setUser(null);
          setIsOnboardingCompleted(false);
        }
      } else {
        setUser(null);
        setIsOnboardingCompleted(false);
      }
    } catch (error) {
      console.error('Error checking cached user:', error);
      setUser(null);
      setIsOnboardingCompleted(false);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, name: string) => {
    try {
      setIsLoading(true);
      const userProfile = await authService.createUserWithEmailOnly(email, name);
      setUser(userProfile);
      setIsOnboardingCompleted(false);
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string) => {
    try {
      setIsLoading(true);
      const userProfile = await authService.signInWithEmail(email);
      if (userProfile) {
        setUser(userProfile);
        const onboardingStatus = await authService.isOnboardingCompleted();
        setIsOnboardingCompleted(onboardingStatus);
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await authService.signOut();
      setUser(null);
      setFirebaseUser(null);
      setIsOnboardingCompleted(false);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = async (preferences?: any) => {
    try {
      if (user) {
        await authService.completeOnboarding(user.uid, preferences);
        setIsOnboardingCompleted(true);
        setUser({ ...user, onboardingCompleted: true });
      }
    } catch (error) {
      console.error('Complete onboarding error:', error);
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      if (firebaseUser) {
        const userProfile = await authService.getUserProfile(firebaseUser.uid);
        if (userProfile) {
          setUser(userProfile);
          setIsOnboardingCompleted(userProfile.onboardingCompleted);

          // Mettre à jour le cache local
          await AsyncStorage.setItem('user', JSON.stringify(userProfile));
          await AsyncStorage.setItem('firebaseUid', firebaseUser.uid);
        }
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  const syncFirebaseUid = async () => {
    try {
      await authService.syncFirebaseUid();
    } catch (error) {
      console.error('Error syncing Firebase UID:', error);
    }
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    isLoading,
    isOnboardingCompleted,
    signUp,
    signIn,
    signOut,
    completeOnboarding,
    refreshUser,
    syncFirebaseUid,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
