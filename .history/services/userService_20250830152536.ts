import { auth, db } from '@/config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

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
  // Obtenir l'ID Firebase actuel de manière sécurisée
  private async getCurrentUid(): Promise<string | null> {
    try {
      // D'abord essayer de récupérer depuis le cache
      const cachedUid = await AsyncStorage.getItem('firebaseUid');
      if (cachedUid) {
        return cachedUid;
      }

      // Si pas de cache, vérifier l'utilisateur Firebase actuel
      if (auth.currentUser) {
        const uid = auth.currentUser.uid;
        await AsyncStorage.setItem('firebaseUid', uid);
        return uid;
      }

      return null;
    } catch (error) {
      console.error('Error getting current UID:', error);
      return null;
    }
  }

  // Sauvegarder les paramètres de notifications dans Firestore ou local si pas connecté
  async saveNotificationSettings(settings: any): Promise<void> {
    try {
      const uid = await this.getCurrentUid();
      if (!uid) {
        // Stocker en local si pas encore connecté
        await AsyncStorage.setItem('notificationSettings_pending', JSON.stringify(settings));
        await AsyncStorage.setItem('notificationSettings', JSON.stringify(settings));
        return;
      }
      // Mettre à jour Firestore (crée le doc si absent)
      await setDoc(
        doc(db, 'users', uid),
        {
          notificationSettings: settings,
        },
        { merge: true }
      );
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(settings));
      // Nettoyer le pending si existait
      await AsyncStorage.removeItem('notificationSettings_pending');
    } catch (error) {
      console.error('Error saving notification settings:', error);
      throw error;
    }
  }

  // À appeler après création du user pour synchroniser les settings en attente
  async syncPendingNotificationSettings(): Promise<void> {
    try {
      const pending = await AsyncStorage.getItem('notificationSettings_pending');
      const uid = await this.getCurrentUid();
      if (pending && uid) {
        const settings = JSON.parse(pending);
        await setDoc(
          doc(db, 'users', uid),
          {
            notificationSettings: settings,
          },
          { merge: true }
        );
        await AsyncStorage.setItem('notificationSettings', JSON.stringify(settings));
        await AsyncStorage.removeItem('notificationSettings_pending');
      }
    } catch (error) {
      console.error('Error syncing pending notification settings:', error);
    }
  }

  // Lire les paramètres de notifications depuis Firestore ou cache
  async getNotificationSettings(): Promise<any | null> {
    try {
      // D'abord essayer le cache local
      const cached = await AsyncStorage.getItem('notificationSettings');
      if (cached) return JSON.parse(cached);

      const uid = await this.getCurrentUid();
      if (!uid) return null;

      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.notificationSettings) {
          await AsyncStorage.setItem(
            'notificationSettings',
            JSON.stringify(data.notificationSettings)
          );
          return data.notificationSettings;
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting notification settings:', error);
      return null;
    }
  }

  // Récupérer les paramètres généraux de l'utilisateur
  async getUserGeneralSettings(): Promise<UserGeneralSettings | null> {
    try {
      // D'abord essayer de récupérer depuis le cache local
      const cachedSettings = await AsyncStorage.getItem('userGeneralSettings');
      if (cachedSettings) {
        return JSON.parse(cachedSettings);
      }

      // Si pas de cache, récupérer depuis Firebase
      const uid = await this.getCurrentUid();
      if (!uid) {
        return null;
      }

      const userDoc = await getDoc(doc(db, 'users', uid));
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
        language: 'Français',
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
      const uid = await this.getCurrentUid();
      if (!uid) {
        throw new Error('Utilisateur non connecté');
      }

      // Récupérer les paramètres actuels
      const currentSettings = await this.getUserGeneralSettings();
      const updatedSettings = {
        ...currentSettings,
        ...settings,
      };

      // Sauvegarder dans Firebase
      await updateDoc(doc(db, 'users', uid), {
        generalSettings: updatedSettings,
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
        [key]: value,
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
        language: 'Français',
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
      const uid = await this.getCurrentUid();
      if (!uid) {
        return null;
      }

      const userDoc = await getDoc(doc(db, 'users', uid));
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
