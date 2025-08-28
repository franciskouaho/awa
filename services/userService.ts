import { auth, db } from '@/config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export interface UserGeneralSettings {
  firstName: string;
  gender: 'Homme' | 'Femme' | 'Autre';
  language: 'Français' | 'English' | 'Español';
}

export interface UserProfileExtended {
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
  generalSettings?: UserGeneralSettings;
}

class UserService {
  // Récupérer les paramètres généraux de l'utilisateur
  async getUserGeneralSettings(): Promise<UserGeneralSettings | null> {
    try {
      // D'abord essayer de récupérer depuis le cache local
      const cachedSettings = await AsyncStorage.getItem('userGeneralSettings');
      if (cachedSettings) {
        return JSON.parse(cachedSettings);
      }

      // Si pas de cache, récupérer depuis Firebase
      const userEmail = await AsyncStorage.getItem('userEmail');
      if (!userEmail || !auth.currentUser) {
        return null;
      }

      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const settings = userData.generalSettings;
        
        if (settings) {
          // Mettre en cache pour les prochaines fois
          await AsyncStorage.setItem('userGeneralSettings', JSON.stringify(settings));
          return settings;
        }
      }

      // Retourner des valeurs par défaut si rien n'est trouvé
      const defaultSettings: UserGeneralSettings = {
        firstName: 'Utilisateur',
        gender: 'Autre',
        language: 'Français'
      };

      return defaultSettings;
    } catch (error) {
      console.error('Error getting user general settings:', error);
      return null;
    }
  }

  // Sauvegarder les paramètres généraux de l'utilisateur
  async saveUserGeneralSettings(settings: Partial<UserGeneralSettings>): Promise<void> {
    try {
      if (!auth.currentUser) {
        throw new Error('Utilisateur non connecté');
      }

      // Récupérer les paramètres actuels
      const currentSettings = await this.getUserGeneralSettings();
      const updatedSettings = {
        ...currentSettings,
        ...settings
      };

      // Sauvegarder dans Firebase
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        generalSettings: updatedSettings
      });

      // Mettre à jour le cache local
      await AsyncStorage.setItem('userGeneralSettings', JSON.stringify(updatedSettings));

      console.log('User general settings saved successfully');
    } catch (error) {
      console.error('Error saving user general settings:', error);
      throw error;
    }
  }

  // Sauvegarder un paramètre spécifique
  async saveGeneralSetting(key: keyof UserGeneralSettings, value: string): Promise<void> {
    try {
      const currentSettings = await this.getUserGeneralSettings();
      const updatedSettings = {
        ...currentSettings,
        [key]: value
      } as UserGeneralSettings;

      await this.saveUserGeneralSettings(updatedSettings);
    } catch (error) {
      console.error(`Error saving ${key} setting:`, error);
      throw error;
    }
  }

  // Initialiser les paramètres généraux avec des valeurs par défaut
  async initializeGeneralSettings(firstName?: string): Promise<void> {
    try {
      const existingSettings = await this.getUserGeneralSettings();
      
      // Si les paramètres existent déjà, ne pas les écraser
      if (existingSettings && existingSettings.firstName !== 'Utilisateur') {
        return;
      }

      const defaultSettings: UserGeneralSettings = {
        firstName: firstName || 'Utilisateur',
        gender: 'Autre',
        language: 'Français'
      };

      await this.saveUserGeneralSettings(defaultSettings);
    } catch (error) {
      console.error('Error initializing general settings:', error);
      throw error;
    }
  }

  // Nettoyer le cache local
  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem('userGeneralSettings');
    } catch (error) {
      console.error('Error clearing user settings cache:', error);
    }
  }

  // Synchroniser avec Firebase (utile en cas de problème de synchronisation)
  async syncWithFirebase(): Promise<UserGeneralSettings | null> {
    try {
      if (!auth.currentUser) {
        return null;
      }

      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const settings = userData.generalSettings;
        
        if (settings) {
          // Mettre à jour le cache
          await AsyncStorage.setItem('userGeneralSettings', JSON.stringify(settings));
          return settings;
        }
      }

      return null;
    } catch (error) {
      console.error('Error syncing with Firebase:', error);
      return null;
    }
  }
}

export const userService = new UserService();
