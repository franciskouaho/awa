import { StreakData, StreakService } from '@/services/streakService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import { useCallback, useEffect, useState } from 'react';

export interface UseStreakResult {
  streakData: StreakData | null;
  loading: boolean;
  error: string | null;
  recordPrayer: () => Promise<{ success: boolean; error?: string }>;
  refreshStreak: () => Promise<void>;
  getWeeklyProgress: () => { date: string; completed: boolean; dayName: string }[];
}

const USER_ID_KEY = 'user_id';

export function useStreak(): UseStreakResult {
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [deviceId, setDeviceId] = useState<string>('');

  // Initialiser les IDs utilisateur et appareil
  useEffect(() => {
    const initializeIds = async () => {
      try {
        // Récupérer ou créer un ID utilisateur persistant
        let storedUserId = await AsyncStorage.getItem(USER_ID_KEY);
        if (!storedUserId) {
          storedUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          await AsyncStorage.setItem(USER_ID_KEY, storedUserId);
        }
        setUserId(storedUserId);

        // Récupérer l'ID de l'appareil
        let appDeviceId = `device_${Date.now()}`;
        try {
          const androidId = await Application.getAndroidId();
          if (androidId) {
            appDeviceId = androidId;
          } else {
            const iosId = await Application.getIosIdForVendorAsync();
            if (iosId) {
              appDeviceId = iosId;
            }
          }
        } catch (error) {
          console.warn('Impossible de récupérer l\'ID de l\'appareil:', error);
        }
        setDeviceId(appDeviceId);
      } catch (error) {
        console.error('Erreur lors de l\'initialisation des IDs:', error);
      }
    };

    initializeIds();
  }, []);

  // Charger le streak de l'utilisateur
  const loadStreak = useCallback(async () => {
    if (!userId && !deviceId) return;

    setLoading(true);
    setError(null);
    
    try {
      const result = await StreakService.getUserStreak(userId, deviceId);
      
      if (result.success && result.data) {
        setStreakData(result.data);
      } else {
        setError(result.error || 'Erreur lors du chargement du streak');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur inattendue');
    } finally {
      setLoading(false);
    }
  }, [userId, deviceId]);

  // Charger le streak quand les IDs sont disponibles
  useEffect(() => {
    if (userId || deviceId) {
      loadStreak();
    }
  }, [userId, deviceId, loadStreak]);

  // Enregistrer une prière et mettre à jour le streak
  const recordPrayer = useCallback(async () => {
    if (!userId && !deviceId) {
      return { success: false, error: 'IDs utilisateur non disponibles' };
    }

    try {
      const result = await StreakService.recordPrayerSession(userId, deviceId);
      
      if (result.success && result.data) {
        // Mettre à jour le streak local
        setStreakData(result.data.streak);
      }
      
      return { success: result.success, error: result.error };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erreur lors de l\'enregistrement de la prière' };
    }
  }, [userId, deviceId]);

  // Actualiser le streak
  const refreshStreak = useCallback(async () => {
    await loadStreak();
  }, [loadStreak]);

  // Obtenir le progrès de la semaine avec les noms des jours
  const getWeeklyProgress = useCallback(() => {
    if (!streakData) return [];

    const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    
    return streakData.streakHistory.map(entry => {
      const date = new Date(entry.date);
      const dayName = dayNames[date.getDay()];
      
      return {
        date: entry.date,
        completed: entry.completed,
        dayName
      };
    });
  }, [streakData]);

  return {
    streakData,
    loading,
    error,
    recordPrayer,
    refreshStreak,
    getWeeklyProgress,
  };
}
