import { StreakService } from '@/services/streakService';
import { UserPrayerService } from '@/services/userPrayerService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import { useCallback, useEffect, useState } from 'react';

export interface UseUserPrayersResult {
  completedPrayers: Set<string>;
  loading: boolean;
  error: string | null;
  togglePrayerCompleted: (prayerId: string) => Promise<{ success: boolean; isCompleted?: boolean; error?: string }>;
  isPrayerCompleted: (prayerId: string) => boolean;
  loadUserPrayers: () => Promise<void>;
}

const USER_ID_KEY = 'user_id';

export function useUserPrayers(): UseUserPrayersResult {
  const [completedPrayers, setCompletedPrayers] = useState<Set<string>>(new Set());
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

        // Charger les prières de l'utilisateur
        await loadUserPrayers();
      } catch (error) {
        console.error('Erreur lors de l\'initialisation des IDs:', error);
      }
    };

    initializeIds();
  }, []);

  // Charger les prières effectuées par l'utilisateur
  const loadUserPrayers = useCallback(async () => {
    if (!userId && !deviceId) return;

    setLoading(true);
    setError(null);
    
    try {
      const result = await UserPrayerService.getUserPrayers(userId, deviceId);
      
      if (result.success && result.data) {
        setCompletedPrayers(new Set(result.data));
      } else {
        setError(result.error || 'Erreur lors du chargement des prières utilisateur');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur inattendue');
    } finally {
      setLoading(false);
    }
  }, [userId, deviceId]);

  // Recharger les prières quand les IDs sont disponibles
  useEffect(() => {
    if (userId || deviceId) {
      loadUserPrayers();
    }
  }, [userId, deviceId, loadUserPrayers]);

  // Basculer l'état d'une prière
  const togglePrayerCompleted = useCallback(async (prayerId: string) => {
    if (!userId && !deviceId) {
      return { success: false, error: 'IDs utilisateur non disponibles' };
    }

    try {
      const result = await UserPrayerService.togglePrayerCompleted(prayerId, userId, deviceId);
      
      if (result.success) {
        // Mettre à jour localement pour un feedback immédiat
        setCompletedPrayers(current => {
          const newSet = new Set(current);
          if (result.isCompleted) {
            newSet.add(prayerId);
            
            // Enregistrer la prière dans le service de streak seulement si elle est complétée
            StreakService.recordPrayerSession(userId, deviceId).catch(error => {
              console.warn('Erreur lors de l\'enregistrement du streak:', error);
            });
          } else {
            newSet.delete(prayerId);
          }
          return newSet;
        });
      }
      
      return result;
    } catch (err: any) {
      return { success: false, error: err.message || 'Erreur lors du toggle de la prière' };
    }
  }, [userId, deviceId]);

  // Vérifier si une prière est effectuée
  const isPrayerCompleted = useCallback((prayerId: string) => {
    return completedPrayers.has(prayerId);
  }, [completedPrayers]);

  return {
    completedPrayers,
    loading,
    error,
    togglePrayerCompleted,
    isPrayerCompleted,
    loadUserPrayers,
  };
}
