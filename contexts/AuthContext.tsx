import { authService, UserProfile } from '@/services/auth';
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(false);

  useEffect(() => {
    // Écouter les changements d'authentification Firebase
    const unsubscribe = authService.onAuthStateChange(async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        // Utilisateur connecté
        const userProfile = await authService.getUserProfile(firebaseUser.uid);
        if (userProfile) {
          setUser(userProfile);
          setIsOnboardingCompleted(userProfile.onboardingCompleted);
        }
      } else {
        // Utilisateur déconnecté
        setUser(null);
        setIsOnboardingCompleted(false);
      }
      
      setIsLoading(false);
    });

    // Vérifier le cache au démarrage
    checkCachedUser();

    return unsubscribe;
  }, []);

  const checkCachedUser = async () => {
    try {
      const cachedUser = await authService.getCurrentUserProfile();
      const onboardingStatus = await authService.isOnboardingCompleted();
      
      if (cachedUser) {
        setUser(cachedUser);
        setIsOnboardingCompleted(onboardingStatus);
      }
    } catch (error) {
      console.error('Error checking cached user:', error);
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
        }
      }
    } catch (error) {
      console.error('Refresh user error:', error);
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
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
