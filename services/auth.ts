import { auth, db } from '@/config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  onAuthStateChanged,
  signInAnonymously,
  signOut as firebaseSignOut,
  User,
} from 'firebase/auth';
import { collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { userService } from './userService';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  onboardingCompleted: boolean;
  createdAt: Date;
  preferences?: {
    reminderTime?: string;
    reminderFrequency?: 'morning' | 'evening' | 'daily';
    notificationsEnabled?: boolean;
  };
}

class AuthService {
  // Créer un utilisateur anonyme puis l'associer à un email
  async createUserWithEmailOnly(email: string, name: string): Promise<UserProfile> {
    try {
      // Vérifier d'abord si l'email existe déjà
      const existingUser = await this.findUserByEmail(email);
      if (existingUser) {
        throw new Error('Cette adresse email est déjà utilisée');
      }

      // Créer un utilisateur anonyme
      const anonCredential = await signInAnonymously(auth);
      const user = anonCredential.user;

      // Créer le profil utilisateur dans Firestore avec l'email
      const userProfile: UserProfile = {
        uid: user.uid,
        email: email,
        name: name,
        onboardingCompleted: false,
        createdAt: new Date(),
        preferences: {
          notificationsEnabled: false,
        },
      };

      await setDoc(doc(db, 'users', user.uid), userProfile);

      // Initialiser les paramètres généraux avec le nom fourni
      await userService.initializeGeneralSettings(name);

      // Sauvegarder localement
      await AsyncStorage.setItem('user', JSON.stringify(userProfile));
      await AsyncStorage.setItem('onboardingCompleted', 'false');
      await AsyncStorage.setItem('userEmail', email);

      return userProfile;
    } catch (error: any) {
      console.error('Error creating user:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // Trouver un utilisateur par email dans Firestore
  async findUserByEmail(email: string): Promise<UserProfile | null> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as UserProfile;
      }

      return null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      return null;
    }
  }

  // Connexion avec email (retrouver l'utilisateur existant)
  async signInWithEmail(email: string): Promise<UserProfile | null> {
    try {
      // Chercher l'utilisateur par email dans Firestore
      const userProfile = await this.findUserByEmail(email);

      if (!userProfile) {
        throw new Error('Aucun compte trouvé avec cette adresse email');
      }

      // Se connecter anonymement (nouveau session)
      await signInAnonymously(auth);

      // Sauvegarder le profil localement
      await AsyncStorage.setItem('user', JSON.stringify(userProfile));
      await AsyncStorage.setItem('userEmail', email);

      // Initialiser les paramètres généraux si ce n'est pas déjà fait
      await userService.initializeGeneralSettings(userProfile.name);

      return userProfile;
    } catch (error: any) {
      console.error('Error signing in:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // Récupérer le profil utilisateur depuis Firestore
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  // Marquer l'onboarding comme terminé
  async completeOnboarding(uid: string, preferences?: any): Promise<void> {
    try {
      // Récupérer d'abord les informations utilisateur depuis le cache local
      const userString = await AsyncStorage.getItem('user');
      const userEmail = await AsyncStorage.getItem('userEmail');

      if (!userString || !userEmail) {
        throw new Error('Informations utilisateur manquantes');
      }

      const userProfile = JSON.parse(userString);

      // Créer ou mettre à jour le document utilisateur avec toutes les informations nécessaires
      await setDoc(
        doc(db, 'users', uid),
        {
          uid: uid,
          email: userEmail,
          name: userProfile.name || '',
          onboardingCompleted: true,
          createdAt: userProfile.createdAt || new Date(),
          preferences: {
            ...userProfile.preferences,
            ...preferences,
          },
        },
        { merge: true }
      );

      // Mettre à jour le cache local
      await AsyncStorage.setItem('onboardingCompleted', 'true');

      userProfile.onboardingCompleted = true;
      if (preferences) {
        userProfile.preferences = { ...userProfile.preferences, ...preferences };
      }
      await AsyncStorage.setItem('user', JSON.stringify(userProfile));
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  }

  // Vérifier si l'onboarding est terminé
  async isOnboardingCompleted(): Promise<boolean> {
    try {
      // Vérifier d'abord localement
      const local = await AsyncStorage.getItem('onboardingCompleted');
      if (local === 'true') return true;

      // Vérifier avec l'email utilisateur
      const email = await AsyncStorage.getItem('userEmail');
      if (email) {
        const profile = await this.findUserByEmail(email);
        return profile?.onboardingCompleted || false;
      }

      return false;
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  }

  // Déconnexion
  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
      await userService.clearCache(); // Nettoyer le cache des paramètres utilisateur
      await AsyncStorage.multiRemove(['user', 'onboardingCompleted', 'userName', 'userEmail']);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  // Écouter les changements d'état d'authentification
  onAuthStateChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  // Obtenir l'utilisateur connecté depuis le cache
  async getCurrentUserProfile(): Promise<UserProfile | null> {
    try {
      const user = await AsyncStorage.getItem('user');
      if (user) {
        return JSON.parse(user);
      }

      // Si pas de cache, vérifier par email
      const email = await AsyncStorage.getItem('userEmail');
      if (email) {
        return await this.findUserByEmail(email);
      }

      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Messages d'erreur en français
  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'Cette adresse email est déjà utilisée';
      case 'auth/invalid-email':
        return 'Adresse email invalide';
      case 'auth/user-not-found':
        return 'Utilisateur non trouvé';
      case 'auth/wrong-password':
        return 'Mot de passe incorrect';
      case 'auth/weak-password':
        return 'Le mot de passe doit contenir au moins 6 caractères';
      case 'auth/network-request-failed':
        return 'Erreur de connexion réseau';
      default:
        return "Une erreur est survenue lors de l'authentification";
    }
  }
}

export const authService = new AuthService();
