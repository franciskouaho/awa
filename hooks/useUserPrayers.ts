import { PrayerData, PrayerService } from '@/services/prayerService';
import { UserPrayerService } from '@/services/userPrayerService';
import { PRAYER_EVENTS, prayerEventEmitter } from '@/utils/eventEmitter';
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

export function useUserPrayers(userId: string): UseUserPrayersResult {
  const [completedPrayers, setCompletedPrayers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prayers, setPrayers] = useState<PrayerData[]>([]);

  // Initialiser les IDs utilisateur et appareil
  // Plus besoin d'initialisation locale de userId

  // Charger les prières effectuées par l'utilisateur
  const loadUserPrayers = useCallback(async () => {
  if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      // Récupérer les IDs des prières de l'utilisateur
  const result = await UserPrayerService.getUserPrayers(userId);

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
  }, [userId]);

  // Fonction pour supprimer une prière de l'utilisateur
  const deletePrayer = useCallback(
    async (prayerId: string) => {
  if (!userId) return { success: false, error: 'ID utilisateur non disponible' };
      try {
  const result = await UserPrayerService.removePrayerCompleted(prayerId, userId);
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
  [userId]
  );

  // Recharger les prières quand les IDs sont disponibles
  useEffect(() => {
  if (userId) {
      loadUserPrayers();
    }
  }, [userId, loadUserPrayers]);

  // Écouter les événements de suppression de prière pour recharger la liste
  useEffect(() => {
    const handlePrayerDeleted = () => {
      console.log('🔄 useUserPrayers: Prière supprimée détectée, rechargement de la liste...');
      if (userId) {
        loadUserPrayers();
      }
    };

    // Écouter l'événement de suppression
    prayerEventEmitter.on(PRAYER_EVENTS.PRAYER_DELETED, handlePrayerDeleted);
    
    return () => {
      prayerEventEmitter.off(PRAYER_EVENTS.PRAYER_DELETED, handlePrayerDeleted);
    };
  }, [loadUserPrayers, userId]);

  // Basculer l'état d'une prière
  const togglePrayerCompleted = useCallback(
    async (prayerId: string) => {
  if (!userId) {
        return { success: false, error: 'IDs utilisateur non disponibles' };
      }

      try {
  const result = await UserPrayerService.togglePrayerCompleted(prayerId, userId);

        if (result.success) {
          // Mettre à jour localement pour un feedback immédiat
          setCompletedPrayers(current => {
            const newSet = new Set(current);
            if (result.isCompleted) {
              newSet.add(prayerId);
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
  [userId]
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
