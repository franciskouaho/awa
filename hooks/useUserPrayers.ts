import { StreakService } from '@/services/streakService';
import { PrayerData, PrayerService } from '@/services/prayerService';
import { UserPrayerService } from '@/services/userPrayerService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import { useCallback, useEffect, useState } from 'react';

export interface UserPrayerItem {
  id: string;
  text: string;
}

export interface UseUserPrayersResult {
  completedPrayers: Set<string>;
  loading: boolean;
  error: string | null;
  prayers: PrayerData[];
  deletePrayer: (prayerId: string) => Promise<{ success: boolean; error?: string }>;
  togglePrayerCompleted: (
    prayerId: string
  ) => Promise<{ success: boolean; isCompleted?: boolean; error?: string }>;
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
  const [prayers, setPrayers] = useState<PrayerData[]>([]);

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
          console.warn("Impossible de récupérer l'ID de l'appareil:", error);
        }
        setDeviceId(appDeviceId);

        // Charger les prières de l'utilisateur
        await loadUserPrayers();
      } catch (error) {
        console.error("Erreur lors de l'initialisation des IDs:", error);
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
      // Récupérer les IDs des prières de l'utilisateur
      const result = await UserPrayerService.getUserPrayers(userId, deviceId);

      if (result.success && result.data) {
        setCompletedPrayers(new Set(result.data));
        // Récupérer toutes les prières
        const allPrayersRes = await PrayerService.getAllPrayers();
        if (allPrayersRes.success && allPrayersRes.data) {
          // Filtrer celles de l'utilisateur
          const userPrayers = allPrayersRes.data.filter(prayer =>
            result.data!.includes(prayer.id!)
          );
          setPrayers(userPrayers);
        } else {
          setPrayers([]);
        }
      } else {
        setCompletedPrayers(new Set());
        setPrayers([]);
        setError(result.error || 'Erreur lors du chargement des prières utilisateur');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur inattendue');
      setPrayers([]);
    } finally {
      setLoading(false);
    }
  }, [userId, deviceId]);

  // Fonction pour supprimer une prière de l'utilisateur
  const deletePrayer = useCallback(
    async (prayerId: string) => {
      if (!userId && !deviceId) return { success: false, error: 'IDs utilisateur non disponibles' };
      try {
        const result = await UserPrayerService.removePrayerCompleted(prayerId, userId, deviceId);
        if (result.success) {
          // Mettre à jour localement
          setPrayers(prayers => prayers.filter(p => p.id !== prayerId));
          setCompletedPrayers(current => {
            const newSet = new Set(current);
            newSet.delete(prayerId);
            return newSet;
          });
        }
        return result;
      } catch (err: any) {
        return { success: false, error: err.message || 'Erreur lors de la suppression' };
      }
    },
    [userId, deviceId]
  );

  // Recharger les prières quand les IDs sont disponibles
  useEffect(() => {
    if (userId || deviceId) {
      loadUserPrayers();
    }
  }, [userId, deviceId, loadUserPrayers]);

  // Basculer l'état d'une prière
  const togglePrayerCompleted = useCallback(
    async (prayerId: string) => {
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
                console.warn("Erreur lors de l'enregistrement du streak:", error);
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
    },
    [userId, deviceId]
  );

  // Vérifier si une prière est effectuée
  const isPrayerCompleted = useCallback(
    (prayerId: string) => {
      return completedPrayers.has(prayerId);
    },
    [completedPrayers]
  );

  return {
    completedPrayers,
    loading,
    error,
    prayers,
    deletePrayer,
    togglePrayerCompleted,
    isPrayerCompleted,
    loadUserPrayers,
  };
}
