import { UserGeneralSettings, userService } from '@/services/userService';
import { useCallback, useEffect, useState } from 'react';

export function useUserSettings() {
  const [settings, setSettings] = useState<UserGeneralSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les paramètres utilisateur
  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const userSettings = await userService.getUserGeneralSettings();
      setSettings(userSettings);
    } catch (err) {
      console.error('Error loading user settings:', err);
      setError('Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  }, []);

  // Sauvegarder un paramètre spécifique
  const saveSetting = useCallback(async (key: keyof UserGeneralSettings, value: string) => {
    try {
      setError(null);
      await userService.saveGeneralSetting(key, value);
      
      // Mettre à jour l'état local
      setSettings(prev => prev ? { ...prev, [key]: value } : null);
      
      return true;
    } catch (err) {
      console.error(`Error saving ${key}:`, err);
      setError(`Erreur lors de la sauvegarde de ${key}`);
      return false;
    }
  }, []);

  // Sauvegarder tous les paramètres
  const saveAllSettings = useCallback(async (newSettings: Partial<UserGeneralSettings>) => {
    try {
      setError(null);
      await userService.saveUserGeneralSettings(newSettings);
      
      // Mettre à jour l'état local
      setSettings(prev => prev ? { ...prev, ...newSettings } : null);
      
      return true;
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Erreur lors de la sauvegarde des paramètres');
      return false;
    }
  }, []);

  // Initialiser les paramètres avec des valeurs par défaut
  const initializeSettings = useCallback(async (firstName?: string) => {
    try {
      setError(null);
      await userService.initializeGeneralSettings(firstName);
      await loadSettings(); // Recharger après l'initialisation
      return true;
    } catch (err) {
      console.error('Error initializing settings:', err);
      setError('Erreur lors de l\'initialisation des paramètres');
      return false;
    }
  }, [loadSettings]);

  // Synchroniser avec Firebase
  const syncWithFirebase = useCallback(async () => {
    try {
      setError(null);
      const syncedSettings = await userService.syncWithFirebase();
      if (syncedSettings) {
        setSettings(syncedSettings);
      }
      return true;
    } catch (err) {
      console.error('Error syncing with Firebase:', err);
      setError('Erreur lors de la synchronisation');
      return false;
    }
  }, []);

  // Rafraîchir les paramètres
  const refreshSettings = useCallback(async () => {
    await loadSettings();
  }, [loadSettings]);

  // Charger les paramètres au montage du composant
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    loading,
    error,
    saveSetting,
    saveAllSettings,
    initializeSettings,
    syncWithFirebase,
    refreshSettings,
    reload: loadSettings
  };
}
