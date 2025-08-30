import { useAuth } from '@/contexts/AuthContext';
import { PrayerData, PrayerService } from '@/services/prayerService';
import { useCallback, useEffect, useState } from 'react';

export interface UseUserCreatedPrayersResult {
  prayers: PrayerData[];
  loading: boolean;
  error: string | null;
  refreshPrayers: () => Promise<void>;
  deletePrayer: (prayerId: string) => Promise<{ success: boolean; error?: string }>;
}

export function useUserCreatedPrayers(): UseUserCreatedPrayersResult {
  const { user, firebaseUser } = useAuth();
  const [prayers, setPrayers] = useState<PrayerData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Récupérer l'ID utilisateur Firebase
  const getCurrentUserId = useCallback((): string | null => {
    // Priorité 1: Utilisateur du contexte d'authentification
    if (user?.uid) {
      return user.uid;
    }

    // Priorité 2: Utilisateur Firebase actuel
    if (firebaseUser?.uid) {
      return firebaseUser.uid;
    }

    return null;
  }, [user, firebaseUser]);

  // Charger les prières créées par l'utilisateur
  const loadUserCreatedPrayers = useCallback(async () => {
    const userId = getCurrentUserId();
    if (!userId) {
      setError('Utilisateur non connecté');
      setPrayers([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await PrayerService.getPrayersByCreator(userId);

      if (result.success && result.data) {
        setPrayers(result.data);
      } else {
        setPrayers([]);
        setError(result.error || 'Erreur lors du chargement des prières');
      }
    } catch (err: any) {
      console.error('Erreur lors du chargement des prières créées:', err);
      setError(err.message || 'Erreur inattendue');
      setPrayers([]);
    } finally {
      setLoading(false);
    }
  }, [getCurrentUserId]);

  // Supprimer une prière
  const deletePrayer = useCallback(
    async (prayerId: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const result = await PrayerService.deletePrayer(prayerId);

        if (result.success) {
          // Mettre à jour localement
          setPrayers(current => current.filter(p => p.id !== prayerId));
        }

        return result;
      } catch (err: any) {
        console.error('Erreur lors de la suppression:', err);
        return { success: false, error: err.message || 'Erreur lors de la suppression' };
      }
    },
    []
  );

  // Rafraîchir les prières
  const refreshPrayers = useCallback(async () => {
    await loadUserCreatedPrayers();
  }, [loadUserCreatedPrayers]);

  // Charger les prières au montage et quand l'utilisateur change
  useEffect(() => {
    loadUserCreatedPrayers();
  }, [loadUserCreatedPrayers]);

  return {
    prayers,
    loading,
    error,
    refreshPrayers,
    deletePrayer,
  };
}
