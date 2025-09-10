import { useAuth } from '@/contexts/AuthContext';
import { PrayerData, PrayerService } from '@/services/prayerService';
import { PRAYER_EVENTS, prayerEventEmitter } from '@/utils/eventEmitter';
import { useCallback, useEffect, useState } from 'react';

export interface UseUserCreatedPrayersResult {
  prayers: PrayerData[];
  loading: boolean;
  error: string | null;
  refreshPrayers: () => Promise<void>;
  deletePrayer: (prayerId: string) => Promise<{ success: boolean; error?: string }>;
}

export function useUserCreatedPrayers(): UseUserCreatedPrayersResult {
  const { user, firebaseUser, isLoading } = useAuth();
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
    console.log('🔄 useUserCreatedPrayers: Début du chargement');
    
    // Attendre que l'authentification soit prête
    if (isLoading) {
      console.log('⏳ useUserCreatedPrayers: Authentification en cours...');
      return;
    }
    
    const userId = getCurrentUserId();
    console.log('🆔 useUserCreatedPrayers: User ID récupéré:', userId);

    if (!userId) {
      console.log('❌ useUserCreatedPrayers: Aucun utilisateur connecté');
      setError(null); // Ne pas afficher d'erreur
      setPrayers([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('📡 useUserCreatedPrayers: Appel à PrayerService.getPrayersByCreator');
      const result = await PrayerService.getPrayersByCreator(userId);
      console.log('📊 useUserCreatedPrayers: Résultat reçu:', result);

      if (result.success && result.data) {
        console.log(`✅ useUserCreatedPrayers: ${result.data.length} prières chargées avec succès`);
        setPrayers(result.data);
      } else {
        console.error('❌ useUserCreatedPrayers: Erreur lors du chargement:', result.error);
        setPrayers([]);
        setError(result.error || 'Erreur lors du chargement des prières');
      }
    } catch (err: any) {
      console.error('💥 useUserCreatedPrayers: Exception lors du chargement:', err);
      setError(err.message || 'Erreur inattendue');
      setPrayers([]);
    } finally {
      setLoading(false);
      console.log('🏁 useUserCreatedPrayers: Chargement terminé');
    }
  }, [getCurrentUserId, isLoading]);

  // Supprimer une prière
  const deletePrayer = useCallback(
    async (prayerId: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const result = await PrayerService.deletePrayer(prayerId);

        if (result.success) {
          // Mettre à jour localement
          setPrayers(current => current.filter(p => p.id !== prayerId));
          
          // Recharger la liste principale des prières pour mettre à jour prayers.tsx
          // On utilise un événement personnalisé pour notifier les autres composants
          prayerEventEmitter.emit(PRAYER_EVENTS.PRAYER_DELETED, { prayerId });
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
    if (!isLoading) {
      loadUserCreatedPrayers();
    }
  }, [loadUserCreatedPrayers, isLoading]);

  return {
    prayers,
    loading,
    error,
    refreshPrayers,
    deletePrayer,
  };
}
