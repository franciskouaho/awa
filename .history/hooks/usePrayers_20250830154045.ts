import { PrayerData, PrayerService } from '@/services/prayerService';
import { useCallback, useState } from 'react';

export interface UsePrayersResult {
  prayers: PrayerData[];
  loading: boolean;
  error: string | null;
  addPrayer: (
    prayerData: Omit<PrayerData, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<{ success: boolean; id?: string; error?: string }>;
  loadPrayers: () => Promise<void>;
  incrementPrayerCount: (prayerId: string) => Promise<{ success: boolean; error?: string }>;
  searchPrayers: (
    searchTerm: string
  ) => Promise<{ success: boolean; data?: PrayerData[]; error?: string }>;
  updatePrayer: (
    prayerId: string,
    updates: Partial<PrayerData>
  ) => Promise<{ success: boolean; error?: string }>;
  refreshPrayers: () => Promise<void>;
}

export function usePrayers(): UsePrayersResult {
  const [prayers, setPrayers] = useState<PrayerData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger toutes les prières
  const loadPrayers = useCallback(async () => {
    console.log('🔄 usePrayers: Début du chargement des prières');
    setLoading(true);
    setError(null);

    try {
      console.log('📡 usePrayers: Appel à PrayerService.getAllPrayers()');
      const result = await PrayerService.getAllPrayers();
      console.log('📊 usePrayers: Résultat reçu:', result);

      if (result.success && result.data) {
        console.log(`✅ usePrayers: ${result.data.length} prières chargées avec succès`);
        setPrayers(result.data);
      } else {
        console.error('❌ usePrayers: Erreur lors du chargement:', result.error);
        setError(result.error || 'Erreur lors du chargement des prières');
      }
    } catch (err: any) {
      console.error('💥 usePrayers: Exception lors du chargement:', err);
      setError(err.message || 'Erreur inattendue');
    } finally {
      setLoading(false);
      console.log('🏁 usePrayers: Chargement terminé');
    }
  }, []);

  // Ajouter une nouvelle prière
  const addPrayer = useCallback(
    async (prayerData: Omit<PrayerData, 'id' | 'createdAt' | 'updatedAt'>) => {
      const result = await PrayerService.addPrayer(prayerData);

      if (result.success) {
        // Recharger la liste après ajout
        await loadPrayers();
      }

      return result;
    },
    [loadPrayers]
  );

  // Incrémenter le compteur de prières
  const incrementPrayerCount = useCallback(async (prayerId: string) => {
    const result = await PrayerService.incrementPrayerCount(prayerId);

    if (result.success) {
      // Mettre à jour localement pour un feedback immédiat
      setPrayers(current =>
        current.map(prayer =>
          prayer.id === prayerId ? { ...prayer, prayerCount: prayer.prayerCount + 1 } : prayer
        )
      );
    }

    return result;
  }, []);

  // Rechercher des prières
  const searchPrayers = useCallback(async (searchTerm: string) => {
    return await PrayerService.searchPrayersByName(searchTerm);
  }, []);

  // Mettre à jour une prière
  const updatePrayer = useCallback(async (prayerId: string, updates: Partial<PrayerData>) => {
    const result = await PrayerService.updatePrayer(prayerId, updates);

    if (result.success) {
      // Mettre à jour localement
      setPrayers(current =>
        current.map(prayer => (prayer.id === prayerId ? { ...prayer, ...updates } : prayer))
      );
    }

    return result;
  }, []);

  // Actualiser les prières (alias pour loadPrayers)
  const refreshPrayers = useCallback(async () => {
    await loadPrayers();
  }, [loadPrayers]);

  return {
    prayers,
    loading,
    error,
    addPrayer,
    loadPrayers,
    incrementPrayerCount,
    searchPrayers,
    updatePrayer,
    refreshPrayers,
  };
}
